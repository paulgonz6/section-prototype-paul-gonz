import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

async function condense(timeSavings: string, summary: string): Promise<{ shortSavings: string; shortSummary: string }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Condense these two fields. Reply with ONLY valid JSON, no other text.

1. totalEstimatedTimeSavings — condense to a short metric like "4-6 hours per week" or "13.5 hours per cycle". Just the number and unit, no explanation.
2. summary — condense to 1 short sentence (max 20 words).

Current totalEstimatedTimeSavings: "${timeSavings}"
Current summary: "${summary}"

Reply as: {"shortSavings": "...", "shortSummary": "..."}`,
      },
    ],
  })

  const text = response.content[0]
  if (text.type !== "text") throw new Error("Unexpected response")
  return JSON.parse(text.text)
}

async function main() {
  const { data: transcripts, error } = await supabase
    .from("transcripts")
    .select("id, workflow_name, ai_recommendations")
    .eq("status", "completed")

  if (error) {
    console.error("Error:", error.message)
    return
  }

  console.log(`Found ${transcripts.length} completed transcripts to condense`)

  for (const t of transcripts) {
    const recs = t.ai_recommendations as any
    if (!recs?.totalEstimatedTimeSavings) continue

    const savings = recs.totalEstimatedTimeSavings
    const summary = recs.summary

    // Skip if already short
    if (savings.length <= 25 && summary.length <= 100) {
      console.log(`  [SKIP] ${t.workflow_name} — already concise`)
      continue
    }

    console.log(`  [FIX] ${t.workflow_name}`)
    console.log(`    savings: "${savings.substring(0, 60)}..."`)
    console.log(`    summary: "${summary.substring(0, 60)}..."`)

    try {
      const { shortSavings, shortSummary } = await condense(savings, summary)

      const updatedRecs = {
        ...recs,
        totalEstimatedTimeSavings: shortSavings,
        summary: shortSummary,
      }

      await supabase
        .from("transcripts")
        .update({ ai_recommendations: updatedRecs })
        .eq("id", t.id)

      console.log(`    → savings: "${shortSavings}"`)
      console.log(`    → summary: "${shortSummary}"`)

      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`    Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log("Done!")
}

main().catch(console.error)
