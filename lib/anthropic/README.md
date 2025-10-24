# Anthropic Claude Integration - AI-Powered ERP Generation

Comprehensive service for generating Emergency Response Plans using Claude 4 (Sonnet).

## Overview

This integration provides:
- ✅ AI-powered Emergency Response Plan generation
- ✅ OSHA/FEMA/NFPA compliance requirements built-in
- ✅ Facility-type-specific prompts (9 facility types)
- ✅ Retry logic with exponential backoff
- ✅ Rate limiting awareness
- ✅ Token usage tracking and logging
- ✅ Response parsing and structuring
- ✅ TypeScript types throughout

## Files

```
lib/anthropic/
├── client.ts       # Main API client with generateERP() function
├── types.ts        # TypeScript type definitions
├── prompts.ts      # System prompts for different facility types
├── utils.ts        # Helper functions (parsing, retry, logging)
├── example.ts      # Usage examples for 5 facility types
└── README.md       # This file
```

## Quick Start

### 1. Basic Usage

```typescript
import { generateERP } from "@/lib/anthropic/client";
import type { FacilityProfile } from "@/lib/anthropic/types";

const facilityData: FacilityProfile = {
  name: "Acme Manufacturing",
  type: "manufacturing",
  size: "51-200",
  location: { city: "Detroit", state: "MI" },
  hazards: ["fire", "chemical", "power_outage"],
  compliance: ["osha", "fema"],
};

const result = await generateERP(facilityData);

if (result.success) {
  console.log("Generated ERP:", result.data);
  console.log("Tokens used:", result.tokensUsed);
} else {
  console.error("Error:", result.error);
}
```

### 2. With Full Options

```typescript
const facilityData: FacilityProfile = {
  // Required fields
  name: "Riverside Medical Center",
  type: "healthcare",
  size: "11-50",
  location: { city: "Portland", state: "OR" },
  hazards: ["fire", "medical_emergency"],
  compliance: ["osha", "hipaa", "jcaho"],

  // Optional but recommended
  employeeCount: 35,
  operatingHours: { standard: "7am-9pm, 7 days/week" },
  infrastructure: {
    squareFootage: 8000,
    floors: 2,
    hasGenerator: true,
  },
  accessibilityNeeds: true,
  specialConsiderations: [
    "Non-ambulatory patients require assistance",
  ],
};

const result = await generateERP(facilityData);
```

## Facility Types Supported

The system includes specialized prompts for 9 facility types:

1. **healthcare** - Hospitals, clinics, urgent care
2. **manufacturing** - Industrial facilities, plants
3. **office** - Office buildings, corporate headquarters
4. **retail** - Stores, shopping centers
5. **warehouse** - Distribution centers, storage facilities
6. **educational** - Schools, universities
7. **hospitality** - Hotels, restaurants
8. **datacenter** - Data centers, colocation facilities
9. **laboratory** - Research labs, testing facilities
10. **other** - General facilities (provide customType)

## Compliance Frameworks

Built-in compliance requirements for:

- **OSHA** - Emergency Action Plans, Fire Prevention, Hazard Communication
- **FEMA** - NIMS compatibility, CPG 101, COOP planning
- **NFPA** - NFPA 1600, 101 Life Safety Code, Fire alarm systems
- **JCAHO** - Joint Commission emergency management standards
- **HIPAA** - PHI safeguards during emergencies
- **ISO 22301** - Business continuity management
- **ISO 31000** - Risk management principles

## Hazard Categories

Supported hazard types:

- `fire` - Fire emergencies
- `flood` - Flooding events
- `earthquake` - Seismic events
- `tornado` / `hurricane` - Severe weather
- `chemical` / `biological` / `radiological` - Hazmat incidents
- `explosion` - Explosive hazards
- `active_shooter` - Security threats
- `cyberattack` - Cyber incidents
- `power_outage` - Electrical failures
- `medical_emergency` - Medical events
- `hazmat` - Hazardous materials

## API Configuration

### Model Settings

```typescript
Model: claude-sonnet-4-20250514
Max Tokens: 8000
Temperature: 0.3  // Lower for factual, consistent output
```

### Environment Variables

Required in `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Features

### 1. Retry Logic

Automatic retry with exponential backoff for:
- Network errors (ECONNREFUSED, ETIMEDOUT)
- Rate limit errors (429)
- Server errors (5xx)
- Overloaded errors

Default configuration:
```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
}
```

### 2. Rate Limiting

Built-in rate limiting:
- Minimum 1 second between requests
- Automatic throttling
- Prevents API quota issues

### 3. Token Usage Tracking

Automatic logging of:
- Input tokens
- Output tokens
- Total tokens
- Facility name
- Request timestamp
- Model used

Access usage stats:
```typescript
import { getTokenUsageStats } from "@/lib/anthropic/utils";

const stats = getTokenUsageStats();
console.log(stats);
// {
//   totalRequests: 10,
//   totalTokens: 85000,
//   avgTokensPerRequest: 8500,
//   byRequestType: { ... }
// }
```

### 4. Response Parsing

Automatic parsing of Claude's markdown response into:
- Structured sections with IDs
- Subsections
- Executive summary extraction
- Standard section extraction (evacuation, fire, medical, etc.)
- Checklist extraction
- Confidence scoring

### 5. Validation

Pre-flight validation of facility profiles:
```typescript
import { validateFacilityProfile } from "@/lib/anthropic/utils";

