/**
 * Zod validation schemas for multi-step onboarding questionnaire
 * Each step has its own schema for granular validation
 */

import { z } from "zod";

/**
 * Step 1: Organization Information
 */
export const organizationInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  type: z.enum([
    "healthcare",
    "manufacturing",
    "office",
    "retail",
    "museum",
    "educational",
    "hospitality",
    "datacenter",
    "laboratory",
    "other",
  ]),
  customType: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  employeeCount: z.number().int().min(1).optional(),
  address: z.string().min(5, "Address is required").optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 letters (e.g., CA)"),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
    .optional(),
});

export type OrganizationInfo = z.infer<typeof organizationInfoSchema>;

/**
 * Step 2: Facility Details
 */
export const facilityDetailsSchema = z.object({
  squareFootage: z.number().int().min(100).optional(),
  floors: z.number().int().min(1).max(200).optional(),
  buildingAge: z.number().int().min(0).max(300).optional(),
  construction: z
    .enum(["concrete", "steel", "wood_frame", "brick", "mixed", "other"])
    .optional(),
  hasBasement: z.boolean().default(false),
  hasSprinklers: z.boolean().default(false),
  hasGenerator: z.boolean().default(false),
  hasSecuritySystem: z.boolean().default(false),
  operatingHours: z
    .object({
      standard: z.string().optional(),
      twentyFourSeven: z.boolean().default(false),
      shifts: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
});

export type FacilityDetails = z.infer<typeof facilityDetailsSchema>;

/**
 * Step 3: Collection Type (for museums, archives, warehouses)
 */
export const collectionTypeSchema = z.object({
  hasCollections: z.boolean().default(false),
  collections: z
    .array(
      z.object({
        type: z.string().min(1, "Collection type is required"),
        description: z.string().min(5, "Description must be at least 5 characters"),
        value: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .optional(),
  inventoryValue: z.enum(["low", "medium", "high", "critical"]).optional(),
  criticalEquipment: z.array(z.string()).optional(),
  criticalSystems: z.array(z.string()).optional(),
  criticalData: z.array(z.string()).optional(),
});

export type CollectionType = z.infer<typeof collectionTypeSchema>;

/**
 * Step 4: Hazard Assessment
 */
export const hazardAssessmentSchema = z.object({
  hazards: z
    .array(
      z.enum([
        "fire",
        "flood",
        "earthquake",
        "tornado",
        "hurricane",
        "chemical",
        "biological",
        "radiological",
        "explosion",
        "hazmat",
        "active_shooter",
        "cyberattack",
        "power_outage",
        "medical_emergency",
      ])
    )
    .min(1, "Please select at least one hazard"),
  customHazards: z.array(z.string()).optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  locationRisks: z
    .object({
      floodZone: z.boolean().default(false),
      earthquakeZone: z.boolean().default(false),
      tornadoAlley: z.boolean().default(false),
      hurricaneCoast: z.boolean().default(false),
      wildfire: z.boolean().default(false),
    })
    .optional(),
  existingPlans: z
    .object({
      evacuation: z.boolean().default(false),
      fire: z.boolean().default(false),
      medical: z.boolean().default(false),
      security: z.boolean().default(false),
      cyber: z.boolean().default(false),
      business_continuity: z.boolean().default(false),
    })
    .optional(),
});

export type HazardAssessment = z.infer<typeof hazardAssessmentSchema>;

/**
 * Step 5: Team Structure
 */
export const teamStructureSchema = z.object({
  management: z.number().int().min(0).optional(),
  staff: z.number().int().min(0).optional(),
  contractors: z.number().int().min(0).optional(),
  volunteers: z.number().int().min(0).optional(),
  visitors: z.number().int().min(0).optional(),
  hasEmergencyTeam: z.boolean().default(false),
  emergencyRoles: z
    .array(
      z.object({
        role: z.string().min(1, "Role name is required"),
        assigned: z.boolean().default(false),
        count: z.number().int().min(0).optional(),
      })
    )
    .optional(),
  accessibilityNeeds: z.boolean().default(false),
  accessibilityDetails: z.string().optional(),
  multilingualNeeds: z.array(z.string()).optional(),
  specialConsiderations: z.array(z.string()).optional(),
});

export type TeamStructure = z.infer<typeof teamStructureSchema>;

/**
 * Step 6: Compliance Needs & Emergency Contacts
 */
export const complianceNeedsSchema = z.object({
  compliance: z
    .array(
      z.enum([
        "osha",
        "fema",
        "nfpa",
        "jcaho",
        "hipaa",
        "iso_22301",
        "iso_31000",
      ])
    )
    .min(1, "Please select at least one compliance framework"),
  customCompliance: z.array(z.string()).optional(),
  stateRequirements: z.string().optional(),
  industryRegulations: z.string().optional(),
  insuranceRequirements: z.boolean().default(false),
  auditSchedule: z
    .enum(["monthly", "quarterly", "annually", "as_needed"])
    .optional(),
  // Emergency Contacts - Support Services
  mitigationContractor: z.string().optional(),
  mitigationContractorPhone: z.string().optional(),
  mitigationContractorContact: z.string().optional(),
  specialtyContentsContractor: z.string().optional(),
  specialtyContentsContractorPhone: z.string().optional(),
  specialtyContentsContractorContact: z.string().optional(),
});

export type ComplianceNeeds = z.infer<typeof complianceNeedsSchema>;

/**
 * Complete onboarding data (all steps combined)
 */
export const completeOnboardingSchema = z.object({
  step1: organizationInfoSchema,
  step2: facilityDetailsSchema,
  step3: collectionTypeSchema,
  step4: hazardAssessmentSchema,
  step5: teamStructureSchema,
  step6: complianceNeedsSchema,
});

export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>;

/**
 * Helper: Get schema for specific step
 */
export function getStepSchema(step: number) {
  switch (step) {
    case 1:
      return organizationInfoSchema;
    case 2:
      return facilityDetailsSchema;
    case 3:
      return collectionTypeSchema;
    case 4:
      return hazardAssessmentSchema;
    case 5:
      return teamStructureSchema;
    case 6:
      return complianceNeedsSchema;
    default:
      throw new Error(`Invalid step number: ${step}`);
  }
}

/**
 * Helper: Get default values for a step
 */
export function getStepDefaults(step: number): any {
  switch (step) {
    case 1:
      return {
        name: "",
        type: "office",
        size: "11-50",
        city: "",
        state: "",
      };
    case 2:
      return {
        hasBasement: false,
        hasSprinklers: false,
        hasGenerator: false,
        hasSecuritySystem: false,
      };
    case 3:
      return {
        hasCollections: false,
      };
    case 4:
      return {
        hazards: [],
        locationRisks: {
          floodZone: false,
          earthquakeZone: false,
          tornadoAlley: false,
          hurricaneCoast: false,
          wildfire: false,
        },
        existingPlans: {
          evacuation: false,
          fire: false,
          medical: false,
          security: false,
          cyber: false,
          business_continuity: false,
        },
      };
    case 5:
      return {
        hasEmergencyTeam: false,
        accessibilityNeeds: false,
        multilingualNeeds: [],
        specialConsiderations: [],
      };
    case 6:
      return {
        compliance: [],
        insuranceRequirements: false,
      };
    default:
      return {};
  }
}

/**
 * Helper: Convert onboarding data to FacilityProfile for API
 */
export function onboardingToFacilityProfile(
  data: CompleteOnboarding
): any {
  return {
    name: data.step1.name,
    type: data.step1.type,
    customType: data.step1.customType,
    size: data.step1.size,
    employeeCount: data.step1.employeeCount,
    location: {
      address: data.step1.address,
      city: data.step1.city,
      state: data.step1.state,
      zipCode: data.step1.zipCode,
    },
    operatingHours: data.step2.operatingHours,
    infrastructure: {
      squareFootage: data.step2.squareFootage,
      floors: data.step2.floors,
      buildingAge: data.step2.buildingAge,
      construction: data.step2.construction,
      hasBasement: data.step2.hasBasement,
      hasSprinklers: data.step2.hasSprinklers,
      hasGenerator: data.step2.hasGenerator,
      hasSecuritySystem: data.step2.hasSecuritySystem,
    },
    collections: data.step3.collections,
    criticalResources: {
      equipment: data.step3.criticalEquipment,
      systems: data.step3.criticalSystems,
      data: data.step3.criticalData,
    },
    hazards: data.step4.hazards,
    customHazards: data.step4.customHazards,
    riskLevel: data.step4.riskLevel,
    existingPlans: data.step4.existingPlans,
    personnel: {
      management: data.step5.management,
      staff: data.step5.staff,
      contractors: data.step5.contractors,
      volunteers: data.step5.volunteers,
      visitors: data.step5.visitors,
    },
    accessibilityNeeds: data.step5.accessibilityNeeds,
    multilingualNeeds: data.step5.multilingualNeeds,
    specialConsiderations: data.step5.specialConsiderations,
    compliance: data.step6.compliance,
    customCompliance: data.step6.customCompliance,
    emergencyContacts: {
      mitigationContractor: data.step6.mitigationContractor,
      mitigationContractorPhone: data.step6.mitigationContractorPhone,
      mitigationContractorContact: data.step6.mitigationContractorContact,
      specialtyContentsContractor: data.step6.specialtyContentsContractor,
      specialtyContentsContractorPhone: data.step6.specialtyContentsContractorPhone,
      specialtyContentsContractorContact: data.step6.specialtyContentsContractorContact,
    },
  };
}
