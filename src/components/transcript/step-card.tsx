import type { WorkflowStep } from "@/lib/types"
import { AutomationBadge } from "@/components/ui/badge"

interface StepCardProps {
  step: WorkflowStep
  isLast: boolean
}

export function StepCard({ step, isLast }: StepCardProps) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline — Sana-style numbered steps */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-foreground text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {step.order}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border-strong mt-2" />
        )}
      </div>

      {/* Step content — Sana-style clean card */}
      <div className={`flex-1 ${isLast ? "pb-2" : "pb-6"}`}>
        <div className="bg-background-white border border-border rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-foreground">
              {step.name}
            </h4>
            <AutomationBadge level={step.automationPotential} />
          </div>

          <p className="text-sm text-secondary mb-3 leading-relaxed">
            {step.description}
          </p>

          {/* Tools — pill style */}
          {step.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {step.tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-secondary mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {step.timeEstimate}
          </div>

          {/* Pain points */}
          {step.painPoints.length > 0 && (
            <div className="mt-3 bg-auto-low/5 border border-auto-low/15 rounded-lg px-3 py-2">
              {step.painPoints.map((pp, i) => (
                <p key={i} className="text-xs text-auto-low leading-relaxed">
                  {i > 0 && <span className="block mt-1" />}
                  {pp}
                </p>
              ))}
            </div>
          )}

          {/* Automation rationale */}
          <p className="text-xs text-tertiary mt-2 leading-relaxed">
            {step.automationRationale}
          </p>
        </div>
      </div>
    </div>
  )
}
