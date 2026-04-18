import type { ExtractedWorkflow } from "@/lib/types"
import { StepCard } from "./step-card"

interface WorkflowTimelineProps {
  workflow: ExtractedWorkflow
}

export function WorkflowTimeline({ workflow }: WorkflowTimelineProps) {
  return (
    <div className="p-6 max-w-3xl">
      {/* Trigger + Frequency — Sana-style section headers */}
      <div className="mb-8">
        <div className="mb-4">
          <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
            Trigger
          </p>
          <div className="bg-background-white border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-foreground">{workflow.trigger}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-accent-light border border-accent/20 rounded-xl px-4 py-2.5">
            <p className="text-xs text-accent-strong font-medium">Frequency</p>
            <p className="text-sm text-foreground font-medium">{workflow.frequency}</p>
          </div>
          <div className="bg-cream border border-cream-dark rounded-xl px-4 py-2.5">
            <p className="text-xs text-secondary font-medium">Total Time</p>
            <p className="text-sm text-foreground font-medium">{workflow.totalTimePerCycle}</p>
          </div>
        </div>
      </div>

      {/* Steps — Sana-style numbered list */}
      <div className="mb-6">
        <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-4">
          Steps
        </p>
        {workflow.steps.map((step, i) => (
          <StepCard
            key={step.order}
            step={step}
            isLast={i === workflow.steps.length - 1}
          />
        ))}
      </div>

      {/* Handoffs */}
      {workflow.handoffs.length > 0 && (
        <div className="border-t border-border pt-6">
          <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-3">
            Handoffs
          </p>
          <div className="space-y-2">
            {workflow.handoffs.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm bg-background-white border border-border rounded-xl px-4 py-3"
              >
                <span className="font-medium text-foreground">{h.from}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="font-medium text-foreground">{h.to}</span>
                <span className="text-tertiary ml-auto text-xs bg-cream rounded-full px-2 py-0.5">
                  {h.method}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
