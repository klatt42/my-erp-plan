import Anthropic from "@anthropic-ai/sdk";
import type {
  FacilityProfile,
  GenerateERPRequest,
  ClaudeAPIResponse,
  GeneratedERP,
  TokenUsage,
} from "./types";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "./prompts";
import {
  parseERPResponse,
  extractStandardSections,
  extractChecklists,
  retryWithBackoff,
  logTokenUsage,
  enforceRateLimit,
  validateFacilityProfile,
} from "./utils";

/**
 * Claude model to use for ERP generation
 */
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/**
 * Maximum tokens for response
 */
const MAX_TOKENS = 8000;

/**
 * Creates an Anthropic client instance for Claude API interactions
 * @returns Anthropic client instance
 */
export function createAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set. Please configure it in your .env file."
    );
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

/**
 * Generate AI-powered Emergency Response Plan using Claude 4
 *
 * @param facilityProfile - Complete facility profile data
 * @param options - Optional generation parameters
 * @returns ClaudeAPIResponse with generated ERP or error
 *
 * @example
 * ```typescript
 * const facilityData: FacilityProfile = {
 *   name: "Acme Manufacturing",
 *   type: "manufacturing",
 *   size: "51-200",
 *   location: { city: "Detroit", state: "MI" },
 *   hazards: ["fire", "chemical", "power_outage"],
 *   compliance: ["osha", "fema"],
 * };
 *
 * const result = await generateERP(facilityData);
 * if (result.success) {
 *   console.log("ERP generated:", result.data);
 * }
 * ```
 */
export async function generateERP(
  facilityProfile: FacilityProfile,
  options?: GenerateERPRequest["options"]
): Promise<ClaudeAPIResponse> {
  const startTime = Date.now();

  // Validate facility profile
  const validation = validateFacilityProfile(facilityProfile);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        message: `Invalid facility profile: ${validation.errors.join(", ")}`,
        code: "VALIDATION_ERROR",
        retryable: false,
      },
    };
  }

  // Log warnings if any
  if (validation.warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      "[generateERP] Profile warnings:",
      validation.warnings.join(", ")
    );
  }

  try {
    // Enforce rate limiting
    await enforceRateLimit();

    // Build prompts
    const systemPrompt = buildSystemPrompt(facilityProfile);
    const userPrompt = buildUserPrompt(facilityProfile);

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[generateERP] Generating ERP for ${facilityProfile.name} (${facilityProfile.type})`
      );
      console.log(`[generateERP] Model: ${CLAUDE_MODEL}, Max tokens: ${MAX_TOKENS}`);
    }

    // Call Claude API with retry logic
    const response = await retryWithBackoff(
      async () => {
        const client = createAnthropicClient();

        return await client.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          temperature: 0.3, // Lower temperature for more consistent, factual output
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        });
      },
      undefined, // Use default retry config
      (attempt, error) => {
        console.warn(
          `[generateERP] Retry attempt ${attempt} after error:`,
          error.message
        );
      }
    );

    // Extract text content
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Claude API");
    }

    const rawText = content.text;

    // Parse response into structured format
    const parsed = parseERPResponse(rawText);

    // Log parsing warnings
    if (parsed.metadata?.warnings && process.env.NODE_ENV === "development") {
      console.warn("[generateERP] Parsing warnings:", parsed.metadata.warnings);
    }

    // Extract standard sections
    const standardSections = extractStandardSections(parsed.sections);

    // Extract checklists
    const checklists = extractChecklists(rawText);

    // Build GeneratedERP object
    const generatedERP: GeneratedERP = {
      generatedAt: new Date().toISOString(),
      facilityName: facilityProfile.name,
      facilityType: facilityProfile.type,
      version: "1.0.0",
      executiveSummary:
        parsed.sections.find((s) =>
          s.id.includes("executive") || s.id.includes("summary")
        )?.content || "",
      sections: parsed.sections,
      ...standardSections,
      checklists: checklists.length > 0 ? checklists : undefined,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      },
    };

    // Log token usage
    const tokenUsage: TokenUsage = {
      timestamp: new Date().toISOString(),
      facilityName: facilityProfile.name,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      model: CLAUDE_MODEL,
      requestType: "erp_generation",
    };
    logTokenUsage(tokenUsage);

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[generateERP] ✅ Success in ${duration}ms | Tokens: ${tokenUsage.totalTokens} | Sections: ${parsed.sections.length}`
      );
    }

    return {
      success: true,
      data: generatedERP,
      tokensUsed: generatedERP.tokensUsed,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(
      `[generateERP] ❌ Failed after ${duration}ms:`,
      error.message
    );

    // Determine if error is retryable
    const retryable =
      error.status === 429 ||
      error.status >= 500 ||
      error.type === "overloaded_error";

    return {
      success: false,
      error: {
        message: error.message || "Unknown error occurred",
        code: error.code || error.type || "UNKNOWN_ERROR",
        retryable,
      },
    };
  }
}

/**
 * LEGACY: Generates emergency plan content using Claude
 * @deprecated Use generateERP() instead for full functionality
 * @param prompt - The prompt for plan generation
 * @param organizationContext - Context about the organization
 * @returns Generated plan content
 */
export async function generatePlanContent(
  prompt: string,
  organizationContext?: {
    name: string;
    industry?: string;
    size?: string;
    location?: string;
  }
): Promise<string> {
  const client = createAnthropicClient();

  const systemPrompt = `You are an expert emergency response planner. Generate comprehensive, actionable emergency response plans that follow industry best practices and regulatory requirements.

${
  organizationContext
    ? `Organization Context:
- Name: ${organizationContext.name}
- Industry: ${organizationContext.industry || "Not specified"}
- Size: ${organizationContext.size || "Not specified"}
- Location: ${organizationContext.location || "Not specified"}`
    : ""
}

Format the plan in clear sections with actionable steps, responsibilities, and contact information.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response format from Claude API");
}

/**
 * Analyzes an incident and suggests response actions
 * @param incidentDescription - Description of the incident
 * @param availableResources - Available resources for response
 * @returns Suggested response actions
 */
export async function analyzeIncident(
  incidentDescription: string,
  availableResources?: string[]
): Promise<string> {
  const client = createAnthropicClient();

  const prompt = `Analyze this emergency incident and provide immediate response recommendations:

Incident: ${incidentDescription}

${
  availableResources && availableResources.length > 0
    ? `Available Resources: ${availableResources.join(", ")}`
    : ""
}

Provide:
1. Immediate actions to take
2. Resources to deploy
3. Communication priorities
4. Safety considerations`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    temperature: 0.5,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response format from Claude API");
}
