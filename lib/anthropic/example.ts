/**
 * Example usage of the AI-powered ERP generation system
 * This file demonstrates how to use the generateERP function
 */

import { generateERP } from "./client";
import type { FacilityProfile } from "./types";
import { estimateTokens, formatERPForDisplay } from "./utils";

/**
 * Example 1: Manufacturing Facility
 */
export async function exampleManufacturingERP() {
  const facilityData: FacilityProfile = {
    name: "Acme Manufacturing Plant",
    type: "manufacturing",
    size: "51-200",
    employeeCount: 125,
    location: {
      city: "Detroit",
      state: "MI",
      address: "123 Industrial Way",
      zipCode: "48201",
    },
    operatingHours: {
      twentyFourSeven: true,
      shifts: 3,
    },
    hazards: [
      "fire",
      "chemical",
      "power_outage",
      "explosion",
      "hazmat",
    ],
    compliance: ["osha", "fema", "nfpa"],
    infrastructure: {
      squareFootage: 50000,
      floors: 1,
      hasGenerator: true,
      hasSprinklers: true,
      hasSecuritySystem: true,
    },
    personnel: {
      management: 15,
      staff: 95,
      contractors: 15,
    },
    specialConsiderations: [
      "Chemical storage area with Class 1 flammable liquids",
      "Heavy machinery requires lockout/tagout procedures",
      "Forklift operations in production areas",
    ],
  };

  // Estimate cost before running
  const estimate = estimateTokens(facilityData);
  console.log("Estimated cost:", estimate);

  // Generate ERP
  const result = await generateERP(facilityData);

  if (result.success && result.data) {
    console.log("ERP Generated Successfully!");
    console.log("Sections:", result.data.sections.length);
    console.log("Tokens used:", result.tokensUsed);

    // Format for display
    const formatted = formatERPForDisplay(result.data);
    console.log("\n--- FORMATTED ERP ---\n");
    console.log(formatted.substring(0, 1000) + "...");

    return result.data;
  } else {
    console.error("ERP Generation failed:", result.error);
    return null;
  }
}

/**
 * Example 2: Healthcare Facility
 */
export async function exampleHealthcareERP() {
  const facilityData: FacilityProfile = {
    name: "Riverside Medical Center",
    type: "healthcare",
    customType: "Urgent Care Clinic",
    size: "11-50",
    employeeCount: 35,
    location: {
      city: "Portland",
      state: "OR",
      zipCode: "97201",
    },
    operatingHours: {
      standard: "7am-9pm, 7 days/week",
    },
    hazards: [
      "medical_emergency",
      "fire",
      "power_outage",
      "flood",
      "active_shooter",
    ],
    compliance: ["osha", "hipaa", "jcaho"],
    infrastructure: {
      squareFootage: 8000,
      floors: 2,
      hasGenerator: true,
      hasSprinklers: true,
    },
    personnel: {
      management: 5,
      staff: 25,
      contractors: 5,
      visitors: 100, // Average daily patients
    },
    accessibilityNeeds: true,
    specialConsiderations: [
      "Non-ambulatory patients may require assistance during evacuation",
      "Medication refrigeration requires backup power",
      "X-ray equipment shutdown procedures",
    ],
  };

  const result = await generateERP(facilityData);

  if (result.success && result.data) {
    return result.data;
  } else {
    console.error("Failed:", result.error);
    return null;
  }
}

/**
 * Example 3: Office Building
 */
export async function exampleOfficeERP() {
  const facilityData: FacilityProfile = {
    name: "Tech Innovations HQ",
    type: "office",
    size: "51-200",
    employeeCount: 180,
    location: {
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    },
    operatingHours: {
      standard: "8am-6pm Mon-Fri",
    },
    hazards: [
      "fire",
      "tornado",
      "power_outage",
      "active_shooter",
      "cyberattack",
    ],
    compliance: ["osha", "nfpa"],
    infrastructure: {
      squareFootage: 25000,
      floors: 5,
      hasSecuritySystem: true,
      hasSprinklers: true,
    },
    personnel: {
      management: 30,
      staff: 150,
      visitors: 20,
    },
    criticalResources: {
      systems: ["Main server room", "VoIP phone system", "Access control system"],
      data: ["Customer database", "Financial records", "Intellectual property"],
    },
    accessibilityNeeds: true,
    specialConsiderations: [
      "Server room requires 24/7 climate control",
      "Remote work capabilities for business continuity",
      "Executive floor has secure document storage",
    ],
  };

  const result = await generateERP(facilityData);
  return result.success ? result.data : null;
}

/**
 * Example 4: Educational Facility
 */
export async function exampleSchoolERP() {
  const facilityData: FacilityProfile = {
    name: "Lincoln Elementary School",
    type: "educational",
    size: "11-50",
    employeeCount: 45,
    location: {
      city: "Denver",
      state: "CO",
    },
    operatingHours: {
      standard: "7:30am-3:30pm Mon-Fri (school year)",
    },
    hazards: [
      "fire",
      "tornado",
      "earthquake",
      "active_shooter",
      "medical_emergency",
    ],
    compliance: ["osha", "fema"],
    infrastructure: {
      squareFootage: 35000,
      floors: 2,
      hasSprinklers: true,
      hasSecuritySystem: true,
    },
    personnel: {
      management: 5,
      staff: 40,
      visitors: 450, // Students
    },
    accessibilityNeeds: true,
    multilingualNeeds: ["Spanish"],
    specialConsiderations: [
      "Parent reunification procedures for students",
      "Age-appropriate communication for K-5 students",
      "Special education students may need additional assistance",
      "Playground and cafeteria supervision during emergencies",
    ],
  };

  const result = await generateERP(facilityData);
  return result.success ? result.data : null;
}

/**
 * Example 5: Minimal Required Data
 */
export async function exampleMinimalERP() {
  const facilityData: FacilityProfile = {
    name: "Small Retail Store",
    type: "retail",
    size: "1-10",
    location: {
      city: "Seattle",
      state: "WA",
    },
    hazards: ["fire", "active_shooter"],
    compliance: ["osha"],
  };

  const result = await generateERP(facilityData);
  return result.success ? result.data : null;
}

/**
 * Run all examples (for testing)
 */
export async function runAllExamples() {
  console.log("=== Running ERP Generation Examples ===\n");

  try {
    console.log("1. Manufacturing Facility...");
    await exampleManufacturingERP();
    console.log("✓ Manufacturing complete\n");

    console.log("2. Healthcare Facility...");
    await exampleHealthcareERP();
    console.log("✓ Healthcare complete\n");

    console.log("3. Office Building...");
    await exampleOfficeERP();
    console.log("✓ Office complete\n");

    console.log("4. School...");
    await exampleSchoolERP();
    console.log("✓ School complete\n");

    console.log("5. Minimal Data...");
    await exampleMinimalERP();
    console.log("✓ Minimal complete\n");

    console.log("=== All examples completed successfully! ===");
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Uncomment to run examples:
// runAllExamples();
