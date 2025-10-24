# API Endpoint Documentation

## POST /api/plans/generate

### Overview

Generates an AI-powered Emergency Response Plan using Anthropic's Claude 4 (Sonnet) model based on a comprehensive facility profile collected through the onboarding questionnaire.

### Authentication

**Required**: Yes (Supabase session cookie)

**Authorization**: User must be authenticated and have at least one organization membership.

### Request

**Method**: `POST`

**URL**: `/api/plans/generate`

**Content-Type**: `application/json`

**Body**:

```json
{
  "facilityProfile": {
    "name": "Acme Manufacturing Plant",
    "type": "manufacturing",
    "size": "51-200",
    "location": {
      "address": "123 Industrial Way",
      "city": "Detroit",
      "state": "MI",
      "zipCode": "48201",
      "country": "USA"
    },
    "facility": {
      "squareFootage": 50000,
      "floors": 1,
      "buildingAge": 25,
      "constructionType": "Steel Frame",
      "hasSprinklers": true,
      "hasGenerator": true,
      "hasSecuritySystem": true,
      "operatingHours": "24/7",
      "operates247": true,
      "shifts": 3
    },
    "assets": {
      "hasCollections": true,
      "inventoryValue": "high",
      "criticalEquipment": ["CNC Machine", "Forklift Fleet", "Injection Molding Press"],
      "criticalSystems": ["HVAC System", "Compressed Air System"],
      "criticalData": ["Production Schedules", "Quality Control Records"]
    },
    "hazards": ["fire", "chemical", "power_outage", "explosion", "hazmat"],
    "customHazards": ["Forklift accidents", "Chemical spills"],
    "riskLevel": "high",
    "team": {
      "managementCount": 15,
      "staffCount": 95,
      "contractorCount": 15,
      "hasEmergencyTeam": true,
      "hasAccessibilityNeeds": true,
      "accessibilityDetails": "Wheelchair users in office area",
      "multilingualStaff": ["Spanish", "Polish"],
      "specialConsiderations": ["Chemical storage area with Class 1 flammables"]
    },
    "compliance": ["OSHA", "FEMA", "NFPA", "ISO 22301"]
  }
}
```

### Facility Profile Schema

#### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Facility name | "Acme Manufacturing Plant" |
| `type` | enum | Facility type | "manufacturing" |
| `size` | enum | Organization size | "51-200" |
| `location.city` | string | City | "Detroit" |
| `location.state` | string | 2-letter state code | "MI" |
| `hazards` | array | Array of hazard types | ["fire", "chemical"] |
| `compliance` | array | Compliance frameworks | ["OSHA", "FEMA"] |

#### Optional Fields

All other fields in the facility profile are optional but provide better context for AI generation.

#### Enums

**Facility Type** (`type`):
- `healthcare` - Hospitals, clinics, urgent care
- `manufacturing` - Industrial facilities, plants
- `office` - Corporate buildings, headquarters
- `retail` - Stores, shopping centers
- `warehouse` - Distribution, storage facilities
- `educational` - Schools, universities
- `hospitality` - Hotels, restaurants
- `datacenter` - Colocation, enterprise servers
- `laboratory` - Research, testing, clinical
- `other` - Custom (use `customType` field)

**Organization Size** (`size`):
- `1-10` - Small startup/home office
- `11-50` - Small business
- `51-200` - Medium business
- `201-1000` - Large business
- `1000+` - Enterprise

**Hazard Types** (`hazards`):
- Natural: `fire`, `flood`, `earthquake`, `tornado`, `hurricane`
- Chemical/Biological: `chemical`, `biological`, `radiological`, `hazmat`
- Man-made: `explosion`, `active_shooter`, `cyberattack`
- Operational: `power_outage`, `medical_emergency`

**Compliance Frameworks** (`compliance`):
- `OSHA` - Occupational Safety and Health Administration
- `FEMA` - Federal Emergency Management Agency
- `NFPA` - National Fire Protection Association
- `JCAHO` - Joint Commission on Accreditation of Healthcare Organizations
- `HIPAA` - Health Insurance Portability and Accountability Act
- `ISO 22301` - Business Continuity Management
- `ISO 31000` - Risk Management

### Response

#### Success Response (201 Created)

```json
{
  "success": true,
  "plan": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "org_id": "f2604266-4cdc-4334-b86c-d140cdd3d7d4",
    "version": "1.0.0",
    "status": "draft",
    "created_at": "2025-10-24T15:30:00Z"
  },
  "tokensUsed": {
    "input": 2500,
    "output": 5000,
    "total": 7500
  },
  "message": "Emergency Response Plan generated successfully"
}
```

#### Error Responses

**401 Unauthorized** - User not authenticated
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request** - Missing facility profile
```json
{
  "error": "Missing facilityProfile in request body"
}
```

**400 Bad Request** - No organization found
```json
{
  "error": "No organization found. Please create an organization first."
}
```

**500 Internal Server Error** - AI generation failed
```json
{
  "error": "Failed to generate emergency plan",
  "code": "ANTHROPIC_API_ERROR",
  "retryable": true
}
```

**500 Internal Server Error** - Database error
```json
{
  "error": "Failed to save emergency plan",
  "details": "Database constraint violation"
}
```

### Implementation Details

#### Process Flow

