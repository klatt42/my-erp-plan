/**
 * Prompt templates for AI-powered Emergency Response Plan generation
 * Organized by facility type with OSHA/FEMA compliance requirements
 */

import type { FacilityProfile, FacilityType, PromptVariables } from "./types";

/**
 * Base system prompt for all ERP generation
 */
export const BASE_SYSTEM_PROMPT = `You are an expert Emergency Response Plan (ERP) consultant with deep knowledge of:
- OSHA (Occupational Safety and Health Administration) regulations
- FEMA (Federal Emergency Management Agency) guidelines
- NFPA (National Fire Protection Association) standards
- Industry-specific emergency preparedness best practices
- Risk assessment and mitigation strategies
- Incident command systems (ICS)
- Business continuity planning

Your role is to generate comprehensive, actionable, and compliant emergency response plans tailored to specific facilities.

CORE PRINCIPLES:
1. Safety First: Prioritize life safety above property protection
2. Compliance: Ensure all recommendations meet regulatory requirements
3. Clarity: Use clear, actionable language that anyone can follow
4. Comprehensiveness: Cover all relevant emergency scenarios
5. Practicality: Recommendations must be implementable with available resources

OUTPUT FORMAT:
Generate the ERP in structured sections with clear headings, bullet points, and actionable steps.
Include specific responsibilities, contact protocols, and decision trees where appropriate.`;

/**
 * Compliance requirements by framework
 */
export const COMPLIANCE_REQUIREMENTS = {
  osha: `OSHA COMPLIANCE REQUIREMENTS:
- Emergency Action Plan (29 CFR 1910.38)
- Fire Prevention Plan (29 CFR 1910.39)
- Hazard Communication (29 CFR 1910.1200)
- Bloodborne Pathogens (if applicable, 29 CFR 1910.1030)
- Personal Protective Equipment (29 CFR 1910.132)
- Exit Routes and Emergency Planning (29 CFR 1910.33-39)
- Specific industry standards as applicable`,

  fema: `FEMA GUIDELINES:
- National Incident Management System (NIMS) compatibility
- Comprehensive Preparedness Guide (CPG 101)
- Emergency Operations Plan structure
- Continuity of Operations (COOP) planning
- Multi-hazard approach to emergency planning
- Integration with local emergency management
- Regular plan testing and updates`,

  nfpa: `NFPA STANDARDS:
- NFPA 1600: Disaster/Emergency Management and Business Continuity
- NFPA 101: Life Safety Code
- NFPA 72: National Fire Alarm and Signaling Code
- Fire prevention and protection systems
- Evacuation procedures and routes
- Emergency communication systems`,

  jcaho: `JOINT COMMISSION (JCAHO) STANDARDS:
- Emergency Management standards (EM)
- Environment of Care (EC) standards
- All-hazards approach to emergency preparedness
- Annual evaluation and testing requirements
- Staff training and competency
- Patient safety during emergencies`,

  hipaa: `HIPAA CONSIDERATIONS:
- Protected Health Information (PHI) safeguards during emergencies
- Emergency access to medical records
- Data backup and disaster recovery
- Breach notification procedures
- Business Associate agreements during incidents
- Privacy and security in temporary facilities`,

  iso_22301: `ISO 22301 (Business Continuity):
- Business continuity management system (BCMS)
- Business impact analysis (BIA)
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Continuity strategies and solutions
- Exercise and testing programs`,

  iso_31000: `ISO 31000 (Risk Management):
- Risk assessment methodology
- Risk treatment strategies
- Monitoring and review processes
- Communication and consultation
- Recording and reporting risk information
- Integration with organizational governance`,
};

/**
 * Facility-specific prompts
 */
export const FACILITY_PROMPTS: Record<
  FacilityType,
  (profile: FacilityProfile) => string
