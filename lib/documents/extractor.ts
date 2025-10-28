import Anthropic from "@anthropic-ai/sdk";
import type {
  ContactExtraction,
  EquipmentExtraction,
  FloorPlanExtraction,
  ProcedureExtraction,
  FacilityInfoExtraction,
  DocumentType,
} from "@/lib/types/documents";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ExtractionResult {
  success: boolean;
  data?: any;
  documentType?: DocumentType;
  confidence?: number;
  tokensUsed?: number;
  error?: string;
}

/**
 * Classify document type using Claude
 */
export async function classifyDocument(text: string): Promise<{
  documentType: DocumentType;
  confidence: number;
  reasoning: string;
}> {
  console.log(`[classifyDocument] Classifying document (${text.length} characters)`);

  const prompt = `You are analyzing a document to determine its type. Based on the content below, classify this document into ONE of these categories:

- **floor_plan**: Building floor plans, evacuation maps, facility layouts
- **contact_list**: Emergency contacts, personnel directories, phone lists
- **equipment_inventory**: Equipment lists, asset inventories, supplies
- **existing_plan**: Existing emergency response plans, safety procedures
- **other**: Any other type of document

Content to analyze:
---
${text.substring(0, 4000)}
---

Respond ONLY with valid JSON in this exact format:
{
  "documentType": "floor_plan" | "contact_list" | "equipment_inventory" | "existing_plan" | "other",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why you chose this classification"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(responseText);

    console.log(`[classifyDocument] Result: ${result.documentType} (confidence: ${result.confidence})`);

    return result;
  } catch (error) {
    console.error("[classifyDocument] Error:", error);
    return {
      documentType: "other",
      confidence: 0,
      reasoning: "Failed to classify document",
    };
  }
}

/**
 * Extract contact information from document
 */
export async function extractContacts(text: string): Promise<ExtractionResult> {
  console.log("[extractContacts] Extracting contact information");

  const prompt = `Extract ALL contact information from this document. Look for names, titles, phone numbers, email addresses, roles, and departments.

Document content:
---
${text}
---

Respond ONLY with valid JSON in this format:
{
  "contacts": [
    {
      "name": "John Smith",
      "title": "Safety Manager",
      "phone": "(555) 123-4567",
      "email": "john@company.com",
      "role": "Emergency Coordinator",
      "department": "Safety"
    }
  ]
}

If no contacts are found, return {"contacts": []}.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(responseText);

    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    console.log(`[extractContacts] Extracted ${result.contacts.length} contacts | Tokens: ${tokensUsed}`);

    return {
      success: true,
      data: result.contacts,
      tokensUsed,
    };
  } catch (error) {
    console.error("[extractContacts] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract equipment/inventory information
 */
export async function extractEquipment(text: string): Promise<ExtractionResult> {
  console.log("[extractEquipment] Extracting equipment information");

  const prompt = `Extract ALL equipment and inventory information from this document. Include names, categories, quantities, locations, manufacturers, models, serial numbers, and maintenance schedules.

Document content:
---
${text}
---

Respond ONLY with valid JSON in this format:
{
  "equipment": [
    {
      "name": "Fire Extinguisher",
      "category": "Safety Equipment",
      "quantity": 10,
      "location": "Hallways",
      "manufacturer": "Ansul",
      "model": "ABC-10",
      "serial_number": "FE12345",
      "maintenance_schedule": "Annual inspection"
    }
  ]
}

If no equipment is found, return {"equipment": []}.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(responseText);

    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    console.log(`[extractEquipment] Extracted ${result.equipment.length} items | Tokens: ${tokensUsed}`);

    return {
      success: true,
      data: result.equipment,
      tokensUsed,
    };
  } catch (error) {
    console.error("[extractEquipment] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract facility information
 */
export async function extractFacilityInfo(text: string): Promise<ExtractionResult> {
  console.log("[extractFacilityInfo] Extracting facility information");

  const prompt = `Extract facility information from this document. Look for facility name, address, building type, size, number of floors, occupancy, operating hours, and utilities information.

Document content:
---
${text}
---

Respond ONLY with valid JSON in this format:
{
  "facility": {
    "facility_name": "ABC Corporate Headquarters",
    "address": "123 Main St, City, State 12345",
    "building_type": "Office",
    "square_footage": 50000,
    "number_of_floors": 3,
    "occupancy": 200,
    "operating_hours": "8am - 6pm Monday-Friday",
    "utilities": [
      {
        "type": "Electric",
        "provider": "City Power",
        "account_number": "ACC123456",
        "phone": "(555) 111-2222"
      }
    ]
  }
}

If no facility info is found, return {"facility": null}.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(responseText);

    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    console.log(`[extractFacilityInfo] Extraction complete | Tokens: ${tokensUsed}`);

    return {
      success: true,
      data: result.facility,
      tokensUsed,
    };
  } catch (error) {
    console.error("[extractFacilityInfo] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract procedures from document
 */
export async function extractProcedures(text: string): Promise<ExtractionResult> {
  console.log("[extractProcedures] Extracting procedures");

  const prompt = `Extract ALL procedures, protocols, or step-by-step instructions from this document. Include titles, categories, steps, responsible parties, and frequency.

Document content:
---
${text}
---

Respond ONLY with valid JSON in this format:
{
  "procedures": [
    {
      "title": "Fire Evacuation Procedure",
      "category": "Emergency Response",
      "steps": [
        "Sound alarm",
        "Evacuate building via nearest exit",
        "Gather at assembly point"
      ],
      "responsible_party": "Safety Coordinator",
      "frequency": "As needed"
    }
  ]
}

If no procedures are found, return {"procedures": []}.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(responseText);

    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    console.log(`[extractProcedures] Extracted ${result.procedures.length} procedures | Tokens: ${tokensUsed}`);

    return {
      success: true,
      data: result.procedures,
      tokensUsed,
    };
  } catch (error) {
    console.error("[extractProcedures] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main extraction function that determines what to extract based on document type
 */
export async function extractDocumentData(
  text: string,
  documentType?: DocumentType
): Promise<{
  classification: { documentType: DocumentType; confidence: number };
  extractions: Record<string, any>;
  totalTokensUsed: number;
}> {
  console.log("[extractDocumentData] Starting extraction process");

  let totalTokens = 0;
  const extractions: Record<string, any> = {};

  // Step 1: Classify if not provided
  let type = documentType;
  let confidence = 1.0;

  if (!type) {
    const classification = await classifyDocument(text);
    type = classification.documentType;
    confidence = classification.confidence;
  }

  // Step 2: Extract based on type
  switch (type) {
    case "contact_list": {
      const result = await extractContacts(text);
      if (result.success) {
        extractions.contacts = result.data;
        totalTokens += result.tokensUsed || 0;
      }
      break;
    }

    case "equipment_inventory": {
      const result = await extractEquipment(text);
      if (result.success) {
        extractions.equipment = result.data;
        totalTokens += result.tokensUsed || 0;
      }
      break;
    }

    case "existing_plan": {
      // Extract multiple types
      const [contacts, procedures, facilityInfo] = await Promise.all([
        extractContacts(text),
        extractProcedures(text),
        extractFacilityInfo(text),
      ]);

      if (contacts.success) {
        extractions.contacts = contacts.data;
        totalTokens += contacts.tokensUsed || 0;
      }

      if (procedures.success) {
        extractions.procedures = procedures.data;
        totalTokens += procedures.tokensUsed || 0;
      }

      if (facilityInfo.success) {
        extractions.facility_info = facilityInfo.data;
        totalTokens += facilityInfo.tokensUsed || 0;
      }
      break;
    }

    case "floor_plan": {
      const result = await extractFacilityInfo(text);
      if (result.success) {
        extractions.facility_info = result.data;
        totalTokens += result.tokensUsed || 0;
      }
      break;
    }

    default: {
      // Try to extract whatever we can find
      const [contacts, equipment, facilityInfo] = await Promise.all([
        extractContacts(text),
        extractEquipment(text),
        extractFacilityInfo(text),
      ]);

      if (contacts.success && contacts.data.length > 0) {
        extractions.contacts = contacts.data;
        totalTokens += contacts.tokensUsed || 0;
      }

      if (equipment.success && equipment.data.length > 0) {
        extractions.equipment = equipment.data;
        totalTokens += equipment.tokensUsed || 0;
      }

      if (facilityInfo.success && facilityInfo.data) {
        extractions.facility_info = facilityInfo.data;
        totalTokens += facilityInfo.tokensUsed || 0;
      }
      break;
    }
  }

  console.log(`[extractDocumentData] Extraction complete | Type: ${type} | Tokens: ${totalTokens}`);

  return {
    classification: {
      documentType: type,
      confidence,
    },
    extractions,
    totalTokensUsed: totalTokens,
  };
}
