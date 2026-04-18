import { z } from "zod"
import { getAnthropicClient } from "./client"
import { ExtractedWorkflowSchema } from "./schemas"
import { getExtractionPrompt } from "../prompts/extraction"
import type { ExtractedWorkflow, TranscriptMetadata } from "../types"

function parseTimeToMinutes(timeStr: string): number {
  const lower = timeStr.toLowerCase()
  let total = 0

  const hourMatch = lower.match(/([\d.]+)\s*hour/)
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60

  const minMatch = lower.match(/([\d.]+)\s*min/)
  if (minMatch) total += parseFloat(minMatch[1])

  const dayMatch = lower.match(/([\d.]+)\s*day/)
  if (dayMatch) total += parseFloat(dayMatch[1]) * 480 // 8-hour day

  if (total === 0 && /^\d+$/.test(lower.trim())) {
    total = parseInt(lower.trim())
  }

  return total || 30 // default 30 min if unparseable
}

function frequencyToWeeklyMultiplier(
  freq: string
): number {
  switch (freq) {
    case "Daily":
      return 5
    case "Weekly":
      return 1
    case "Monthly":
      return 0.25
    case "Quarterly":
      return 0.083
    case "Ad hoc":
      return 0.5
    default:
      return 1
  }
}

function computeMetadata(
  workflow: ExtractedWorkflow
): TranscriptMetadata {
  const totalSteps = workflow.steps.length

  const totalMinutesPerCycle = workflow.steps.reduce(
    (sum, step) => sum + parseTimeToMinutes(step.timeEstimate),
    0
  )

  const weeklyMultiplier = frequencyToWeeklyMultiplier(workflow.frequency)
  const totalWeeklyHours = Math.round(
    (totalMinutesPerCycle * weeklyMultiplier) / 60 * 10
  ) / 10

  const potentialScores: Record<string, number> = {
    High: 90,
    Medium: 50,
    Low: 20,
  }

  const weightedPotential = workflow.steps.reduce((sum, step) => {
    const minutes = parseTimeToMinutes(step.timeEstimate)
    return sum + potentialScores[step.automationPotential] * minutes
  }, 0)

  const automationPotential = Math.round(
    weightedPotential / Math.max(totalMinutesPerCycle, 1)
  )

  const painPointCounts: Record<string, number> = {}
  for (const step of workflow.steps) {
    for (const pp of step.painPoints) {
      painPointCounts[pp] = (painPointCounts[pp] || 0) + 1
    }
  }

  const topPainPoint =
    Object.entries(painPointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    workflow.steps.find((s) => s.painPoints.length > 0)?.painPoints[0] ||
    "No specific pain points identified"

  return {
    totalSteps,
    totalWeeklyHours,
    automationPotential: Math.min(automationPotential, 100),
    topPainPoint,
  }
}

export async function extractWorkflow(
  rawTranscript: string
): Promise<{ extractedWorkflow: ExtractedWorkflow; metadata: TranscriptMetadata }> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      { role: "user", content: await getExtractionPrompt(rawTranscript) },
    ],
    tools: [
      {
        name: "extracted_workflow",
        description: "The structured workflow extracted from the transcript",
        input_schema: z.toJSONSchema(ExtractedWorkflowSchema) as any,
      },
    ],
    tool_choice: { type: "tool", name: "extracted_workflow" },
  })

  const toolBlock = response.content.find((c) => c.type === "tool_use")
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("No tool use in response")
  }

  const parsed = ExtractedWorkflowSchema.parse(toolBlock.input)
  const extractedWorkflow = parsed as unknown as ExtractedWorkflow
  const metadata = computeMetadata(extractedWorkflow)

  return { extractedWorkflow, metadata }
}
