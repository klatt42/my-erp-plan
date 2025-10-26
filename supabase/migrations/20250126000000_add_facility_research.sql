-- Add facility research fields to organizations table
-- This stores Perplexity AI research data for emergency planning

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS facility_research JSONB,
ADD COLUMN IF NOT EXISTS research_last_updated TIMESTAMPTZ;

-- Add index for faster queries on research timestamp
CREATE INDEX IF NOT EXISTS idx_organizations_research_updated
ON organizations(research_last_updated);

-- Add comment for documentation
COMMENT ON COLUMN organizations.facility_research IS 'Perplexity AI research data including emergency services, local hazards, and facility info';
COMMENT ON COLUMN organizations.research_last_updated IS 'Timestamp of last facility research update';
