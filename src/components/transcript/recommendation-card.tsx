"use client"

import { useState } from "react"
import type { AIRecommendation } from "@/lib/types"
import { DifficultyBadge } from "@/components/ui/badge"

interface RecommendationCardProps {
  rec: AIRecommendation
  expanded: boolean
  onToggle: () => void
}

export function RecommendationCard({ rec, expanded, onToggle }: RecommendationCardProps) {
  const title = rec.recommendationTitle || rec.recommendation.split(".")[0]

  return (
    <div className="bg-background-white border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-cream/50 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-foreground text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {rec.stepOrder}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-tertiary truncate">{rec.stepName}</p>
          <h4 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-auto-high whitespace-nowrap">
            {rec.estimatedTimeSavings}
          </span>
          <DifficultyBadge level={rec.difficulty} />
          <svg
            className={`h-4 w-4 text-tertiary transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="pt-3 pl-9">
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
