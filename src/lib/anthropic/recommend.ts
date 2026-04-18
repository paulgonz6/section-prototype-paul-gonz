import { z } from "zod"
import { getAnthropicClient } from "./client"
import { AIRecommendationSchema } from "./schemas"
import { getRecommendationPrompt } from "../prompts/recommendation"
import type { ExtractedWorkflow, AIRecommendation } from "../types"

export interface RecommendationsResult {
  recommendations: AIRecommendation[]
  summary: string
  totalEstimatedTimeSavings: string
  startHere: {
    stepOrder: number
    stepName: string
    reason: string
  }
}

const BatchRecommendationsSchema = z.object({
  recommendations: z.array(AIRecommendationSchema),
})

const SummarySchema = z.object({
  summary: z.string(),
  totalEstimatedTimeSavings: z.string(),
  startHere: z.object({
    stepOrder: z.number(),
    stepName: z.string(),
    reason: z.string(),
  }),
})

/** Generate recommendations for a subset of steps */
export async function generateRecommendationBatch(
  workflow: ExtractedWorkflow,
  stepOrders: number[],
  context: { role: string; department: string; workflowName: string }
): Promise<AIRecommendation[]> {
  const client = getAnthropicClient()
  const stepsSubset = workflow.steps.filter((s) => stepOrders.includes(s.order))

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: await getRecommendationPrompt(
          { ...workflow, steps: stepsSubset },
          context
        ),
      },
    ],
    tools: [
      {
        name: "batch_recommendations",
        description: "Recommendations for the given workflow steps",
        input_schema: z.toJSONSchema(BatchRecommendationsSchema) as any,
      },
    ],
    tool_choice: { type: "tool", name: "batch_recommendations" },
  })

  const toolBlock = response.content.find((c) => c.type === "tool_use")
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No tool use in response")
  }

  const parsed = BatchRecommendationsSchema.parse(toolBlock.input)
  return parsed.recommendations as unknown as AIRecommendation[]
}

/** Generate summary + startHere from already-generated recommendations */
export async function generateRecommendationSummary(
  recommendations: AIRecommendation[],
  context: { role: string; department: string; workflowName: string }
): Promise<{ summary: string; totalEstimatedTimeSavings: string; startHere: { stepOrder: number; stepName: string; reason: string } }> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Given these AI recommendations for the "${context.workflowName}" workflow (${context.role}, ${context.department}), provide:
- summary: 1 concise sentence summarizing the core optimization opportunity
- totalEstimatedTimeSavings: sum of all time savings as a short metric (e.g. "4.5 hours per cycle")
- startHere: the single best recommendation to implement first (highest impact, lowest difficulty) — include stepOrder, stepName, and a brief reason

<recommendations>
${JSON.stringify(recommendations, null, 2)}
</recommendations>`,
      },
    ],
    tools: [
      {
        name: "recommendation_summary",
        description: "Summary of the recommendations",
        input_schema: z.toJSONSchema(SummarySchema) as any,
      },
    ],
    tool_choice: { type: "tool", name: "recommendation_summary" },
  })

  const toolBlock = response.content.find((c) => c.type === "tool_use")
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No tool use in response")
  }

  return SummarySchema.parse(toolBlock.input)
}
