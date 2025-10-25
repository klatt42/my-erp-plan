/**
 * Test script for /api/plans/generate endpoint
 * Tests AI generation without needing browser
 */

import type { FacilityProfile } from "./lib/anthropic/types";

// Test facility profile (Manufacturing from test guide)
const testProfile: FacilityProfile = {
  name: "Acme Manufacturing Plant",
  type: "manufacturing",
  size: "51-200",
  employeeCount: 125,
  location: {
    address: "123 Industrial Way",
    city: "Detroit",
    state: "MI",
    zipCode: "48201",
  },
  infrastructure: {
    squareFootage: 50000,
    floors: 1,
    buildingAge: 25,
    construction: "steel",
    hasSprinklers: true,
    hasGenerator: true,
    hasBasement: false,
    hasSecuritySystem: true,
  },
  operatingHours: {
    standard: "24/7",
    twentyFourSeven: true,
    shiftBased: true,
    shifts: 3,
  },
  criticalResources: {
    equipment: ["CNC Machine", "Forklift Fleet", "Injection Molding Press"],
    systems: ["HVAC System", "Compressed Air System", "Electrical Distribution"],
    data: ["Production Schedules", "Quality Control Records", "Customer Orders"],
  },
  hazards: ["fire", "chemical", "power_outage", "explosion", "hazmat"],
  customHazards: ["Forklift accidents", "Chemical spills"],
  riskLevel: "high",
  hasEvacuationPlan: true,
  hasFirePlan: true,
  personnel: {
    management: 15,
    staff: 95,
    contractors: 15,
  },
  emergencyTeam: true,
  accessibilityNeeds: true,
  accessibilityDetails: "Wheelchair users in office area",
  multilingualNeeds: ["Spanish", "Polish"],
  specialConsiderations: [
    "Chemical storage area with Class 1 flammables",
    "Heavy machinery requires lockout/tagout",
  ],
  compliance: ["osha", "fema", "nfpa", "iso_22301"],
  insuranceRequirements: true,
};

async function testAPIGeneration() {
  console.log("🧪 Testing /api/plans/generate endpoint");
  console.log("━".repeat(50));
  console.log(`📋 Facility: ${testProfile.name}`);
  console.log(`🏭 Type: ${testProfile.type}`);
  console.log(`📍 Location: ${testProfile.location.city}, ${testProfile.location.state}`);
  console.log("━".repeat(50));

  try {
    const startTime = Date.now();

    const response = await fetch("http://localhost:3000/api/plans/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: This will fail without a valid session cookie
        // For real testing, need to be authenticated
      },
      body: JSON.stringify({
        facilityProfile: testProfile,
      }),
    });

    const duration = Date.now() - startTime;

    console.log(`\n⏱️  Response time: ${duration}ms`);
    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (response.ok) {
      console.log("\n✅ SUCCESS!");
      console.log("━".repeat(50));
      console.log(`Plan ID: ${data.plan.id}`);
      console.log(`Organization: ${data.plan.org_id}`);
      console.log(`Version: ${data.plan.version}`);
      console.log(`Status: ${data.plan.status}`);
      console.log(`Created: ${data.plan.created_at}`);
      if (data.tokensUsed) {
        console.log(`\n📊 Token Usage:`);
        console.log(`   Input: ${data.tokensUsed.input}`);
        console.log(`   Output: ${data.tokensUsed.output}`);
        console.log(`   Total: ${data.tokensUsed.total}`);
      }
      console.log("━".repeat(50));
    } else {
      console.log("\n❌ FAILED!");
      console.log("━".repeat(50));
      console.log(`Error: ${data.error}`);
      if (data.details) {
        console.log(`Details: ${data.details}`);
      }
      console.log("━".repeat(50));
    }
  } catch (error: any) {
    console.error("\n💥 Request failed:");
    console.error(error.message);
  }
}

// Run test
testAPIGeneration();
