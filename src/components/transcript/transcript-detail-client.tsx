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

    const processPromise = fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcriptId: transcript.id }),
    })

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcripts/${transcript.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === "recommending") {
            setProcessingStatus("recommending")
          }
        }
      } catch {
        // ignore poll errors
      }
    }, 2000)

    try {
      const res = await processPromise
      clearInterval(pollInterval)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Processing failed")
      }

      const updated = await res.json()
      setTranscript(updated)
      setProcessingStatus(null)
    } catch (err) {
      clearInterval(pollInterval)
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
      <div className="flex-1 overflow-y-auto">
        {isCompleted && transcript.extracted_workflow && transcript.ai_recommendations ? (
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
        ) : (
          <>
            {/* Conversation — always shown */}
            <div className="border-b border-border">
              <div className="px-6 py-2.5 text-xs font-medium text-tertiary uppercase tracking-wider bg-background-white border-b border-border">
                Interview Transcript
              </div>
              <div className="max-h-[50vh] overflow-y-auto bg-background">
                <ConversationView
                  rawTranscript={transcript.raw_transcript}
                />
              </div>
            </div>

            {/* Processing or Extract button */}
            {isProcessing && processingStatus ? (
              <ProcessingIndicator status={processingStatus} />
            ) : isPending ? (
              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-auto-low/5 border border-auto-low/15 rounded-xl p-3 text-sm text-auto-low">
                    {error}
                  </div>
                )}
                <button
                  onClick={startProcessingWithPolling}
                  className="w-full max-w-md mx-auto block bg-foreground text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Extract Workflow
                </button>
                <p className="text-xs text-tertiary text-center mt-2">
                  Analyze the conversation and extract structured workflow data
                  using AI. Takes about 15-20 seconds.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