const validation = validateFacilityProfile(facilityData);
if (!validation.valid) {
  console.error("Errors:", validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn("Warnings:", validation.warnings);
}
```

## Response Structure

```typescript
interface GeneratedERP {
  generatedAt: string;
  facilityName: string;
  facilityType: FacilityType;
  version: string;
  executiveSummary: string;
  sections: ERPSection[];

  // Quick access sections
  evacuation?: string;
  fireResponse?: string;
  medicalEmergency?: string;
  naturalDisaster?: string;
  security?: string;
  communication?: string;
  recovery?: string;

  // Supporting materials
  checklists?: { title: string; items: string[] }[];

  // Token usage
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
}
```

## Error Handling

```typescript
const result = await generateERP(facilityData);

if (!result.success) {
  if (result.error?.retryable) {
    // Retry later
    console.log("Temporary error, retry in:", result.rateLimitInfo?.resetAt);
  } else {
    // Permanent error
    console.error("Failed:", result.error?.message);
  }
}
```

## Cost Estimation

Estimate tokens before API call:

```typescript
import { estimateTokens } from "@/lib/anthropic/utils";

const estimate = estimateTokens(facilityData);
console.log(`Estimated cost: $${estimate.estimatedCost.toFixed(4)}`);
console.log(`Estimated tokens: ${estimate.estimatedTotalTokens}`);
```

## Examples

See `example.ts` for complete working examples:

1. Manufacturing facility with chemical hazards
2. Healthcare facility with HIPAA compliance
3. Office building with cybersecurity
4. Elementary school with student safety focus
5. Minimal data example (required fields only)

Run examples:
```typescript
import { runAllExamples } from "@/lib/anthropic/example";

await runAllExamples();
```

## Integration with API Routes

Use in API route (app/api/plans/route.ts):

```typescript
import { generateERP } from "@/lib/anthropic/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { facilityProfile, orgId } = body;

  // Generate ERP with Claude
  const result = await generateERP(facilityProfile);

  if (!result.success) {
    return Response.json(
      { error: result.error?.message },
      { status: 500 }
    );
  }

  // Save to database
  const { data: plan } = await supabase
    .from("emergency_plans")
    .insert({
      org_id: orgId,
      title: `${facilityProfile.name} - Emergency Response Plan`,
      content: result.data,
      status: "draft",
    })
    .select()
    .single();

  return Response.json({ plan, tokensUsed: result.tokensUsed });
}
```

## Best Practices

1. **Validate Input** - Always validate facility profiles before calling API
2. **Handle Errors** - Check `result.success` and handle both retryable/non-retryable errors
3. **Log Usage** - Token usage is automatically logged in development
4. **Rate Limit** - Built-in rate limiting prevents API quota issues
5. **Cost Awareness** - Use `estimateTokens()` for cost estimation
6. **Save Results** - Store generated ERPs in database immediately
7. **Version Control** - Use version field for plan updates/revisions

## Debugging

Enable detailed logging:

```bash
NODE_ENV=development npm run dev
```

Logs include:
- Request details (facility, model, tokens)
- Retry attempts with errors
- Parsing warnings
- Success/failure with duration
- Token usage per request

## Testing

```typescript
// Test with minimal data
const testData: FacilityProfile = {
  name: "Test Facility",
  type: "office",
  size: "1-10",
  location: { city: "Austin", state: "TX" },
  hazards: ["fire"],
  compliance: ["osha"],
};

const result = await generateERP(testData);
console.assert(result.success, "ERP generation failed");
console.assert(result.data?.sections.length > 0, "No sections generated");
```

## Performance

Typical performance metrics:

- **Generation Time**: 10-30 seconds (depending on complexity)
- **Token Usage**: 3,000-10,000 tokens (input + output)
- **Cost Per Request**: $0.02-$0.10 (varies by facility complexity)
- **Rate Limit**: Max 1 request/second (built-in throttling)

## Troubleshooting

**Error: "ANTHROPIC_API_KEY is not set"**
```bash
# Add to .env file
ANTHROPIC_API_KEY=your-key-here
```

**Error: "Rate limit exceeded"**
- Wait for rate limit reset (check `rateLimitInfo.resetAt`)
- Automatic retry will handle this

**Error: "Validation failed"**
- Check `validation.errors` for missing required fields
- Ensure all required fields are provided

**Low confidence score in response**
- Add more detail to facility profile
- Include infrastructure, personnel, special considerations
- Specify custom hazards if needed

## Future Enhancements

Potential improvements:

- [ ] Streaming response support
- [ ] Multi-language ERP generation
- [ ] Plan comparison and diff
- [ ] Automated plan updates
- [ ] Integration with external data sources
- [ ] Custom prompt templates
- [ ] Fine-tuned models for specific industries

---

**Version**: 1.0.0
**Last Updated**: October 24, 2025
**Model**: claude-sonnet-4-20250514
**Max Tokens**: 8000
