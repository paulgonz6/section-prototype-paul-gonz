"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DEPARTMENTS } from "@/lib/types"
import { EXAMPLE_TRANSCRIPTS } from "@/lib/examples"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function UploadForm() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [workflowName, setWorkflowName] = useState("")
  const [rawTranscript, setRawTranscript] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingStep, setProcessingStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExample = (index: number) => {
    const ex = EXAMPLE_TRANSCRIPTS[index]
    setRole(ex.role)
    setDepartment(ex.department)
    setWorkflowName(ex.workflowName)
    setRawTranscript(ex.rawTranscript)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role || !department || !workflowName || !rawTranscript) return

    setIsSubmitting(true)
    setError(null)
    setProcessingStep("Creating transcript...")

    try {
      const createRes = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          department,
          workflow_name: workflowName,
          raw_transcript: rawTranscript,
        }),
      })

      if (!createRes.ok) {
        const data = await createRes.json()
        throw new Error(data.error || "Failed to create transcript")
      }

      const transcript = await createRes.json()

      setProcessingStep("Extracting workflow & generating recommendations...")

      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptId: transcript.id }),
      })

      if (!processRes.ok) {
        const data = await processRes.json()
        throw new Error(data.error || "Processing failed")
      }

      router.push(`/transcript/${transcript.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setProcessingStep(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = role && department && workflowName && rawTranscript && !isSubmitting

  return (
    <div className="max-w-3xl">
      {/* Example buttons */}
      <div className="mb-6">
        <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
          Quick start with an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TRANSCRIPTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExample(i)}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs bg-background-white border border-border rounded-lg hover:bg-cream hover:border-border-strong transition-colors disabled:opacity-50 font-medium text-secondary"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Metadata inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Financial Analyst"
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-strong disabled:opacity-50 placeholder:text-tertiary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 text-secondary"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">
              Workflow Name
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g. Monthly Close"
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-strong disabled:opacity-50 placeholder:text-tertiary"
            />
          </div>
        </div>

        {/* Transcript textarea */}
        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">
            Raw Transcript
          </label>
          <textarea
            value={rawTranscript}
            onChange={(e) => setRawTranscript(e.target.value)}
            placeholder={`Paste the interview transcript here...\n\nAgent: Thanks for meeting with me today...\nEmployee: Sure, so basically...`}
            rows={16}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-strong font-mono disabled:opacity-50 resize-y placeholder:text-tertiary"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-auto-low/5 border border-auto-low/15 rounded-xl p-3 text-sm text-auto-low">
            {error}
          </div>
        )}

        {/* Processing status */}
        {processingStep && (
          <div className="flex items-center gap-3 bg-accent-light border border-accent/20 rounded-xl p-3">
            <LoadingSpinner className="h-4 w-4 text-accent-strong" />
            <p className="text-sm text-accent-strong font-medium">{processingStep}</p>
          </div>
        )}

        {/* Submit — Deel-style black button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-foreground text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Upload & Extract Workflow"}
        </button>
      </form>
    </div>
  )
}
