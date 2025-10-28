/**
 * POST /api/documents/upload - Upload and process document
 *
 * This endpoint:
 * 1. Receives a file upload
 * 2. Stores it in Supabase Storage
 * 3. Parses the document to extract text
 * 4. Uses Claude AI to extract structured data
 * 5. Saves metadata and extractions to database
 */

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { parseDocument, validateDocument, getFileTypeCategory } from "@/lib/documents/parser";
import { extractDocumentData } from "@/lib/documents/extractor";

export async function POST(request: Request) {
  console.log("[/api/documents/upload] POST request received");

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[/api/documents/upload] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[/api/documents/upload] User authenticated: ${user.id}`);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const orgId = formData.get("orgId") as string;

    if (!file || !orgId) {
      return NextResponse.json(
        { error: "Missing file or organization ID" },
        { status: 400 }
      );
    }

    console.log(`[/api/documents/upload] File: ${file.name} (${file.size} bytes) | Org: ${orgId}`);

    // Validate file
    const validation = validateDocument(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Verify user has access to organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (!membership) {
      console.error("[/api/documents/upload] User does not have access to organization");
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${orgId}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    console.log(`[/api/documents/upload] Uploading to storage: ${storagePath}`);
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[/api/documents/upload] Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file", details: uploadError.message },
        { status: 500 }
      );
    }

    console.log("[/api/documents/upload] File uploaded successfully");

    // Use service role to create database record
    const serviceSupabase = createServerClient();
    const fileType = getFileTypeCategory(file.type);

    // Create initial document record
    const { data: document, error: docError } = await serviceSupabase
      .from("document_uploads")
      .insert({
        org_id: orgId,
        uploaded_by: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: fileType,
        mime_type: file.type,
        storage_path: storagePath,
        status: "processing",
      } as any)
      .select()
      .single() as any;

    if (docError || !document) {
      console.error("[/api/documents/upload] Database insert error:", docError);
      return NextResponse.json(
        { error: "Failed to create document record", details: docError?.message },
        { status: 500 }
      );
    }

    console.log(`[/api/documents/upload] Document record created: ${document.id}`);

    // Process document asynchronously (return immediately but continue processing)
    processDocumentAsync(document.id, buffer, file.type, serviceSupabase);

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          file_name: document.file_name,
          status: document.status,
        },
        message: "Document uploaded successfully. Processing in background.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/documents/upload] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * Process document asynchronously
 */
async function processDocumentAsync(
  documentId: string,
  buffer: Buffer,
  mimeType: string,
  supabase: any
) {
  try {
    console.log(`[processDocumentAsync] Processing document: ${documentId}`);

    // Parse document to extract text
    const parsed = await parseDocument(buffer, mimeType);
    console.log(`[processDocumentAsync] Extracted ${parsed.text.length} characters of text`);

    // Extract structured data using Claude AI
    const extraction = await extractDocumentData(parsed.text);

    // Update document record with results
    const { error: updateError } = await supabase
      .from("document_uploads")
      .update({
        status: "completed",
        extracted_text: parsed.text.substring(0, 50000), // Limit to 50k chars
        extracted_data: extraction.extractions,
        document_type: extraction.classification.documentType,
        confidence_score: extraction.classification.confidence,
        processed_at: new Date().toISOString(),
      } as any)
      .eq("id", documentId);

    if (updateError) {
      console.error(`[processDocumentAsync] Update error:`, updateError);
      throw updateError;
    }

    // Create extraction records for each type found
    const extractionRecords = [];

    if (extraction.extractions.contacts) {
      extractionRecords.push({
        document_id: documentId,
        org_id: (await supabase.from("document_uploads").select("org_id").eq("id", documentId).single()).data.org_id,
        extraction_type: "contacts",
        extracted_data: { contacts: extraction.extractions.contacts },
        tokens_used: extraction.totalTokensUsed,
        confidence_score: extraction.classification.confidence,
        model_used: "claude-sonnet-4-20250514",
      });
    }

    if (extraction.extractions.equipment) {
      extractionRecords.push({
        document_id: documentId,
        org_id: (await supabase.from("document_uploads").select("org_id").eq("id", documentId).single()).data.org_id,
        extraction_type: "equipment",
        extracted_data: { equipment: extraction.extractions.equipment },
        tokens_used: extraction.totalTokensUsed,
        confidence_score: extraction.classification.confidence,
        model_used: "claude-sonnet-4-20250514",
      });
    }

    if (extraction.extractions.facility_info) {
      extractionRecords.push({
        document_id: documentId,
        org_id: (await supabase.from("document_uploads").select("org_id").eq("id", documentId).single()).data.org_id,
        extraction_type: "facility_info",
        extracted_data: extraction.extractions.facility_info,
        tokens_used: extraction.totalTokensUsed,
        confidence_score: extraction.classification.confidence,
        model_used: "claude-sonnet-4-20250514",
      });
    }

    if (extraction.extractions.procedures) {
      extractionRecords.push({
        document_id: documentId,
        org_id: (await supabase.from("document_uploads").select("org_id").eq("id", documentId).single()).data.org_id,
        extraction_type: "procedures",
        extracted_data: { procedures: extraction.extractions.procedures },
        tokens_used: extraction.totalTokensUsed,
        confidence_score: extraction.classification.confidence,
        model_used: "claude-sonnet-4-20250514",
      });
    }

    if (extractionRecords.length > 0) {
      const { error: extractionError } = await supabase
        .from("document_extractions")
        .insert(extractionRecords as any);

      if (extractionError) {
        console.error("[processDocumentAsync] Extraction insert error:", extractionError);
      }
    }

    console.log(`[processDocumentAsync] Processing complete for document: ${documentId}`);
  } catch (error) {
    console.error(`[processDocumentAsync] Error processing document:`, error);

    // Mark document as failed
    await supabase
      .from("document_uploads")
      .update({
        status: "failed",
        processing_error: error instanceof Error ? error.message : "Unknown error",
        processed_at: new Date().toISOString(),
      } as any)
      .eq("id", documentId);
  }
}