> = {
  healthcare: (profile) => `
HEALTHCARE FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Healthcare/${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

HEALTHCARE-SPECIFIC REQUIREMENTS:
- Patient safety and evacuation (including non-ambulatory patients)
- Medical equipment and pharmaceutical protection
- Continuity of critical care services
- Staff safety and surge capacity
- Infection control during emergencies
- Medical record protection and access
- Coordination with EMS and public health
- Joint Commission compliance${profile.compliance.includes("hipaa") ? "\n- HIPAA privacy and security" : ""}

CRITICAL SCENARIOS TO ADDRESS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP that ensures patient and staff safety while maintaining critical care capabilities.`,

  manufacturing: (profile) => `
MANUFACTURING FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Manufacturing/${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}${
    profile.infrastructure?.squareFootage
      ? `\nFacility Size: ${profile.infrastructure.squareFootage} sq ft`
      : ""
  }

MANUFACTURING-SPECIFIC REQUIREMENTS:
- Industrial hazard management (chemical, mechanical, electrical)
- Equipment shutdown procedures
- Hazardous material handling and storage
- Worker safety during shutdown/evacuation
- Production line emergency stops
- Environmental protection (spill control, emissions)
- Critical process continuity
- OSHA Process Safety Management (if applicable)

OPERATIONAL DETAILS:${
    profile.operatingHours?.twentyFourSeven
      ? "\n- 24/7 operations - shift-specific procedures required"
      : profile.operatingHours?.shifts
        ? `\n- ${profile.operatingHours.shifts}-shift operation`
        : ""
  }${profile.infrastructure?.hasGenerator ? "\n- Backup power available" : ""}

HAZARDS AND RISKS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP focused on worker safety, hazard control, and production continuity.`,

  office: (profile) => `
OFFICE FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Office/${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

OFFICE-SPECIFIC REQUIREMENTS:
- Employee evacuation and accountability
- Visitor management during emergencies
- Data center and IT system protection
- Business continuity and remote work capabilities
- Communication systems (internal and external)
- Accessibility for employees with disabilities
- Coordination with building management (if applicable)

BUILDING DETAILS:${profile.infrastructure?.floors ? `\n- ${profile.infrastructure.floors} floors` : ""}${profile.infrastructure?.hasSecuritySystem ? "\n- Security system in place" : ""}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP appropriate for an office environment with focus on personnel safety and business continuity.`,

  retail: (profile) => `
RETAIL FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Retail/${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

RETAIL-SPECIFIC REQUIREMENTS:
- Customer and employee safety
- High-traffic area management during evacuations
- Point-of-sale and cash handling security
- Inventory protection
- After-hours security and alarms
- Active shooter/security threat response
- Coordination with mall/shopping center security (if applicable)
- ADA compliance for customer accessibility

OPERATIONAL CONSIDERATIONS:${
    profile.personnel?.visitors
      ? `\n- Average daily customers: ${profile.personnel.visitors}`
      : ""
  }${profile.operatingHours?.standard ? `\n- Operating hours: ${profile.operatingHours.standard}` : ""}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP that prioritizes customer and employee safety in a public-facing environment.`,

  warehouse: (profile) => `
WAREHOUSE FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Warehouse/Distribution/${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

WAREHOUSE-SPECIFIC REQUIREMENTS:
- Material handling equipment safety
- Inventory and storage area evacuation
- Forklift and vehicle operator procedures
- Loading dock security and safety
- Hazardous material storage (if applicable)
- Large space evacuation procedures
- Fire suppression in high-bay areas
- Coordination with delivery/shipping personnel

FACILITY CHARACTERISTICS:${profile.infrastructure?.squareFootage ? `\n- ${profile.infrastructure.squareFootage} sq ft` : ""}${profile.infrastructure?.hasSprinklers ? "\n- Sprinkler system installed" : ""}${profile.collections ? `\n- Inventory types: ${profile.collections.map((c) => c.type).join(", ")}` : ""}

HAZARDS AND RISKS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP for warehouse operations with emphasis on material handling safety and inventory protection.`,

  educational: (profile) => `
EDUCATIONAL FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Educational/${profile.customType || "School/University"}
Facility Name: ${profile.name}
Size: ${profile.size} staff
Location: ${profile.location.city}, ${profile.location.state}

EDUCATIONAL-SPECIFIC REQUIREMENTS:
- Student safety and accountability (including minors)
- Lockdown and shelter-in-place procedures
- Parent reunification protocols
- Active shooter/intruder response
- Special needs student considerations
- Staff emergency roles and responsibilities
- Coordination with local law enforcement and EMS
- Communication with parents/guardians
- After-school event procedures

FACILITY CONSIDERATIONS:${profile.personnel?.visitors ? `\n- Daily student population: ~${profile.personnel.visitors}` : ""}${profile.infrastructure?.floors ? `\n- ${profile.infrastructure.floors}-story building(s)` : ""}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP that prioritizes student safety and includes age-appropriate procedures.`,

  hospitality: (profile) => `
HOSPITALITY FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Hospitality/${profile.customType || "Hotel/Restaurant"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

HOSPITALITY-SPECIFIC REQUIREMENTS:
- Guest safety and evacuation
- 24/7 operation considerations
- Multi-lingual communication needs
- Guest room accountability
- Kitchen fire safety
- Guest with disabilities assistance
- Night audit/skeleton crew procedures
- Key control during emergencies
- Coordination with local tourism authorities

OPERATIONAL DETAILS:${
    profile.operatingHours?.twentyFourSeven
      ? "\n- 24/7 operations"
      : ""
  }${profile.multilingualNeeds ? `\n- Languages needed: ${profile.multilingualNeeds.join(", ")}` : ""}${profile.infrastructure?.floors ? `\n- ${profile.infrastructure.floors} floors` : ""}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP appropriate for a hospitality environment with emphasis on guest safety and service continuity.`,

  datacenter: (profile) => `
DATA CENTER EMERGENCY RESPONSE PLAN

Facility Type: Data Center/${profile.customType || "Colocation/Enterprise"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

DATA CENTER-SPECIFIC REQUIREMENTS:
- Critical system protection and redundancy
- Fire suppression (clean agent systems)
- Environmental controls (HVAC, humidity)
- Power systems (UPS, generators, PDUs)
- Physical and cybersecurity during incidents
- Access control during emergencies
- Hot/cold aisle containment considerations
- Customer notification procedures
- SLA maintenance during emergencies

CRITICAL INFRASTRUCTURE:${profile.infrastructure?.hasGenerator ? "\n- Generator backup power" : ""}${profile.criticalResources?.systems ? `\n- Critical systems: ${profile.criticalResources.systems.join(", ")}` : ""}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP that ensures uptime and data integrity while maintaining personnel safety.`,

  laboratory: (profile) => `
LABORATORY FACILITY EMERGENCY RESPONSE PLAN

Facility Type: Laboratory/${profile.customType || "Research/Clinical"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

LABORATORY-SPECIFIC REQUIREMENTS:
- Chemical, biological, and radiological safety
- Specimen and sample protection
- Contamination control and decontamination
- Fume hood and ventilation systems
- Hazardous waste management
- Equipment shutdown procedures
- Biosafety level considerations
- Research data and backup protection
- Coordination with environmental health & safety

SAFETY INFRASTRUCTURE:${profile.infrastructure?.hasSprinklers ? "\n- Fire suppression systems" : ""}${profile.criticalResources?.equipment ? `\n- Critical equipment: ${profile.criticalResources.equipment.join(", ")}` : ""}

HAZARDS AND RISKS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive ERP with strict focus on hazardous material control and personnel decontamination procedures.`,

  other: (profile) => `
EMERGENCY RESPONSE PLAN

Facility Type: ${profile.customType || "General"}
Facility Name: ${profile.name}
Size: ${profile.size} employees
Location: ${profile.location.city}, ${profile.location.state}

FACILITY REQUIREMENTS:
- Personnel safety and evacuation
- Visitor management
- Communication protocols
- Emergency contacts and chain of command
- Asset and data protection
- Business continuity considerations

${
  profile.specialConsiderations && profile.specialConsiderations.length > 0
    ? `SPECIAL CONSIDERATIONS:\n${profile.specialConsiderations.map((c) => `- ${c}`).join("\n")}`
    : ""
}

EMERGENCY SCENARIOS:
${profile.hazards.map((h) => `- ${h.replace(/_/g, " ").toUpperCase()}`).join("\n")}
${profile.customHazards ? profile.customHazards.map((h) => `- ${h}`).join("\n") : ""}

Generate a comprehensive, industry-standard ERP tailored to this facility's unique characteristics.`,
};

