import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { extractWorkflow } from "@/lib/anthropic/extract"
import { generateRecommendations } from "@/lib/anthropic/recommend"

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { transcriptId } = await request.json()

  if (!transcriptId) {
    return NextResponse.json(
      { error: "Missing transcriptId" },
      { status: 400 }
    )
  }

  // Fetch the transcript
  const { data: transcript, error: fetchError } = await supabase
    .from("transcripts")
    .select("*")
    .eq("id", transcriptId)
    .single()

  if (fetchError || !transcript) {
    return NextResponse.json(
      { error: "Transcript not found" },
      { status: 404 }
    )
  }

  try {
    // Step 1: Extraction
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

    // Step 2: Recommendations
    const recResult = await generateRecommendations(extractedWorkflow, {
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

    // Return the full updated record
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
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    )
  }
}
