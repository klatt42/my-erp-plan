"use server";

/**
 * Facility Research Actions
 * Uses Perplexity AI to gather real-world emergency response data
 */

import { createClient } from "@/lib/supabase/server";

interface EmergencyService {
  type: "hospital" | "fire" | "police" | "poison_control" | "other";
  name: string;
  address: string;
  phone: string;
  distance?: string;
  notes?: string;
}

interface LocalHazard {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  preparedness_notes?: string;
}

interface FacilityInfo {
  business_type?: string;
  operations_summary?: string;
  estimated_size?: string;
  industry_regulations?: string[];
  special_hazards?: string[];
}

export interface FacilityResearchData {
  emergency_services: EmergencyService[];
  local_hazards: LocalHazard[];
  facility_info: FacilityInfo;
  sources: string[];
  researched_at: string;
}

/**
 * Research emergency services near a facility
 */
async function researchEmergencyServices(
  companyName: string,
  address: string
): Promise<{ services: EmergencyService[]; sources: string[] }> {
  const query = `Find the nearest emergency services to this specific location: ${address}

Please provide:
1. The closest hospital emergency room - include the hospital name, complete street address with city/state/ZIP, and main phone number
2. The fire department that serves this address - include fire station name, complete address, and phone number
3. The police department with jurisdiction over this address - include department name, complete address, and non-emergency phone
4. Regional poison control center - include name and 24-hour hotline number

Be specific and include actual facility names, full street addresses, and direct phone numbers.`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Perplexity API error details:", errorBody);
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const citations = data.citations || [];

  // Parse the response to extract structured data
  const services = parseEmergencyServices(content);

  return {
    services,
    sources: citations,
  };
}

/**
 * Research local hazards for a facility location
 */
async function researchLocalHazards(
  address: string
): Promise<{ hazards: LocalHazard[]; sources: string[] }> {
  const query = `What are the emergency hazards and risks for facilities at ${address}:
- FEMA flood zone designation and flood risk
- Earthquake/seismic risk level
- Tornado/severe weather risks
- Hurricane risk (if coastal)
- Wildfire risk
- Industrial or chemical hazards in the area
- Any other relevant natural or man-made hazards

Provide specific risk levels and preparedness recommendations.`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Perplexity API error (hazards):", errorBody);
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const citations = data.citations || [];

  const hazards = parseLocalHazards(content);

  return {
    hazards,
    sources: citations,
  };
}

/**
 * Research facility-specific information
 */
async function researchFacilityInfo(
  companyName: string,
  address: string
): Promise<{ info: FacilityInfo; sources: string[] }> {
  const query = `Research ${companyName} located at ${address}:
- Type of business and primary operations
- Approximate facility size and employee count (if publicly available)
- Industry-specific safety regulations (OSHA, EPA, local codes)
- Known safety considerations for this type of facility
- Any publicly reported safety incidents or concerns

Focus on information relevant to emergency response planning.`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Perplexity API error (facility):", errorBody);
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const citations = data.citations || [];

  const info = parseFacilityInfo(content);

  return {
    info,
    sources: citations,
  };
}

/**
 * Main action: Research all facility data
 */
export async function researchFacilityData(
  orgId: string,
  companyName: string,
  address: string
): Promise<{ success: boolean; data?: FacilityResearchData; error?: string }> {
  try {
    const supabase = await createClient();

    // Simple auth check - if they can call this action, they're authorized
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Perform all research in parallel
    const [emergencyServicesResult, hazardsResult, facilityInfoResult] =
      await Promise.all([
        researchEmergencyServices(companyName, address),
        researchLocalHazards(address),
        researchFacilityInfo(companyName, address),
      ]);

    // Combine all results
    const researchData: FacilityResearchData = {
      emergency_services: emergencyServicesResult.services,
      local_hazards: hazardsResult.hazards,
      facility_info: facilityInfoResult.info,
      sources: [
        ...emergencyServicesResult.sources,
        ...hazardsResult.sources,
        ...facilityInfoResult.sources,
      ],
      researched_at: new Date().toISOString(),
    };

    // Save to database
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        facility_research: researchData,
        research_last_updated: new Date().toISOString(),
      })
      .eq("id", orgId);

    if (updateError) {
      console.error("Error saving research data:", updateError);
      return { success: false, error: "Failed to save research data" };
    }

    return { success: true, data: researchData };
  } catch (error) {
    console.error("Facility research error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Research failed",
    };
  }
}

/**
 * Get cached research data for an organization
 */
export async function getFacilityResearch(
  orgId: string
): Promise<FacilityResearchData | null> {
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("facility_research, research_last_updated")
    .eq("id", orgId)
    .single();

  if (!org?.facility_research) {
    return null;
  }

  return org.facility_research as FacilityResearchData;
}

