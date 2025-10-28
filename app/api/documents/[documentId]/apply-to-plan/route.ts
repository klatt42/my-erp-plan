/**
 * POST /api/documents/[documentId]/apply-to-plan
 *
 * Applies extracted data from a document to the active emergency plan
 */

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  const { documentId } = params;
  console.log(`[/api/documents/${documentId}/apply-to-plan] POST request received`);

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orgId, selectedSections } = body as {
      orgId: string;
      selectedSections: {
        contacts: boolean;
        procedures: boolean;
        facilityInfo: boolean;
        equipment: boolean;
      };
    };

    console.log(`[/api/documents/${documentId}/apply-to-plan] User: ${user.id}, Org: ${orgId}`);
    console.log(`[/api/documents/${documentId}/apply-to-plan] Selected sections:`, selectedSections);

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Verify user has access to the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Get the document
    const { data: document } = await supabase
      .from("document_uploads")
      .select("*")
      .eq("id", documentId)
      .eq("org_id", orgId)
      .single();

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.status !== "completed") {
      return NextResponse.json(
        { error: "Document processing is not complete" },
        { status: 400 }
      );
    }

    // Get or create active plan for this organization
    const serviceSupabase = createServerClient();

    // First try to find an active plan
    let { data: activePlans, error: activeError } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "active");

    console.log(`[/api/documents/${documentId}/apply-to-plan] Found ${activePlans?.length || 0} active plans`);

    let activePlan = activePlans?.[0] || null;

    // If no active plan, get the most recent draft
    if (!activePlan) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] No active plan, looking for draft...`);

      const { data: draftPlans, error: draftError } = await supabase
        .from("emergency_plans")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      console.log(`[/api/documents/${documentId}/apply-to-plan] Found ${draftPlans?.length || 0} draft plans`);

      activePlan = draftPlans?.[0] || null;
    }

    if (!activePlan) {
      console.error(`[/api/documents/${documentId}/apply-to-plan] No plan found for org ${orgId}`);
      return NextResponse.json(
        {
          error: "No active or draft plan found. Please create an emergency plan first.",
          code: "NO_PLAN_FOUND"
        },
        { status: 404 }
      );
    }

    // If there are multiple active plans, archive all but the first one
    if (activePlans && activePlans.length > 1) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] WARNING: Found ${activePlans.length} active plans, archiving extras`);

      const idsToArchive = activePlans.slice(1).map(p => p.id);
      await serviceSupabase
        .from("emergency_plans")
        .update({ status: "archived" } as any)
        .in("id", idsToArchive);
    }

    console.log(`[/api/documents/${documentId}/apply-to-plan] Applying to plan: ${activePlan.id}`);

    // Extract the data from the document
    const extractedData = document.extracted_data as any || {};
    const contacts = extractedData.contacts || [];
    const procedures = extractedData.procedures || [];
    const facilityInfo = extractedData.facility_info || null;
    const equipment = extractedData.equipment || [];

    // Get the current plan content
    const planContent = activePlan.content_json as any || {};
    const sections = planContent.sections || [];

    let updatedSections = [...sections];
    const appliedSections: string[] = [];

    // Apply contacts if selected
    if (selectedSections.contacts && contacts.length > 0) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] Applying ${contacts.length} contacts`);

      // Find or create emergency contacts section
      let contactsSectionIndex = updatedSections.findIndex((s: any) =>
        s.title?.toLowerCase().includes("emergency contact") ||
        s.title?.toLowerCase().includes("key personnel")
      );

      if (contactsSectionIndex === -1) {
        // Create new section
        updatedSections.push({
          title: "Emergency Contacts",
          content: generateContactsMarkdown(contacts),
          metadata: {
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        });
      } else {
        // Update existing section
        updatedSections[contactsSectionIndex] = {
          ...updatedSections[contactsSectionIndex],
          content: generateContactsMarkdown(contacts),
          metadata: {
            ...updatedSections[contactsSectionIndex].metadata,
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        };
      }
      appliedSections.push("contacts");
    }

    // Apply procedures if selected
    if (selectedSections.procedures && procedures.length > 0) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] Applying ${procedures.length} procedures`);

      // Find or create procedures section
      let proceduresSectionIndex = updatedSections.findIndex((s: any) =>
        s.title?.toLowerCase().includes("procedure") ||
        s.title?.toLowerCase().includes("protocol")
      );

      if (proceduresSectionIndex === -1) {
        // Create new section
        updatedSections.push({
          title: "Emergency Procedures",
          content: generateProceduresMarkdown(procedures),
          metadata: {
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        });
      } else {
        // Append to existing section
        const existingContent = updatedSections[proceduresSectionIndex].content || "";
        updatedSections[proceduresSectionIndex] = {
          ...updatedSections[proceduresSectionIndex],
          content: existingContent + "\n\n" + generateProceduresMarkdown(procedures),
          metadata: {
            ...updatedSections[proceduresSectionIndex].metadata,
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        };
      }
      appliedSections.push("procedures");
    }

    // Apply facility info if selected
    if (selectedSections.facilityInfo && facilityInfo) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] Applying facility information`);

      // Find or create facility section
      let facilitySectionIndex = updatedSections.findIndex((s: any) =>
        s.title?.toLowerCase().includes("facility") ||
        s.title?.toLowerCase().includes("building")
      );

      if (facilitySectionIndex === -1) {
        // Create new section
        updatedSections.push({
          title: "Facility Information",
          content: generateFacilityInfoMarkdown(facilityInfo),
          metadata: {
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        });
      } else {
        // Update existing section
        updatedSections[facilitySectionIndex] = {
          ...updatedSections[facilitySectionIndex],
          content: generateFacilityInfoMarkdown(facilityInfo),
          metadata: {
            ...updatedSections[facilitySectionIndex].metadata,
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        };
      }
      appliedSections.push("facilityInfo");
    }

    // Apply equipment if selected
    if (selectedSections.equipment && equipment.length > 0) {
      console.log(`[/api/documents/${documentId}/apply-to-plan] Applying ${equipment.length} equipment items`);

      // Find or create equipment section
      let equipmentSectionIndex = updatedSections.findIndex((s: any) =>
        s.title?.toLowerCase().includes("equipment") ||
        s.title?.toLowerCase().includes("inventory")
      );

      if (equipmentSectionIndex === -1) {
        // Create new section
        updatedSections.push({
          title: "Equipment & Inventory",
          content: generateEquipmentMarkdown(equipment),
          metadata: {
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        });
      } else {
        // Append to existing section
        const existingContent = updatedSections[equipmentSectionIndex].content || "";
        updatedSections[equipmentSectionIndex] = {
          ...updatedSections[equipmentSectionIndex],
          content: existingContent + "\n\n" + generateEquipmentMarkdown(equipment),
          metadata: {
            ...updatedSections[equipmentSectionIndex].metadata,
            source: "document_import",
            documentId,
            importedAt: new Date().toISOString(),
          },
        };
      }
      appliedSections.push("equipment");
    }

    if (appliedSections.length === 0) {
      return NextResponse.json(
        { error: "No sections selected to apply" },
        { status: 400 }
      );
    }

    // Update the plan with new content
    const { data: updatedPlan, error: updateError } = await serviceSupabase
      .from("emergency_plans")
      .update({
        content_json: {
          ...planContent,
          sections: updatedSections,
        },
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", activePlan.id)
      .select()
      .single();

    if (updateError) {
      console.error(`[/api/documents/${documentId}/apply-to-plan] Error updating plan:`, updateError);
      return NextResponse.json(
        { error: "Failed to update plan", details: updateError.message },
        { status: 500 }
      );
    }

    // Create extraction records for tracking
    for (const section of appliedSections) {
      await serviceSupabase.from("document_extractions").insert({
        document_id: documentId,
        org_id: orgId,
        extraction_type: section,
        extracted_data:
          section === "contacts" ? { contacts } :
          section === "procedures" ? { procedures } :
          section === "facilityInfo" ? { facility_info: facilityInfo } :
          section === "equipment" ? { equipment } : {},
        applied_to_plan: true,
        applied_at: new Date().toISOString(),
        applied_by: user.id,
      } as any);
    }

    console.log(`[/api/documents/${documentId}/apply-to-plan] Successfully applied ${appliedSections.length} sections to plan ${activePlan.id}`);

    return NextResponse.json({
      success: true,
      planId: activePlan.id,
      appliedSections,
      message: `Successfully applied ${appliedSections.join(", ")} to emergency plan`,
    });

  } catch (error: any) {
    console.error(`[/api/documents/${documentId}/apply-to-plan] Error:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// Helper functions to generate markdown

