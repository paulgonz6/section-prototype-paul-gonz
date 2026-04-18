"use client"

import { useState, useEffect } from "react"
import type { Transcript } from "@/lib/types"

export function ReprocessPanel() {
  const [transcripts, setTranscripts] = useState<
    Pick<Transcript, "id" | "workflow_name" | "department" | "status">[]
  >([])
  const [selectedId, setSelectedId] = useState("")
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/transcripts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTranscripts(data)
      })
      .catch(() => {})
  }, [])

  async function handleReprocess() {
    if (!selectedId) return
    setProcessing(true)
    setResult(null)
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptId: selectedId }),
      })
      if (res.ok) {
        setResult({ ok: true, message: "Reprocessing complete" })
      } else {
        const err = await res.json()
        setResult({ ok: false, message: err.error || "Reprocessing failed" })
      }
    } catch {
      setResult({ ok: false, message: "Network error" })
    } finally {
      setProcessing(false)
    }
  }

  const selected = transcripts.find((t) => t.id === selectedId)

  return (
    <div className="bg-background-white border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Reprocess Transcript</h3>
        <p className="text-xs text-secondary mt-0.5">
          Re-run extraction and recommendations with the current prompts
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-secondary mb-1.5">
              Select transcript
            </label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setResult(null) }}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground"
            >
              <option value="">Choose a transcript...</option>
              {transcripts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.workflow_name} ({t.department}) — {t.status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleReprocess}
            disabled={!selectedId || processing}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
              selectedId && !processing
                ? "bg-foreground text-white hover:bg-primary-hover"
                : "bg-cream text-tertiary cursor-not-allowed"
            }`}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Reprocess"
            )}
          </button>
        </div>

        {result && (
          <div
            className={`mt-3 px-4 py-2.5 rounded-lg text-sm ${
              result.ok
                ? "bg-auto-high/10 text-auto-high"
                : "bg-auto-low/10 text-auto-low"
            }`}
          >
            {result.message}
            {result.ok && selected && (
              <a
                href={`/transcript/${selectedId}`}
                className="ml-2 underline"
              >
                View transcript
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