// ============================================================================
// Parsing helpers
// ============================================================================

function parseEmergencyServices(content: string): EmergencyService[] {
  const services: EmergencyService[] = [];

  // Extract all phone numbers from the content first
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  const allPhones = content.match(phoneRegex) || [];

  // Split into sections by type
  const sections = content.split(/(?=\*\*(?:Nearest hospital|Fire department|Police department|Poison control))/i);

  for (const section of sections) {
    const lowerSection = section.toLowerCase();

    let type: EmergencyService["type"] | null = null;
    if (lowerSection.includes("hospital") || lowerSection.includes("medical center") || lowerSection.includes("emergency room")) {
      type = "hospital";
    } else if (lowerSection.includes("fire")) {
      type = "fire";
    } else if (lowerSection.includes("police")) {
      type = "police";
    } else if (lowerSection.includes("poison")) {
      type = "poison_control";
    }

    if (!type) continue;

    // Extract name (typically after ** and before address)
    const nameMatch = section.match(/\*\*([^*\n]+?)(?:\*\*|:|\n|Address)/i);
    const name = nameMatch ? nameMatch[1].trim().replace(/^(Nearest|Fire department serving|Police department|Poison control center).*?:/i, '').trim() : '';

    // Extract address - look for street patterns
    const addressMatch = section.match(/(?:Address:|Located at:?|-)?\s*(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Parkway|Pkwy)[^,\n]*,?\s*[^,\n]+,?\s*[A-Z]{2}\s*\d{5})/i);
    const address = addressMatch ? addressMatch[1].trim() : '';

    // Extract phone from this section
    const sectionPhones = section.match(phoneRegex) || [];
    const phone = sectionPhones[0] || '';

    // Extract distance if mentioned
    const distanceMatch = section.match(/(\d+\.?\d*)\s*(miles?|mi|km|kilometers?)/i);
    const distance = distanceMatch ? `${distanceMatch[1]} ${distanceMatch[2]}` : undefined;

    if (name || phone || address) {
      services.push({
        type,
        name: name || `${type.replace('_', ' ')} service`,
        address: address || "Address not found - please verify",
        phone: phone || "Phone not found - please verify",
        distance,
      });
    }
  }

  // If we didn't find structured sections, try to extract any services mentioned
  if (services.length === 0) {
    // Fallback: look for any phone numbers and try to associate with service types
    const lines = content.split('\n');
    let currentType: EmergencyService["type"] | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('hospital') || lowerLine.includes('medical')) currentType = 'hospital';
      else if (lowerLine.includes('fire')) currentType = 'fire';
      else if (lowerLine.includes('police')) currentType = 'police';
      else if (lowerLine.includes('poison')) currentType = 'poison_control';

      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch && currentType) {
        services.push({
          type: currentType,
          name: line.replace(phoneMatch[0], '').trim() || `${currentType} service`,
          address: "Search online for exact address",
          phone: phoneMatch[0],
        });
        currentType = null;
      }
    }
  }

  return services.length > 0 ? services : [{
    type: "other",
    name: "Unable to parse emergency services",
    address: "Please search manually for local emergency services",
    phone: "911 (Emergency)"
  }];
}

function parseLocalHazards(content: string): LocalHazard[] {
  const hazards: LocalHazard[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Detect hazard types and severity
    let type = "";
    let severity: "low" | "medium" | "high" = "medium";

    if (lowerLine.includes("flood")) type = "Flooding";
    else if (lowerLine.includes("earthquake") || lowerLine.includes("seismic"))
      type = "Earthquake";
    else if (lowerLine.includes("tornado")) type = "Tornado";
    else if (lowerLine.includes("hurricane")) type = "Hurricane";
    else if (lowerLine.includes("wildfire") || lowerLine.includes("fire"))
      type = "Wildfire";
    else if (lowerLine.includes("severe weather")) type = "Severe Weather";

    if (type) {
      // Determine severity from keywords
      if (lowerLine.includes("high risk") || lowerLine.includes("significant"))
        severity = "high";
      else if (lowerLine.includes("low risk") || lowerLine.includes("minimal"))
        severity = "low";

      hazards.push({
        type,
        severity,
        description: line.trim(),
      });
    }
  }

  return hazards;
}

function parseFacilityInfo(content: string): FacilityInfo {
  const info: FacilityInfo = {};

  // Extract key information from content
  const lines = content.split("\n");

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("business type") || lowerLine.includes("operations")) {
      info.operations_summary = line.trim();
    } else if (lowerLine.includes("employee") || lowerLine.includes("size")) {
      info.estimated_size = line.trim();
    }
  }

  return info;
}
