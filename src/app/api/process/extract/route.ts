import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { extractWorkflow } from "@/lib/anthropic/extract"

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const { transcriptId } = await request.json()
  if (!transcriptId) {
    return NextResponse.json({ error: "Missing transcriptId" }, { status: 400 })
  }

  const { data: transcript, error: fetchError } = await supabase
    .from("transcripts")
    .select("*")
    .eq("id", transcriptId)
    .single()

  if (fetchError || !transcript) {
    return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
  }

  try {
    await supabase
      .from("transcripts")
      .update({ status: "extracting", updated_at: new Date().toISOString() })
      .eq("id", transcriptId)

    const { extractedWorkflow, metadata } = await extractWorkflow(
      transcript.raw_transcript
    )

    await supabase
      .from("transcripts")
      .update({
        extracted_workflow: extractedWorkflow,
        metadata,
        status: "recommending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transcriptId)

    return NextResponse.json({ success: true })
  } catch (error) {
    await supabase
      .from("transcripts")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", transcriptId)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    )
  }
}
