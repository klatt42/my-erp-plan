import Anthropic from "@anthropic-ai/sdk";

/**
 * Creates an Anthropic client instance for Claude API interactions
 * @returns Anthropic client instance
 */
export function createAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

/**
 * Generates emergency plan content using Claude
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