1. **Authentication**: Validates user session via Supabase cookies
2. **Authorization**: Checks user has at least one organization membership
3. **Validation**: Validates facility profile structure
4. **AI Generation**: Calls `generateERP()` with Claude 4 Sonnet model
5. **Database Save**: Stores generated plan using service role client (bypasses RLS)
6. **Response**: Returns plan ID for frontend redirect

#### AI Model Configuration

- **Model**: `claude-sonnet-4-20250514`
- **Max Tokens**: 8,000
- **Temperature**: 0.3 (more deterministic)
- **Retry Logic**: 3 attempts with exponential backoff
- **Rate Limiting**: Minimum 1 second between requests

#### Token Usage

The API returns token usage statistics:
- `input`: Number of input tokens (prompt + system message)
- `output`: Number of generated tokens (ERP content)
- `total`: Sum of input and output tokens

**Cost Estimation** (as of 2025):
- Claude Sonnet 4: ~$3 per million input tokens, ~$15 per million output tokens
- Average ERP: ~2,500 input + ~5,000 output = ~$0.08 per plan

#### Database Storage

The generated plan is saved to the `emergency_plans` table with:

```sql
{
  "org_id": "uuid",
  "version": "1.0.0",
  "status": "draft",
  "content_json": {
    "generatedAt": "ISO 8601 timestamp",
    "facilityName": "Acme Manufacturing Plant",
    "facilityType": "manufacturing",
    "executiveSummary": "High-level overview...",
    "sections": [
      {
        "title": "Purpose and Scope",
        "content": "This Emergency Response Plan (ERP)...",
        "subsections": [...]
      },
      // ... more sections
    ],
    "tokensUsed": { "input": 2500, "output": 5000, "total": 7500 },
    "facilityProfile": { /* original input */ }
  },
  "created_by": "user_uuid"
}
```

### Usage Example

#### JavaScript/TypeScript (Frontend)

```typescript
async function generateEmergencyPlan(facilityProfile: FacilityProfile) {
  try {
    const response = await fetch("/api/plans/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ facilityProfile }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate plan");
    }

    const result = await response.json();

    console.log("Plan generated:", result.plan.id);
    console.log("Tokens used:", result.tokensUsed.total);

    // Redirect to plan page
    window.location.href = `/${result.plan.org_id}/plans/${result.plan.id}`;

    return result;
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
}
```

#### cURL

```bash
# Generate emergency plan (requires valid session cookie)
curl -X POST http://localhost:3000/api/plans/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN; sb-refresh-token=YOUR_REFRESH_TOKEN" \
  -d '{
    "facilityProfile": {
      "name": "Acme Manufacturing Plant",
      "type": "manufacturing",
      "size": "51-200",
      "location": { "city": "Detroit", "state": "MI" },
      "hazards": ["fire", "chemical"],
      "compliance": ["OSHA", "FEMA"]
    }
  }'
```

### Error Handling

#### Retry Logic

The API implements automatic retry for transient errors:
- **429 Too Many Requests**: Retry with exponential backoff
- **500+ Server Errors**: Retry up to 3 times
- **Network Errors**: Retry with increasing delays (1s, 2s, 4s)

#### Client-Side Handling

```typescript
async function generateWithRetry(facilityProfile: FacilityProfile) {
  const maxRetries = 2;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateEmergencyPlan(facilityProfile);
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (400-499)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError;
}
```

### Security Considerations

1. **Service Role Key**: Only used server-side, never exposed to client
2. **User Authentication**: Required via Supabase session
3. **Organization Authorization**: Verifies user membership before generation
4. **Rate Limiting**: Enforced at service level (1 req/second)
5. **Input Validation**: Facility profile validated before AI generation
6. **RLS Bypass**: Service role used only after manual auth checks

### Performance

- **Average Response Time**: 15-30 seconds
- **Max Token Limit**: 8,000 tokens output
- **Rate Limit**: 1 request per second (configurable)
- **Concurrent Requests**: Supported (handled by Next.js)

### Monitoring

The API logs the following events:

```
[/api/plans/generate] POST request received
[/api/plans/generate] User authenticated: {userId}
[/api/plans/generate] Generating ERP for: {facilityName} ({type})
[/api/plans/generate] Using organization: {orgId}
[/api/plans/generate] Calling generateERP()...
[/api/plans/generate] ERP generation completed in {duration}ms
[/api/plans/generate] ERP generated successfully. Tokens used: {total}
[/api/plans/generate] Plan saved to database: {planId}
```

### Testing

See `ONBOARDING_TEST_GUIDE.md` for comprehensive testing instructions including:
- 3 complete test data sets (Manufacturing, Healthcare, Office)
- Step-by-step testing procedures
- Expected API behaviors
- Browser DevTools monitoring

### Related Documentation

- `lib/anthropic/README.md` - AI service documentation
- `lib/validations/onboarding.ts` - Schema definitions
- `ONBOARDING_TEST_GUIDE.md` - End-to-end testing guide
- `PHASE_1_COMPLETE.md` - Project status and architecture

### Changelog

**Version 1.0.0** (October 24, 2025)
- Initial implementation
- Claude 4 Sonnet integration
- Multi-step onboarding support
- Service role pattern for RLS bypass
- Token usage tracking
- Comprehensive error handling
