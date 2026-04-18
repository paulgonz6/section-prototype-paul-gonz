import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateRecommendations } from "@/lib/anthropic/recommend"

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

  if (!transcript.extracted_workflow) {
    return NextResponse.json(
      { error: "Workflow not yet extracted" },
      { status: 400 }
    )
  }

  try {
    await supabase
      .from("transcripts")
      .update({ status: "recommending", updated_at: new Date().toISOString() })
      .eq("id", transcriptId)

    const recResult = await generateRecommendations(transcript.extracted_workflow, {
      role: transcript.role,
      department: transcript.department,
      workflowName: transcript.workflow_name,
    })

    await supabase
      .from("transcripts")
      .update({
        ai_recommendations: recResult,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transcriptId)

    const { data: updated } = await supabase
      .from("transcripts")
      .select("*")
      .eq("id", transcriptId)
      .single()

    return NextResponse.json(updated)
  } catch (error) {
    await supabase
      .from("transcripts")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", transcriptId)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recommendations failed" },
      { status: 500 }
    )
  }
}