function generateContactsMarkdown(contacts: any[]): string {
  let markdown = "## Emergency Contacts\n\n";
  markdown += "| Name | Title | Phone | Email | Role | Department |\n";
  markdown += "|------|-------|-------|-------|------|------------|\n";

  for (const contact of contacts) {
    markdown += `| ${contact.name || "-"} | ${contact.title || "-"} | ${contact.phone || "-"} | ${contact.email || "-"} | ${contact.role || "-"} | ${contact.department || "-"} |\n`;
  }

  return markdown;
}

function generateProceduresMarkdown(procedures: any[]): string {
  let markdown = "## Procedures\n\n";

  for (const procedure of procedures) {
    markdown += `### ${procedure.title}\n\n`;

    if (procedure.category) {
      markdown += `**Category:** ${procedure.category}\n\n`;
    }

    if (procedure.steps && procedure.steps.length > 0) {
      markdown += "**Steps:**\n\n";
      for (let i = 0; i < procedure.steps.length; i++) {
        markdown += `${i + 1}. ${procedure.steps[i]}\n`;
      }
      markdown += "\n";
    }

    if (procedure.responsible_party) {
      markdown += `**Responsible Party:** ${procedure.responsible_party}\n\n`;
    }

    if (procedure.frequency) {
      markdown += `**Frequency:** ${procedure.frequency}\n\n`;
    }

    markdown += "---\n\n";
  }

  return markdown;
}

