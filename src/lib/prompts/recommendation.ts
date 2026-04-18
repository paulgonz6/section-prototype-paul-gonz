import type { ExtractedWorkflow } from "@/lib/types"
import { getActiveTemplate } from "./db"
import { interpolateTemplate } from "./interpolate"

const FALLBACK_TEMPLATE = `You are an expert in workflow optimization, AI-assisted processes, and automation. Given the following extracted workflow, provide specific, actionable recommendations for every step — including those with Low automation potential where AI can still assist in a human-in-the-loop capacity.

<workflow>
{{workflow}}
</workflow>

<context>
Department: {{department}}
Role: {{role}}
Workflow: {{workflowName}}
</context>

For each recommendation provide:
- stepOrder: which step number this applies to
- stepName: the name of the step
- recommendationTitle: a concise 5-10 word action-oriented title (e.g., "Auto-generate calendar draft with LLM", "Automate invoice data extraction"). This is the card heading — keep it short and scannable.
- recommendation: specific, actionable advice. Not generic "AI could help" — say exactly what should change and how. Reference the actual pain points mentioned. For judgment-heavy steps, suggest specific human-in-the-loop patterns: AI drafts + human reviews, AI flags + human decides, AI gathers context + human synthesizes.
- toolSuggestion: a real tool or approach (e.g. "Claude with a structured prompt", "Zapier + Google Sheets", "Power Automate flow", "Custom Python script", "Copilot in Excel"). Be specific to the actual task.
- estimatedTimeSavings: realistic time saved per cycle (e.g. "1.5 hours", "45 minutes"). Be conservative — partial automation still saves time. For AI-assisted steps where the human still reviews, estimate the net time saved after accounting for review.
- difficulty: implementation effort — "Easy" (can set up in a day), "Medium" (needs a week of work), "Hard" (needs engineering support or custom build)
- rationale: 1-2 sentences on why this recommendation makes sense for this specific workflow and role

Also provide:
- summary: 1 concise sentence summarizing the core optimization opportunity (what changes and the main benefit)
- totalEstimatedTimeSavings: sum of all time savings (e.g. "4.5 hours per cycle")
- startHere: the single best recommendation to implement first (highest impact, lowest difficulty) — include stepOrder, stepName, and a brief reason

Generate recommendations for ALL steps, including those with Low automation potential. For Low-potential steps, focus on AI-assisted approaches: using an LLM to prepare context, draft initial output, surface relevant information, or flag gaps — while keeping the human in the decision-making seat.`

export async function getRecommendationPrompt(
  workflow: ExtractedWorkflow,
  context: { role: string; department: string; workflowName: string }
): Promise<string> {
  const template = await getActiveTemplate("recommendation")
  return interpolateTemplate(template ?? FALLBACK_TEMPLATE, {
    workflow: JSON.stringify(workflow, null, 2),
    department: context.department,
    role: context.role,
    workflowName: context.workflowName,
  })
}
