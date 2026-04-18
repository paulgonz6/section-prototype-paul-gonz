-- Create the prompts table for admin-managed AI prompt templates
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompts_slug_active ON prompts (slug, is_active) WHERE is_active = true;

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON prompts FOR SELECT
  USING (true);

CREATE POLICY "Service role full access"
  ON prompts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed with initial prompt templates (converted from hardcoded TypeScript)

INSERT INTO prompts (slug, name, template, variables, version, is_active) VALUES
(
  'extraction',
  'Workflow Extraction',
  E'You are an expert workflow analyst. Given the following interview transcript between an Agent and an Employee, extract a structured workflow representation.\n\n<transcript>\n{{rawTranscript}}\n</transcript>\n\nExtract the following:\n\n1. **trigger**: What event or condition starts this workflow? Be specific.\n2. **frequency**: How often does this workflow occur? Must be exactly one of: "Daily", "Weekly", "Monthly", "Quarterly", "Ad hoc"\n3. **steps**: Each discrete step in the workflow. For each step include:\n   - order (sequential, starting at 1)\n   - name (short label, 3-6 words, e.g. "Download raw trial balance")\n   - description (1-2 sentences explaining what happens)\n   - tools (list of specific software/tools used: e.g. "Excel", "SAP", "Slack", "Email")\n   - timeEstimate (human-readable: "2 hours", "30 minutes", "15 minutes")\n   - painPoints (specific frustrations or inefficiencies mentioned for this step — use the employee''s own words when possible)\n   - automationPotential ("High", "Medium", or "Low"):\n     * "High": Repetitive, rule-based, or template-driven work that can be fully automated, OR tasks like summarization, information gathering across multiple sources, data synthesis, or pattern recognition where an LLM can do the heavy lifting with minimal human review.\n     * "Medium": Tasks where human judgment is needed for final decisions, but AI can meaningfully accelerate the work — e.g., drafting content for human editing, flagging anomalies for review, pre-populating forms from unstructured data, or prioritizing items based on criteria.\n     * "Low": Tasks that are fundamentally about interpersonal relationships, physical actions, real-time negotiation, or novel strategic decisions where AI assistance provides marginal value.\n     IMPORTANT: Do NOT mark a step "Low" simply because it involves judgment, creativity, or contextual reasoning. LLMs excel at synthesis, summarization, gap analysis, and contextual decision support in human-in-the-loop workflows. Reserve "Low" for tasks where AI genuinely cannot help.\n   - automationRationale (1 sentence explaining why this step has that automation potential — if Medium or High, mention what AI would handle vs. what stays human)\n4. **handoffs**: Each point where work transfers between people. Include from (who sends), to (who receives), method (how: "Email", "Slack", "Shared drive", etc.), and description.\n5. **totalTimePerCycle**: Total time for one complete cycle of this workflow (e.g. "6.5 hours", "3 days")\n\nBe precise. Only include information explicitly stated or strongly implied in the transcript. Do not invent tools or steps not mentioned. If the employee is vague about a step, still extract what you can but keep the description honest about the ambiguity.',
  ARRAY['rawTranscript'],
  1,
  true
),
(
  'recommendation',
  'Recommendations',
  E'You are an expert in workflow optimization, AI-assisted processes, and automation. Given the following extracted workflow, provide specific, actionable recommendations for every step — including those with Low automation potential where AI can still assist in a human-in-the-loop capacity.\n\n<workflow>\n{{workflow}}\n</workflow>\n\n<context>\nDepartment: {{department}}\nRole: {{role}}\nWorkflow: {{workflowName}}\n</context>\n\nFor each recommendation provide:\n- stepOrder: which step number this applies to\n- stepName: the name of the step\n- recommendationTitle: a concise 5-10 word action-oriented title (e.g., "Auto-generate calendar draft with LLM", "Automate invoice data extraction"). This is the card heading — keep it short and scannable.\n- recommendation: specific, actionable advice. Not generic "AI could help" — say exactly what should change and how. Reference the actual pain points mentioned. For judgment-heavy steps, suggest specific human-in-the-loop patterns: AI drafts + human reviews, AI flags + human decides, AI gathers context + human synthesizes.\n- toolSuggestion: a real tool or approach (e.g. "Claude with a structured prompt", "Zapier + Google Sheets", "Power Automate flow", "Custom Python script", "Copilot in Excel"). Be specific to the actual task.\n- estimatedTimeSavings: realistic time saved per cycle (e.g. "1.5 hours", "45 minutes"). Be conservative — partial automation still saves time. For AI-assisted steps where the human still reviews, estimate the net time saved after accounting for review.\n- difficulty: implementation effort — "Easy" (can set up in a day), "Medium" (needs a week of work), "Hard" (needs engineering support or custom build)\n- rationale: 1-2 sentences on why this recommendation makes sense for this specific workflow and role\n\nAlso provide:\n- summary: 1 concise sentence summarizing the core optimization opportunity (what changes and the main benefit)\n- totalEstimatedTimeSavings: sum of all time savings (e.g. "4.5 hours per cycle")\n- startHere: the single best recommendation to implement first (highest impact, lowest difficulty) — include stepOrder, stepName, and a brief reason\n\nGenerate recommendations for ALL steps, including those with Low automation potential. For Low-potential steps, focus on AI-assisted approaches: using an LLM to prepare context, draft initial output, surface relevant information, or flag gaps — while keeping the human in the decision-making seat.',
  ARRAY['workflow', 'department', 'role', 'workflowName'],
  1,
  true
);
