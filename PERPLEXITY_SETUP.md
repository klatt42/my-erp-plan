# Perplexity AI Integration Setup

This document explains how to set up and use the Perplexity AI integration for automated facility research.

## Overview

The Perplexity integration automatically researches and populates:
- **Emergency Services**: Nearest hospitals, fire departments, police with contact information
- **Local Hazards**: Environmental and safety risks for your facility location
- **Facility Context**: Business type, operations, and industry-specific safety regulations

## Setup Instructions

### 1. Get a Perplexity API Key

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account or log in
3. Navigate to API settings
4. Generate an API key (starts with `pplx-`)
5. Copy your API key

### 2. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```env
PERPLEXITY_API_KEY=pplx-your-actual-api-key-here
```

**Important**: Never commit your `.env.local` file to version control.

### 3. Run Database Migration

The facility research feature requires new database columns. Run the migration:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250126000000_add_facility_research.sql`
4. Paste and execute the SQL

**Option B: Using Supabase CLI** (if installed)
```bash
supabase db push
```

The migration adds:
- `facility_research` (JSONB) - Stores research data
- `research_last_updated` (TIMESTAMPTZ) - Tracks research freshness

### 4. Restart Your Development Server

```bash
npm run dev
```

## Usage

### From Organization Settings

1. Navigate to **Settings** in your organization dashboard
2. Find the **Emergency Response Research** card
3. Click **Research Emergency Info** button
4. Wait for the research to complete (typically 10-30 seconds)
5. View the results in the dialog that appears

### Automatic Integration

Once research is performed:
- Data is cached in the database
- Emergency contacts will auto-populate in new emergency plans
- Local hazards will be suggested as scenarios
- Facility context will inform AI plan generation

### Refreshing Research

Research can be refreshed:
- **Manually**: Click "Update Emergency Info" in Settings
- **Automatically**: System will prompt for updates after 90 days
- **On Change**: When facility address is updated

## API Usage and Costs

### Perplexity API Pricing (as of 2025)

The integration uses the `llama-3.1-sonar-large-128k-online` model which:
- Includes real-time web search
- Returns cited sources
- Provides up-to-date information

**Typical Research Session**:
- Makes 3 API calls (emergency services, hazards, facility info)
- Total tokens: ~1500-3000 tokens per complete research
- Cost: Approximately $0.01-0.03 per facility research

**Cost Control**:
- Research is cached for 90 days
- Only triggered manually or on significant changes
- Estimated cost: $1-3 per organization per year (assuming quarterly updates)

## Features

### Research Components

**1. Emergency Services Research**
```typescript
// Returns:
{
  type: "hospital" | "fire" | "police" | "poison_control",
  name: "Memorial Hospital Emergency Room",
  address: "123 Main St, City, State 12345",
  phone: "(555) 123-4567",
  distance: "2.3 miles"
}
```

**2. Local Hazards Research**
```typescript
// Returns:
{
  type: "Flooding" | "Earthquake" | "Tornado" | etc,
  severity: "low" | "medium" | "high",
  description: "FEMA flood zone designation: Zone X (minimal risk)",
  preparedness_notes: "Maintain 72-hour emergency supplies"
}
```

**3. Facility Information Research**
```typescript
// Returns:
{
  business_type: "Manufacturing facility",
  operations_summary: "Industrial fabrication and assembly",
  estimated_size: "50-100 employees",
  industry_regulations: ["OSHA 1910", "EPA Clean Air Act"],
  special_hazards: ["Heavy machinery", "Chemical storage"]
}
```

### Data Validation

All researched data includes:
- **Citations**: Sources for all information
- **Timestamps**: When research was performed
- **Verification Prompts**: Reminders to verify accuracy

**Always verify critical information** like emergency phone numbers before relying on them in actual emergencies.

## Troubleshooting

### Error: "Perplexity API error: Unauthorized"
- Check that `PERPLEXITY_API_KEY` is set in `.env.local`
- Verify the API key is valid (starts with `pplx-`)
- Restart your development server

### Error: "Research failed"
- Check your Perplexity API quota/billing
- Verify internet connection
- Check browser console for detailed error messages

### No Emergency Services Found
- Verify the facility address is accurate and specific
- Try including city and state in the address
- Some rural areas may have limited online information

### Research Takes Too Long
- Normal research takes 10-30 seconds
- If it takes longer, check your internet connection
- API may be experiencing high load

## Best Practices

1. **Run research after creating organization** - Get baseline emergency data
2. **Update quarterly** - Keep hazard information current
3. **Verify critical data** - Always double-check emergency phone numbers
4. **Add manual corrections** - Supplement with local knowledge
5. **Review before plan activation** - Verify data before using in actual emergencies

## Security and Privacy

- API calls are made server-side only (never from browser)
- Research data is stored in your private Supabase database
- No personal or sensitive information is sent to Perplexity
- Citations help verify information provenance

## Future Enhancements

Planned improvements:
- [ ] Automatic research refresh scheduling
- [ ] Weather/seasonal hazard updates
- [ ] Integration with plan generation AI prompts
- [ ] Export research data to PDF
- [ ] Multi-facility research for organizations with multiple locations

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify all environment variables are set
- Ensure database migration completed successfully
- Review Perplexity API documentation at https://docs.perplexity.ai/