/**
 * Builds complete system prompt with compliance requirements
 */
export function buildSystemPrompt(profile: FacilityProfile): string {
  const compliancePrompts = profile.compliance
    .map((framework) => COMPLIANCE_REQUIREMENTS[framework])
    .filter(Boolean)
    .join("\n\n");

  return `${BASE_SYSTEM_PROMPT}

${compliancePrompts}

ACCESSIBILITY REQUIREMENTS:
${profile.accessibilityNeeds ? "- Ensure all procedures accommodate individuals with disabilities\n- Include visual, auditory, and mobility considerations\n- Specify assistance protocols for evacuation" : "- Standard accessibility considerations apply"}

${profile.multilingualNeeds && profile.multilingualNeeds.length > 0 ? `MULTILINGUAL REQUIREMENTS:\n- Plan must be available in: ${profile.multilingualNeeds.join(", ")}\n- Consider language barriers in emergency communication` : ""}`;
}

/**
 * Builds user prompt for specific facility
 */
export function buildUserPrompt(profile: FacilityProfile): string {
  const facilityPrompt =
    FACILITY_PROMPTS[profile.type]?.(profile) ||
    FACILITY_PROMPTS.other(profile);

  return `${facilityPrompt}

REQUIRED SECTIONS:
1. Executive Summary
2. Purpose and Scope
3. Emergency Contact Information
4. Chain of Command and Responsibilities
5. Emergency Scenarios and Response Procedures
6. Evacuation Procedures and Routes
7. Communication Protocols
8. Resource Management
9. Training and Drills
10. Plan Maintenance and Updates

For each emergency scenario, provide:
- Immediate actions (first 5 minutes)
- Response procedures (first hour)
- Recovery procedures (first 24 hours)
- Specific roles and responsibilities
- Decision criteria and escalation paths

Include practical checklists and templates where appropriate.

Format the response in clear markdown with proper headings and bullet points.`;
}

/**
 * Template variables extractor
 */
export function extractPromptVariables(
  profile: FacilityProfile
): PromptVariables {
  return {
    facilityName: profile.name,
    facilityType: profile.customType || profile.type,
    location: `${profile.location.city}, ${profile.location.state}`,
    size: profile.size,
    hazards: [
      ...profile.hazards.map((h) => h.replace(/_/g, " ")),
      ...(profile.customHazards || []),
    ],
    compliance: profile.compliance,
    specialConsiderations: profile.specialConsiderations,
    employeeCount: profile.employeeCount,
    squareFootage: profile.infrastructure?.squareFootage,
    floors: profile.infrastructure?.floors,
    operatingHours: profile.operatingHours?.standard,
    hasGenerator: profile.infrastructure?.hasGenerator,
    hasSprinklers: profile.infrastructure?.hasSprinklers,
  };
}
