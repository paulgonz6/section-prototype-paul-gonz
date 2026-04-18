import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { TRANSCRIPT_SPECS, getGenerationPrompt } from "../src/lib/prompts/generation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

async function generateTranscript(
  spec: (typeof TRANSCRIPT_SPECS)[number]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      { role: "user", content: getGenerationPrompt(spec) },
    ],
  })

  const textBlock = response.content.find((c) => c.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in response")
  }
  return textBlock.text
}

async function main() {
  console.log(`Generating ${TRANSCRIPT_SPECS.length} transcripts...`)

  // Check how many already exist to enable resume
  const { count } = await supabase
    .from("transcripts")
    .select("*", { count: "exact", head: true })

  const existingCount = count || 0
  console.log(`Found ${existingCount} existing transcripts`)

  if (existingCount >= TRANSCRIPT_SPECS.length) {
    console.log("All transcripts already generated. Skipping.")
    return
  }

  const specsToGenerate = TRANSCRIPT_SPECS.slice(existingCount)
  console.log(`Generating ${specsToGenerate.length} remaining transcripts...`)

  for (let i = 0; i < specsToGenerate.length; i++) {
    const spec = specsToGenerate[i]
    const overallIndex = existingCount + i + 1

    console.log(
      `[${overallIndex}/${TRANSCRIPT_SPECS.length}] Generating: ${spec.role} - ${spec.workflowName} (${spec.quality})`
    )

    try {
      const rawTranscript = await generateTranscript(spec)

      const { error } = await supabase.from("transcripts").insert({
        role: spec.role,
        department: spec.department,
        workflow_name: spec.workflowName,
        raw_transcript: rawTranscript,
        status: "pending",
      })

      if (error) {
        console.error(`  Error inserting: ${error.message}`)
        continue
      }

      console.log(`  Done (${rawTranscript.length} chars)`)

      // Rate limiting
      if (i < specsToGenerate.length - 1) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    } catch (err) {
      console.error(
        `  Error generating: ${err instanceof Error ? err.message : err}`
      )
    }
  }

  console.log("Transcript generation complete!")
}

main().catch(console.error)