function generateFacilityInfoMarkdown(facilityInfo: any): string {
  let markdown = "## Facility Information\n\n";

  if (facilityInfo.facility_name) {
    markdown += `**Facility Name:** ${facilityInfo.facility_name}\n\n`;
  }

  if (facilityInfo.address) {
    markdown += `**Address:** ${facilityInfo.address}\n\n`;
  }

  if (facilityInfo.building_type) {
    markdown += `**Building Type:** ${facilityInfo.building_type}\n\n`;
  }

  if (facilityInfo.square_footage) {
    markdown += `**Square Footage:** ${facilityInfo.square_footage.toLocaleString()} sq ft\n\n`;
  }

  if (facilityInfo.number_of_floors) {
    markdown += `**Number of Floors:** ${facilityInfo.number_of_floors}\n\n`;
  }

  if (facilityInfo.occupancy) {
    markdown += `**Occupancy:** ${facilityInfo.occupancy} people\n\n`;
  }

  if (facilityInfo.operating_hours) {
    markdown += `**Operating Hours:** ${facilityInfo.operating_hours}\n\n`;
  }

  if (facilityInfo.utilities && facilityInfo.utilities.length > 0) {
    markdown += "### Utilities\n\n";
    markdown += "| Type | Provider | Phone | Account Number |\n";
    markdown += "|------|----------|-------|----------------|\n";

    for (const utility of facilityInfo.utilities) {
      markdown += `| ${utility.type || "-"} | ${utility.provider || "-"} | ${utility.phone || "-"} | ${utility.account_number || "-"} |\n`;
    }

    markdown += "\n";
  }

  return markdown;
}

function generateEquipmentMarkdown(equipment: any[]): string {
  let markdown = "## Equipment & Inventory\n\n";
  markdown += "| Name | Category | Quantity | Location | Manufacturer | Model | Maintenance |\n";
  markdown += "|------|----------|----------|----------|--------------|-------|-------------|\n";

  for (const item of equipment) {
    markdown += `| ${item.name || "-"} | ${item.category || "-"} | ${item.quantity || "-"} | ${item.location || "-"} | ${item.manufacturer || "-"} | ${item.model || "-"} | ${item.maintenance_schedule || "-"} |\n`;
  }

  return markdown;
}
