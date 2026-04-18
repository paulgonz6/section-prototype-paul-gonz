-- Create the transcripts table for the Workflow Audit prototype
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  raw_transcript TEXT NOT NULL,
  extracted_workflow JSONB,
  ai_recommendations JSONB,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'extracting', 'recommending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filter operations
CREATE INDEX idx_transcripts_department ON transcripts (department);
CREATE INDEX idx_transcripts_status ON transcripts (status);

-- Row-level security: public read, service role write
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON transcripts FOR SELECT
  USING (true);

CREATE POLICY "Service role full access"
  ON transcripts FOR ALL
  USING (true)
  WITH CHECK (true);
