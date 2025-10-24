/**
 * TypeScript types for Anthropic Claude API integration
 * Used for AI-powered Emergency Response Plan generation
 */

/**
 * Facility types supported by the ERP generation system
 */
export type FacilityType =
  | "healthcare"
  | "manufacturing"
  | "office"
  | "retail"
  | "warehouse"
  | "educational"
  | "hospitality"
  | "datacenter"
  | "laboratory"
  | "other";

/**
 * Organization size categories
 */
export type OrganizationSize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-1000"
  | "1000+";

/**
 * Hazard categories that may be present at a facility
 */
export type HazardCategory =
  | "chemical"
  | "biological"
  | "radiological"
  | "fire"
  | "flood"
  | "earthquake"
  | "tornado"
  | "hurricane"
  | "active_shooter"
  | "cyberattack"
  | "power_outage"
  | "medical_emergency"
  | "hazmat"
  | "explosion";

/**
 * Compliance frameworks to consider
 */
export type ComplianceFramework =
  | "osha"
  | "fema"
  | "nfpa"
  | "jcaho"
  | "hipaa"
  | "iso_22301"
  | "iso_31000";

/**
 * Complete facility profile for ERP generation
 */
export interface FacilityProfile {
  // Basic Information
  name: string;
  type: FacilityType;
  customType?: string; // For "other" facility types

  // Organization Details
  size: OrganizationSize;
  employeeCount?: number;
  location: {
    address?: string;
    city: string;
    state: string;
    zipCode?: string;
    region?: string; // e.g., "West Coast", "Southeast"
  };

  // Operational Details
  operatingHours?: {
    standard?: string; // e.g., "8am-5pm Mon-Fri"
    shiftBased?: boolean;
    shifts?: number;
    twentyFourSeven?: boolean;
  };

  // Collections/Inventory (for museums, warehouses, etc.)
  collections?: {
    type: string;
    description: string;
    value?: "low" | "medium" | "high" | "critical";
  }[];

  // Hazards and Risks
  hazards: HazardCategory[];
  customHazards?: string[];
  riskLevel?: "low" | "medium" | "high" | "critical";

  // Infrastructure
  infrastructure?: {
    floors?: number;
    squareFootage?: number;
    buildingAge?: number;
    construction?: string; // e.g., "concrete", "wood frame"
    hasBasement?: boolean;
    hasSprinklers?: boolean;
    hasGenerator?: boolean;
    hasSecuritySystem?: boolean;
  };

  // Personnel
  personnel?: {
    management?: number;
    staff?: number;
    contractors?: number;
    volunteers?: number;
    visitors?: number; // Average daily visitors
  };

  // Critical Resources
  criticalResources?: {
    equipment?: string[];
    systems?: string[];
    data?: string[];
  };

  // Compliance Requirements
  compliance: ComplianceFramework[];
  customCompliance?: string[];

  // Special Considerations
  specialConsiderations?: string[];
  accessibilityNeeds?: boolean;
  multilingualNeeds?: string[]; // e.g., ["Spanish", "Chinese"]

  // Existing Plans/Procedures
  existingPlans?: {
    evacuation?: boolean;
    fire?: boolean;
    medical?: boolean;
    security?: boolean;
    cyber?: boolean;
    business_continuity?: boolean;
  };
}

/**
 * Request payload for ERP generation
 */
export interface GenerateERPRequest {
  facilityProfile: FacilityProfile;
  options?: {
    includeTemplates?: boolean; // Include editable templates
    includeChecklists?: boolean; // Include action checklists
    includeContactForms?: boolean; // Include contact directory templates
    detailLevel?: "basic" | "standard" | "comprehensive";
    focusAreas?: string[]; // Specific areas to emphasize
  };
}

/**
 * ERP section structure
 */
export interface ERPSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: {
    id: string;
    title: string;
    content: string;
    order: number;
  }[];
}

/**
 * Complete ERP response structure
 */
export interface GeneratedERP {
  // Metadata
  generatedAt: string;
  facilityName: string;
  facilityType: FacilityType;
  version: string;

  // Executive Summary
  executiveSummary: string;

  // Main Sections
  sections: ERPSection[];

  // Standard Sections (for quick access)
  evacuation?: string;
  fireResponse?: string;
  medicalEmergency?: string;
  naturalDisaster?: string;
  security?: string;
  communication?: string;
  recovery?: string;

  // Supporting Materials
  checklists?: {
    title: string;
    items: string[];
  }[];

  contactTemplates?: {
    category: string;
    fields: string[];
  }[];

  // Compliance References
  complianceNotes?: {
    framework: string;
    requirements: string[];
    references: string[];
  }[];

  // Token Usage
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * Claude API response with error handling
 */
export interface ClaudeAPIResponse {
  success: boolean;
  data?: GeneratedERP;
  error?: {
    message: string;
    code?: string;
    retryable?: boolean;
  };
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  rateLimitInfo?: {
    remaining?: number;
    resetAt?: string;
  };
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  timestamp: string;
  facilityName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  requestType: "erp_generation" | "incident_analysis" | "plan_update";
}

/**
 * Prompt template variables
 */
export interface PromptVariables {
  facilityName: string;
  facilityType: string;
  location: string;
  size: string;
  hazards: string[];
  compliance: string[];
  specialConsiderations?: string[];
  [key: string]: any; // Allow additional variables
}

/**
 * Parsed ERP sections from Claude response
 */
export interface ParsedERPResponse {
  rawText: string;
  sections: ERPSection[];
  metadata?: {
    confidence?: number;
    warnings?: string[];
  };
}
