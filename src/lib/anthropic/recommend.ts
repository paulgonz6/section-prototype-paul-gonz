import { z } from "zod"
import { getAnthropicClient } from "./client"
import { AIRecommendationsResponseSchema } from "./schemas"
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

export async function generateRecommendations(
  workflow: ExtractedWorkflow,
  context: { role: string; department: string; workflowName: string }
): Promise<RecommendationsResult> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: await getRecommendationPrompt(workflow, context),
      },
    ],
    tools: [
      {
        name: "ai_recommendations",
        description:
          "The AI recommendations for workflow optimization",
        input_schema: z.toJSONSchema(AIRecommendationsResponseSchema) as any,
      },
    ],
    tool_choice: { type: "tool", name: "ai_recommendations" },
  })

  const toolBlock = response.content.find((c) => c.type === "tool_use")
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No tool use in response")
  }

  const parsed = AIRecommendationsResponseSchema.parse(toolBlock.input)
  return parsed as unknown as RecommendationsResult
}
