import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  generateRecommendationBatch,
  generateRecommendationSummary,
} from "@/lib/anthropic/recommend"

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const { transcriptId, step } = await request.json()
  if (!transcriptId || !step) {
    return NextResponse.json(
      { error: "Missing transcriptId or step (batch1 | batch2 | summary)" },
      { status: 400 }
    )
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
    return NextResponse.json({ error: "Workflow not yet extracted" }, { status: 400 })
  }

  const workflow = transcript.extracted_workflow
  const context = {
    role: transcript.role,
    department: transcript.department,
    workflowName: transcript.workflow_name,
  }
  const allStepOrders = workflow.steps.map((s: any) => s.order)
  const mid = Math.ceil(allStepOrders.length / 2)

  try {
    if (step === "batch1") {
      await supabase
        .from("transcripts")
        .update({ status: "recommending", updated_at: new Date().toISOString() })
        .eq("id", transcriptId)

      const batch1Orders = allStepOrders.slice(0, mid)
      const recs = await generateRecommendationBatch(workflow, batch1Orders, context)

      // Store partial results in ai_recommendations
      await supabase
        .from("transcripts")
        .update({
          ai_recommendations: { recommendations: recs, _partial: true },
          updated_at: new Date().toISOString(),
        })
        .eq("id", transcriptId)

      return NextResponse.json({ success: true, count: recs.length })
    }

    if (step === "batch2") {
      const batch2Orders = allStepOrders.slice(mid)
      const recs = await generateRecommendationBatch(workflow, batch2Orders, context)

      // Merge with batch1 results
      const existing = transcript.ai_recommendations as any
      const batch1Recs = existing?.recommendations || []
      const allRecs = [...batch1Recs, ...recs]

      await supabase
        .from("transcripts")
        .update({
          ai_recommendations: { recommendations: allRecs, _partial: true },
          updated_at: new Date().toISOString(),
        })
        .eq("id", transcriptId)

      return NextResponse.json({ success: true, count: allRecs.length })
    }

    if (step === "summary") {
      const existing = transcript.ai_recommendations as any
      const allRecs = existing?.recommendations || []

      const summaryResult = await generateRecommendationSummary(allRecs, context)

      const finalResult = {
        recommendations: allRecs,
        ...summaryResult,
      }

      await supabase
        .from("transcripts")
        .update({
          ai_recommendations: finalResult,
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
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 })
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
