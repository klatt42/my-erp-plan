/**
 * Utility functions for Anthropic Claude API integration
 * Response parsing, retry logic, and token usage tracking
 */

import type {
  ERPSection,
  ParsedERPResponse,
  RetryConfig,
  TokenUsage,
  GeneratedERP,
} from "./types";

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Parse Claude's markdown response into structured ERP sections
 */
export function parseERPResponse(rawText: string): ParsedERPResponse {
  const sections: ERPSection[] = [];
  const lines = rawText.split("\n");

  let currentSection: ERPSection | null = null;
  let currentSubsection: { id: string; title: string; content: string; order: number } | null = null;
  let sectionOrder = 0;
  let subsectionOrder = 0;
  let contentBuffer: string[] = [];

  for (const line of lines) {
    // Check for main section (## or #)
    const mainSectionMatch = line.match(/^#{1,2}\s+(.+)$/);
    if (mainSectionMatch) {
      // Save previous section if exists
      if (currentSection) {
        if (currentSubsection) {
          currentSubsection.content = contentBuffer.join("\n").trim();
          currentSection.subsections = currentSection.subsections || [];
          currentSection.subsections.push(currentSubsection);
          currentSubsection = null;
        } else {
          currentSection.content = contentBuffer.join("\n").trim();
        }
        sections.push(currentSection);
      }

      // Start new section
      const title = mainSectionMatch[1].trim();
      currentSection = {
        id: slugify(title),
        title,
        content: "",
        order: sectionOrder++,
        subsections: [],
      };
      contentBuffer = [];
      subsectionOrder = 0;
      continue;
    }

    // Check for subsection (### or ####)
    const subsectionMatch = line.match(/^#{3,4}\s+(.+)$/);
    if (subsectionMatch && currentSection) {
      // Save previous subsection if exists
      if (currentSubsection) {
        currentSubsection.content = contentBuffer.join("\n").trim();
        currentSection.subsections = currentSection.subsections || [];
        currentSection.subsections.push(currentSubsection);
      }

      // Start new subsection
      const title = subsectionMatch[1].trim();
      currentSubsection = {
        id: slugify(title),
        title,
        content: "",
        order: subsectionOrder++,
      };
      contentBuffer = [];
      continue;
    }

    // Add to content buffer
    contentBuffer.push(line);
  }

  // Save final section/subsection
  if (currentSection) {
    if (currentSubsection) {
      currentSubsection.content = contentBuffer.join("\n").trim();
      currentSection.subsections = currentSection.subsections || [];
      currentSection.subsections.push(currentSubsection);
    } else {
      currentSection.content = contentBuffer.join("\n").trim();
    }
    sections.push(currentSection);
  }

  // Analyze response quality
  const warnings: string[] = [];
  if (sections.length < 5) {
    warnings.push("Response appears incomplete - fewer than 5 sections");
  }
  if (rawText.length < 1000) {
    warnings.push("Response is very short - may lack detail");
  }

  return {
    rawText,
    sections,
    metadata: {
      confidence: calculateConfidence(sections),
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  };
}

/**
 * Calculate confidence score based on section completeness
 */
function calculateConfidence(sections: ERPSection[]): number {
  let score = 0;
  const requiredSections = [
    "executive-summary",
    "purpose",
    "emergency-contact",
    "chain-of-command",
    "evacuation",
    "communication",
  ];

  // Check for required sections (40 points)
  const sectionIds = sections.map((s) => s.id);
  const foundRequired = requiredSections.filter((req) =>
    sectionIds.some((id) => id.includes(req))
  );
  score += (foundRequired.length / requiredSections.length) * 40;

  // Check average section length (30 points)
  const avgLength =
    sections.reduce((sum, s) => sum + s.content.length, 0) / sections.length;
  score += Math.min((avgLength / 500) * 30, 30);

  // Check for subsections (20 points)
  const hasSubsections = sections.some(
    (s) => s.subsections && s.subsections.length > 0
  );
  score += hasSubsections ? 20 : 0;

  // Check total content length (10 points)
  const totalLength = sections.reduce((sum, s) => sum + s.content.length, 0);
  score += Math.min((totalLength / 5000) * 10, 10);

  return Math.round(score);
}

/**
 * Extract specific standard sections from parsed ERP
 */
export function extractStandardSections(sections: ERPSection[]): {
  evacuation?: string;
  fireResponse?: string;
  medicalEmergency?: string;
  naturalDisaster?: string;
  security?: string;
  communication?: string;
  recovery?: string;
} {
  const result: any = {};

  const findSection = (keywords: string[]): string | undefined => {
    const section = sections.find((s) =>
      keywords.some((k) => s.id.includes(k) || s.title.toLowerCase().includes(k))
    );
    return section?.content;
  };

  result.evacuation = findSection(["evacuation", "evacuate"]);
  result.fireResponse = findSection(["fire", "fire-response"]);
  result.medicalEmergency = findSection(["medical", "medical-emergency"]);
  result.naturalDisaster = findSection([
    "natural-disaster",
    "disaster",
    "weather",
  ]);
  result.security = findSection(["security", "active-shooter", "intruder"]);
  result.communication = findSection(["communication", "notifications"]);
  result.recovery = findSection(["recovery", "business-continuity"]);

  return result;
}

/**
 * Extract checklists from response
 */
export function extractChecklists(rawText: string): {
  title: string;
  items: string[];
}[] {
  const checklists: { title: string; items: string[] }[] = [];
  const checklistPattern = /###?\s+(.+?checklist.+?)\n((?:[-*]\s+.+\n?)+)/gi;

  let match;
  while ((match = checklistPattern.exec(rawText)) !== null) {
    const title = match[1].trim();
    const itemsText = match[2];
    const items = itemsText
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("*"))
      .map((line) => line.replace(/^[-*]\s+/, "").trim())
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      checklists.push({ title, items });
    }
  }

  return checklists;
}

/**
 * Slugify string for IDs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Implement exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Last attempt failed
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait with exponential backoff
      await sleep(delay);
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError!;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
    return true;
  }

  // Rate limit errors
  if (error.status === 429 || error.code === "rate_limit_exceeded") {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Anthropic-specific overloaded error
  if (error.type === "overloaded_error") {
    return true;
  }

  return false;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Track token usage
 */
const tokenUsageLog: TokenUsage[] = [];

export function logTokenUsage(usage: TokenUsage): void {
  tokenUsageLog.push(usage);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Claude API] ${usage.requestType} | Facility: ${usage.facilityName} | Tokens: ${usage.totalTokens} (in: ${usage.inputTokens}, out: ${usage.outputTokens})`
    );
  }
}

/**
 * Get token usage statistics
 */
export function getTokenUsageStats(facilityName?: string): {
  totalRequests: number;
  totalTokens: number;
  avgTokensPerRequest: number;
  byRequestType: Record<string, { requests: number; tokens: number }>;
} {
  const filtered = facilityName
    ? tokenUsageLog.filter((u) => u.facilityName === facilityName)
    : tokenUsageLog;

  const totalTokens = filtered.reduce((sum, u) => sum + u.totalTokens, 0);
  const byType: Record<string, { requests: number; tokens: number }> = {};

  filtered.forEach((usage) => {
    if (!byType[usage.requestType]) {
      byType[usage.requestType] = { requests: 0, tokens: 0 };
    }
    byType[usage.requestType].requests++;
    byType[usage.requestType].tokens += usage.totalTokens;
  });

  return {
    totalRequests: filtered.length,
    totalTokens,
    avgTokensPerRequest: filtered.length > 0 ? Math.round(totalTokens / filtered.length) : 0,
    byRequestType: byType,
  };
}

/**
 * Clear token usage log (useful for testing)
 */
export function clearTokenUsageLog(): void {
  tokenUsageLog.length = 0;
}

/**
 * Rate limit tracker
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // Minimum 1 second between requests

/**
 * Rate limiting helper
 */
export async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();
}

/**
 * Validate facility profile completeness
 */
export function validateFacilityProfile(profile: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!profile.name) errors.push("Facility name is required");
  if (!profile.type) errors.push("Facility type is required");
  if (!profile.size) errors.push("Organization size is required");
  if (!profile.location?.city) errors.push("City is required");
  if (!profile.location?.state) errors.push("State is required");
  if (!profile.hazards || profile.hazards.length === 0)
    errors.push("At least one hazard must be specified");
  if (!profile.compliance || profile.compliance.length === 0)
    errors.push("At least one compliance framework must be specified");

  // Warnings for missing optional but recommended fields
  if (!profile.employeeCount) warnings.push("Employee count not specified");
  if (!profile.infrastructure?.squareFootage)
    warnings.push("Facility square footage not specified");
  if (!profile.operatingHours) warnings.push("Operating hours not specified");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format ERP for display
 */
export function formatERPForDisplay(erp: GeneratedERP): string {
  let output = `# ${erp.facilityName} - Emergency Response Plan\n\n`;
  output += `**Generated:** ${new Date(erp.generatedAt).toLocaleString()}\n`;
  output += `**Version:** ${erp.version}\n\n`;
  output += `---\n\n`;

  if (erp.executiveSummary) {
    output += `## Executive Summary\n\n${erp.executiveSummary}\n\n---\n\n`;
  }

  erp.sections.forEach((section) => {
    output += `## ${section.title}\n\n${section.content}\n\n`;

    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection) => {
        output += `### ${subsection.title}\n\n${subsection.content}\n\n`;
      });
    }
  });

  if (erp.checklists && erp.checklists.length > 0) {
    output += `---\n\n## Appendix: Checklists\n\n`;
    erp.checklists.forEach((checklist) => {
      output += `### ${checklist.title}\n\n`;
      checklist.items.forEach((item) => {
        output += `- [ ] ${item}\n`;
      });
      output += `\n`;
    });
  }

  return output;
}

/**
 * Calculate estimated tokens for a facility profile
 * Useful for estimating cost before API call
 */
export function estimateTokens(profile: any): {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  estimatedCost: number; // in USD
} {
  // Rough estimation based on profile complexity
  const baseTokens = 2000; // System prompt
  const facilityTokens = JSON.stringify(profile).length / 4; // ~4 chars per token
  const outputTokens = 8000; // Max output we request

  const inputTokens = Math.ceil(baseTokens + facilityTokens);
  const totalTokens = inputTokens + outputTokens;

  // Claude pricing (as of 2024): ~$3 per million input tokens, ~$15 per million output
  const cost =
    (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;

  return {
    estimatedInputTokens: inputTokens,
    estimatedOutputTokens: outputTokens,
    estimatedTotalTokens: totalTokens,
    estimatedCost: cost,
  };
}
