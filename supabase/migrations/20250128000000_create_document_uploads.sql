-- Create document_uploads table for storing uploaded documents
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File metadata
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'docx', 'xlsx', 'image'
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,

  -- Extracted content
  extracted_text TEXT,
  extracted_data JSONB, -- Structured data extracted by AI

  -- Document classification
  document_type TEXT, -- 'floor_plan', 'contact_list', 'equipment_inventory', 'existing_plan', 'other'
  confidence_score DECIMAL(3,2), -- AI confidence in classification (0.00 to 1.00)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create document_versions table for version control
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- File metadata
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,

  -- Version info
  changes_description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(document_id, version_number)
);

-- Create document_extractions table for tracking what data was extracted
CREATE TABLE IF NOT EXISTS document_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What was extracted
  extraction_type TEXT NOT NULL, -- 'contacts', 'equipment', 'floor_plan', 'procedures', 'facility_info'
  extracted_data JSONB NOT NULL,

  -- Application status
  applied_to_plan BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES auth.users(id),

  -- AI metadata
  model_used TEXT,
  tokens_used INTEGER,
  confidence_score DECIMAL(3,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_org_id ON document_uploads(org_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_document_type ON document_uploads(document_type);
CREATE INDEX IF NOT EXISTS idx_document_uploads_created_at ON document_uploads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_extractions_document_id ON document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_extractions_org_id ON document_extractions(org_id);

-- Enable RLS
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_uploads
CREATE POLICY "Users can view documents from their organization"
  ON document_uploads FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to their organization"
  ON document_uploads FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents from their organization"
  ON document_uploads FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete documents from their organization"
  ON document_uploads FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for document_versions
CREATE POLICY "Users can view document versions from their organization"
  ON document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM document_uploads
      WHERE org_id IN (
        SELECT org_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create document versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM document_uploads
      WHERE org_id IN (
        SELECT org_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for document_extractions
CREATE POLICY "Users can view extractions from their organization"
  ON document_extractions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create extractions"
  ON document_extractions FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update extractions from their organization"
  ON document_extractions FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_uploads_updated_at
  BEFORE UPDATE ON document_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_document_updated_at();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload documents to their organization folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::TEXT FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents from their organization"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::TEXT FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in their organization"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::TEXT FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete documents from their organization"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::TEXT FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
