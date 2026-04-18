import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Inline the schemas and prompts to avoid path alias issues in scripts
const ExtractedWorkflowSchema = z.object({
  trigger: z.string(),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Ad hoc"]),
  steps: z.array(
    z.object({
      order: z.number(),
      name: z.string(),
      description: z.string(),
      tools: z.array(z.string()),
      timeEstimate: z.string(),
      painPoints: z.array(z.string()),
      automationPotential: z.enum(["High", "Medium", "Low"]),
      automationRationale: z.string(),
    })
  ),
  handoffs: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      method: z.string(),
      description: z.string(),
    })
  ),
  totalTimePerCycle: z.string(),
})

const AIRecommendationsResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      stepOrder: z.number(),
      stepName: z.string(),
      recommendation: z.string(),
      toolSuggestion: z.string(),
      estimatedTimeSavings: z.string(),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
      rationale: z.string(),
    })
  ),
  summary: z.string(),
  totalEstimatedTimeSavings: z.string(),
  startHere: z.object({
    stepOrder: z.number(),
    stepName: z.string(),
    reason: z.string(),
  }),
})

type ExtractedWorkflow = z.infer<typeof ExtractedWorkflowSchema>

function parseTimeToMinutes(timeStr: string): number {
  const lower = timeStr.toLowerCase()
  let total = 0
  const hourMatch = lower.match(/([\d.]+)\s*hour/)
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60
  const minMatch = lower.match(/([\d.]+)\s*min/)
  if (minMatch) total += parseFloat(minMatch[1])
  const dayMatch = lower.match(/([\d.]+)\s*day/)
  if (dayMatch) total += parseFloat(dayMatch[1]) * 480
  return total || 30
}

function frequencyToWeeklyMultiplier(freq: string): number {
  switch (freq) {
    case "Daily": return 5
    case "Weekly": return 1
    case "Monthly": return 0.25
    case "Quarterly": return 0.083
    case "Ad hoc": return 0.5
    default: return 1
  }
}

function computeMetadata(workflow: ExtractedWorkflow) {
  const totalSteps = workflow.steps.length
  const totalMinutesPerCycle = workflow.steps.reduce(
    (sum, step) => sum + parseTimeToMinutes(step.timeEstimate), 0
  )
  const weeklyMultiplier = frequencyToWeeklyMultiplier(workflow.frequency)
  const totalWeeklyHours = Math.round((totalMinutesPerCycle * weeklyMultiplier) / 60 * 10) / 10

  const potentialScores: Record<string, number> = { High: 90, Medium: 50, Low: 20 }
  const weightedPotential = workflow.steps.reduce((sum, step) => {
    return sum + potentialScores[step.automationPotential] * parseTimeToMinutes(step.timeEstimate)
  }, 0)
  const automationPotential = Math.round(weightedPotential / Math.max(totalMinutesPerCycle, 1))

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

  return { totalSteps, totalWeeklyHours, automationPotential: Math.min(automationPotential, 100), topPainPoint }
}

async function extractWorkflow(rawTranscript: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an expert workflow analyst. Given the following interview transcript between an Agent and an Employee, extract a structured workflow representation.

<transcript>
${rawTranscript}
</transcript>

Extract: trigger, frequency (Daily/Weekly/Monthly/Quarterly/Ad hoc), steps (order, name, description, tools, timeEstimate, painPoints, automationPotential High/Medium/Low, automationRationale), handoffs (from, to, method, description), and totalTimePerCycle. Be precise — only include what's stated or strongly implied.`,
      },
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
  if (!toolBlock || toolBlock.type !== "tool_use") throw new Error("No tool use")

  const parsed = ExtractedWorkflowSchema.parse(toolBlock.input)
  return { extractedWorkflow: parsed, metadata: computeMetadata(parsed) }
}

async function generateRecommendations(
  workflow: ExtractedWorkflow,
  context: { role: string; department: string; workflowName: string }
) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an expert in workflow automation. Given the following extracted workflow, provide actionable recommendations for steps with Medium or High automation potential.

<workflow>
${JSON.stringify(workflow, null, 2)}
</workflow>

<context>
Department: ${context.department}
Role: ${context.role}
Workflow: ${context.workflowName}
</context>

For each: stepOrder, stepName, recommendation (specific, not generic), toolSuggestion (real tools), estimatedTimeSavings, difficulty (Easy/Medium/Hard), rationale. Also provide: summary, totalEstimatedTimeSavings, and startHere (stepOrder, stepName, reason for the single best first step).`,
      },
    ],
    tools: [
      {
        name: "ai_recommendations",
        description: "AI recommendations for workflow optimization",
        input_schema: z.toJSONSchema(AIRecommendationsResponseSchema) as any,
      },
    ],
    tool_choice: { type: "tool", name: "ai_recommendations" },
  })

  const toolBlock = response.content.find((c) => c.type === "tool_use")
  if (!toolBlock || toolBlock.type !== "tool_use") throw new Error("No tool use")

  return AIRecommendationsResponseSchema.parse(toolBlock.input)
}

async function main() {
  // Fetch all non-completed transcripts
  const { data: transcripts, error } = await supabase
    .from("transcripts")
    .select("*")
    .in("status", ["pending", "extracting", "recommending", "failed"])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching transcripts:", error.message)
    return
  }

  console.log(`Found ${transcripts.length} transcripts to process`)

  for (let i = 0; i < transcripts.length; i++) {
    const t = transcripts[i]
    console.log(
      `[${i + 1}/${transcripts.length}] Processing: ${t.role} - ${t.workflow_name}`
    )

    try {
      // Extraction
      if (["pending", "extracting", "failed"].includes(t.status)) {
        console.log("  Extracting workflow...")
        await supabase
          .from("transcripts")
          .update({ status: "extracting" })
          .eq("id", t.id)

        const { extractedWorkflow, metadata } = await extractWorkflow(
          t.raw_transcript
        )

        await supabase.from("transcripts").update({
          extracted_workflow: extractedWorkflow,
          metadata,
          status: "recommending",
        }).eq("id", t.id)

        t.extracted_workflow = extractedWorkflow
        console.log(`  Extracted ${extractedWorkflow.steps.length} steps`)
      }

      // Recommendations
      console.log("  Generating recommendations...")
      await supabase
        .from("transcripts")
        .update({ status: "recommending" })
        .eq("id", t.id)

      const recResult = await generateRecommendations(t.extracted_workflow, {
        role: t.role,
        department: t.department,
        workflowName: t.workflow_name,
      })

      await supabase.from("transcripts").update({
        ai_recommendations: recResult,
        status: "completed",
      }).eq("id", t.id)

      console.log(
        `  Done (${recResult.recommendations.length} recommendations)`
      )

      // Rate limiting
      if (i < transcripts.length - 1) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    } catch (err) {
      console.error(
        `  Error: ${err instanceof Error ? err.message : err}`
      )
      await supabase
        .from("transcripts")
        .update({ status: "failed" })
        .eq("id", t.id)
    }
  }

  console.log("Processing complete!")
}

main().catch(console.error)
