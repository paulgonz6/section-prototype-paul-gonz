"use client"

import { useState, useCallback } from "react"
import type { Transcript } from "@/lib/types"
import { ConversationView } from "./conversation-view"
import { WorkflowTimeline } from "./workflow-timeline"
import { RecommendationsPanel } from "./recommendations-panel"
import { ProcessingIndicator } from "./processing-indicator"
import { DetailTabs } from "./detail-tabs"
import { DepartmentBadge, StatusBadge } from "@/components/ui/badge"

interface TranscriptDetailClientProps {
  initialData: Transcript
}

export function TranscriptDetailClient({
  initialData,
}: TranscriptDetailClientProps) {
  const [transcript, setTranscript] = useState<Transcript>(initialData)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<
    "extracting" | "recommending" | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  const startProcessingWithPolling = useCallback(async () => {
    setIsProcessing(true)
    setError(null)
    setProcessingStatus("extracting")

    const headers = { "Content-Type": "application/json" }
    const id = transcript.id

    async function post(url: string, data: Record<string, unknown>) {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const text = await res.text()
        try {
          const parsed = JSON.parse(text)
          throw new Error(parsed.error || "Request failed")
        } catch (parseErr) {
          if (parseErr instanceof SyntaxError) throw new Error("Request timed out — please try again")
          throw parseErr
        }
      }
      return res
    }

    try {
      // Step 1: Extract workflow
      await post("/api/process/extract", { transcriptId: id })

      // Step 2: Recommendations batch 1
      setProcessingStatus("recommending")
      await post("/api/process/recommend", { transcriptId: id, step: "batch1" })

      // Step 3: Recommendations batch 2
      await post("/api/process/recommend", { transcriptId: id, step: "batch2" })

      // Step 4: Generate summary
      const summaryRes = await post("/api/process/recommend", { transcriptId: id, step: "summary" })
      const updated = await summaryRes.json()
      setTranscript(updated)
      setProcessingStatus(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
      setProcessingStatus(null)
    } finally {
      setIsProcessing(false)
    }
  }, [transcript.id])

  const isPending =
    transcript.status === "pending" || transcript.status === "failed"
  const isCompleted = transcript.status === "completed"

  return (
    <div className="h-full flex flex-col">
      {/* Header — Deel-style clean header */}
      <div className="px-6 py-4 border-b border-border bg-background-white">
        <div className="flex items-center gap-2 mb-1.5">
          <DepartmentBadge department={transcript.department} />
          <StatusBadge status={transcript.status} />
          {transcript.metadata && (
            <span className="text-xs text-tertiary ml-1">
              {transcript.metadata.totalSteps} steps
              {transcript.metadata.totalWeeklyHours > 0 &&
                ` · ${transcript.metadata.totalWeeklyHours}h/week`}
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          {transcript.workflow_name}
        </h1>
        <p className="text-sm text-secondary mt-0.5">{transcript.role}</p>
      </div>

      {/* Content */}
      {isCompleted && transcript.extracted_workflow && transcript.ai_recommendations ? (
        <div className="flex-1 overflow-y-auto">
          <DetailTabs
            tabs={[
              {
                key: "conversation",
                label: "Conversation",
                content: (
                  <ConversationView
                    rawTranscript={transcript.raw_transcript}
                  />
                ),
              },
              {
                key: "workflow",
                label: "Workflow Map",
                content: (
                  <WorkflowTimeline
                    workflow={transcript.extracted_workflow}
                  />
                ),
              },
              {
                key: "recommendations",
                label: "Recommendations",
                content: (
                  <RecommendationsPanel
                    data={transcript.ai_recommendations as any}
                  />
                ),
              },
            ]}
          />
        </div>
      ) : (
        <>
          {/* Conversation — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wider bg-background-white border-b border-border sticky top-0 z-10">
              Interview Transcript
            </div>
            <div className="bg-background">
              <ConversationView
                rawTranscript={transcript.raw_transcript}
              />
            </div>
          </div>

          {/* Sticky footer — Extract button or processing indicator */}
          {isProcessing && processingStatus ? (
            <ProcessingIndicator status={processingStatus} />
          ) : isPending ? (
            <div className="shrink-0 px-6 py-3 border-t border-border bg-background-white text-center">
              {error && (
                <div className="mb-2 bg-auto-low/5 border border-auto-low/15 rounded-xl p-2.5 text-sm text-auto-low text-left">
                  {error}
                </div>
              )}
              <button
                onClick={startProcessingWithPolling}
                className="w-full max-w-md mx-auto block bg-foreground text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Extract Workflow
              </button>
              <p className="text-xs text-tertiary mt-1.5">
                Analyze the conversation and extract structured workflow data
                using AI. Takes about 15-20 seconds.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
