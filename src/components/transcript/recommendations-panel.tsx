"use client"

import { useState, useMemo } from "react"
import type { AIRecommendation } from "@/lib/types"
import { RecommendationCard } from "./recommendation-card"

interface RecommendationsResult {
  recommendations: AIRecommendation[]
  summary: string
  totalEstimatedTimeSavings: string
  startHere: {
    stepOrder: number
    stepName: string
    reason: string
  }
}

interface RecommendationsPanelProps {
  data: RecommendationsResult
}

type SortMode = "step" | "impact" | "difficulty"

function parseTimeToMinutes(timeStr: string): number {
  const lower = timeStr.toLowerCase()
  let total = 0
  const hourMatch = lower.match(/([\d.]+)\s*hour/)
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60
  const minMatch = lower.match(/([\d.]+)\s*min/)
  if (minMatch) total += parseFloat(minMatch[1])
  return total || 0
}

const difficultyOrder: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }

export function RecommendationsPanel({ data }: RecommendationsPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>("step")
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set())

  const sorted = useMemo(() => {
    const recs = [...data.recommendations]
    if (sortMode === "impact") {
      recs.sort((a, b) => parseTimeToMinutes(b.estimatedTimeSavings) - parseTimeToMinutes(a.estimatedTimeSavings))
    } else if (sortMode === "difficulty") {
      recs.sort((a, b) => (difficultyOrder[a.difficulty] ?? 1) - (difficultyOrder[b.difficulty] ?? 1))
    } else {
      recs.sort((a, b) => a.stepOrder - b.stepOrder)
    }
    return recs
  }, [data.recommendations, sortMode])

  const allExpanded = expandedSet.size === data.recommendations.length

  function toggleAll() {
    if (allExpanded) {
      setExpandedSet(new Set())
    } else {
      setExpandedSet(new Set(data.recommendations.map((r) => r.stepOrder)))
    }
  }

  function toggleOne(stepOrder: number) {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(stepOrder)) {
        next.delete(stepOrder)
      } else {
        next.add(stepOrder)
      }
      return next
    })
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Summary card */}
      <div className="bg-accent-light border border-accent/20 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-accent-strong mb-2">
          Optimization Opportunity
        </h3>
        <p className="text-sm text-foreground leading-relaxed mb-4">{data.summary}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">
            {data.totalEstimatedTimeSavings}
          </p>
          <p className="text-xs text-secondary">potential savings per cycle</p>
        </div>
      </div>

      {/* Start here */}
      <div className="bg-auto-high/5 border border-auto-high/15 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-auto-high text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Start Here
          </h3>
        </div>
        <p className="text-sm text-foreground ml-7">
          Step {data.startHere.stepOrder}: {data.startHere.stepName}
        </p>
        <p className="text-xs text-secondary mt-1 ml-7">{data.startHere.reason}</p>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-tertiary uppercase tracking-wider">
          All Recommendations ({data.recommendations.length})
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="text-xs text-secondary hover:text-foreground transition-colors"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-xs text-secondary bg-transparent border border-border rounded-lg px-2 py-1 hover:border-border-strong transition-colors cursor-pointer"
          >
            <option value="step">By step order</option>
            <option value="impact">By time saved</option>
            <option value="difficulty">By difficulty</option>
          </select>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-4">
        {sorted.map((rec) => (
          <RecommendationCard
            key={rec.stepOrder}
            rec={rec}
            expanded={expandedSet.has(rec.stepOrder)}
            onToggle={() => toggleOne(rec.stepOrder)}
          />
        ))}
      </div>
    </div>
  )
}
