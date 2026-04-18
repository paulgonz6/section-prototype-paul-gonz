"use client"

import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProcessingIndicatorProps {
  status: "extracting" | "recommending"
}

const steps = [
  { key: "extracting", label: "Extracting workflow steps...", sublabel: "Analyzing conversation for tools, time estimates, and pain points" },
  { key: "recommending", label: "Generating recommendations...", sublabel: "Identifying automation opportunities and suggesting tools" },
]

export function ProcessingIndicator({ status }: ProcessingIndicatorProps) {
  return (
    <div className="p-6 max-w-3xl">
      <div className="bg-background-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-sm font-semibold text-foreground">
            Processing Transcript
          </h3>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => {
            const isCurrent = step.key === status
            const isDone =
              (status === "recommending" && step.key === "extracting")

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-auto-high text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <LoadingSpinner className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cream-dark" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isCurrent
                        ? "text-foreground font-medium"
                        : isDone
                          ? "text-auto-high font-medium"
                          : "text-tertiary"
                    }`}
                  >
                    {isDone ? `Step ${i + 1} complete` : step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-secondary mt-0.5">
                      {step.sublabel}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
