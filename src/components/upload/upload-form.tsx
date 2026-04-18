"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DEPARTMENTS } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const PROMPT_TEMPLATE = `You are simulating a realistic interview between an operations analyst ("Agent") and an employee ("Employee") about a specific workflow the employee performs regularly.

Generate a detailed interview transcript with the following context:

- Role being interviewed: [FILL IN ROLE]
- Department: [FILL IN DEPARTMENT]
- Workflow being discussed: [FILL IN WORKFLOW NAME]
- Transcript quality: [FILL IN QUALITY — e.g. "rich and detailed, the employee was very helpful and thorough" or "fragmented and vague, the employee gave short answers and was not very engaged" or "mixed, some parts are detailed but the employee rushed through others"]

Requirements for the transcript:
1. Format as a dialogue between "Agent:" and "Employee:" turns
2. The Agent should ask probing questions about workflow steps, tools used, time estimates, pain points, handoffs, and automation opportunities
3. The Employee should give specific, realistic answers including:
   - Exact tool and system names (e.g., SAP, Salesforce, Google Sheets, Jira)
   - Concrete time estimates ("takes about 20 minutes", "usually 3-5 business days")
   - Specific pain points and workarounds
   - Frequency and volume ("I do this about 80 times per month")
   - Handoffs between teams or individuals
   - Approval chains and escalation paths
4. Include 6-10 workflow steps discussed across the conversation
5. The conversation should feel natural — include tangents, clarifications, and the employee occasionally correcting themselves
6. Total length: 400-600 words

Generate the transcript now.`

export function UploadForm() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [workflowName, setWorkflowName] = useState("")
  const [rawTranscript, setRawTranscript] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingStep, setProcessingStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const getFilledPrompt = () =>
    PROMPT_TEMPLATE
      .replace("[FILL IN ROLE]", role || "[FILL IN ROLE]")
      .replace("[FILL IN DEPARTMENT]", department || "[FILL IN DEPARTMENT]")
      .replace("[FILL IN WORKFLOW NAME]", workflowName || "[FILL IN WORKFLOW NAME]")

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(getFilledPrompt())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        {/* Generate with Claude helper */}
        <div>
          <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
            Generate a transcript with Claude
          </p>
          <div className="bg-background-white border border-border rounded-lg p-4">
            <p className="text-sm text-secondary mb-3">
              Copy this prompt, paste it into Claude (or any LLM), then paste
              the generated transcript below.
              {(role || department || workflowName) && (
                <span className="text-accent-strong font-medium">
                  {" "}Your field values will be included automatically.
                </span>
              )}
            </p>
            <pre className="text-xs text-tertiary bg-cream border border-border rounded-lg p-3 mb-3 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {getFilledPrompt()}
            </pre>
            <button
              type="button"
              onClick={handleCopyPrompt}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium bg-foreground text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {copied ? "Copied!" : "Copy Prompt to Clipboard"}
            </button>
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

        {/* Submit */}
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
