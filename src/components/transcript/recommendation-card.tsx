"use client"

import type { AIRecommendation } from "@/lib/types"
import { DifficultyBadge } from "@/components/ui/badge"

interface RecommendationCardProps {
  rec: AIRecommendation
  expanded: boolean
  onToggle: () => void
  isStartHere?: boolean
  startHereReason?: string
}

export function RecommendationCard({
  rec,
  expanded,
  onToggle,
  isStartHere,
  startHereReason,
}: RecommendationCardProps) {
  const title = rec.recommendationTitle || rec.recommendation.split(".")[0]

  return (
    <div
      className={`rounded-xl overflow-hidden border ${
        isStartHere
          ? "bg-auto-high/[0.04] border-auto-high/25 ring-1 ring-auto-high/10"
          : "bg-background-white border-border"
      }`}
    >
      {/* Start Here label */}
      {isStartHere && (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
          <div className="w-4 h-4 rounded-full bg-auto-high text-white flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-2.5 w-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-auto-high uppercase tracking-wide">
            Start Here
          </span>
        </div>
      )}

      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
          isStartHere ? "hover:bg-auto-high/[0.06]" : "hover:bg-cream/50"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
            isStartHere
              ? "bg-auto-high text-white"
              : "bg-foreground text-white"
          }`}
        >
          {rec.stepOrder}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-tertiary truncate">{rec.stepName}</p>
          <h4 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0 max-w-[40%]">
          <span className="text-xs font-semibold text-auto-high truncate" title={rec.estimatedTimeSavings}>
            {rec.estimatedTimeSavings}
          </span>
          <DifficultyBadge level={rec.difficulty} />
          <svg
            className={`h-4 w-4 text-tertiary transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4">
          <div className="pt-3 pl-9">
            {isStartHere && startHereReason && (
              <p className="text-xs text-auto-high bg-auto-high/[0.06] rounded-lg px-3 py-2 mb-3 leading-relaxed">
                {startHereReason}
              </p>
            )}

            <p className="text-sm text-foreground leading-relaxed mb-3">
              {rec.recommendation}
            </p>

            <div className="flex flex-wrap gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-tertiary">Tool:</span>
                <span className="font-medium text-foreground bg-cream rounded-full px-2.5 py-0.5">
                  {rec.toolSuggestion}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-tertiary">Saves:</span>
                <span className="font-semibold text-auto-high">
                  {rec.estimatedTimeSavings}
                </span>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              {rec.rationale}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
