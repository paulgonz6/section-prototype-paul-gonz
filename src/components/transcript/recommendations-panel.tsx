"use client"

import { useState, useMemo } from "react"
import type { AIRecommendation } from "@/lib/types"
import { RecommendationCard } from "./recommendation-card"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

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
      recs.sort(
        (a, b) =>
          parseTimeToMinutes(b.estimatedTimeSavings) -
          parseTimeToMinutes(a.estimatedTimeSavings)
      )
    } else if (sortMode === "difficulty") {
      recs.sort(
        (a, b) =>
          (difficultyOrder[a.difficulty] ?? 1) -
          (difficultyOrder[b.difficulty] ?? 1)
      )
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
    <ResizablePanelGroup orientation="horizontal">
      {/* Left panel — summary & stats */}
      <ResizablePanel defaultSize="30%" minSize="20%" maxSize="45%">
        <div className="h-full overflow-y-auto p-6 space-y-5">
          {/* Potential savings — leading indicator */}
          <div>
            <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-1">
              Potential Savings with AI Integration
            </p>
            <p className="text-2xl font-bold text-foreground line-clamp-2">
              {data.totalEstimatedTimeSavings}
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Opportunity — concise, clamped */}
          <div>
            <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
              Opportunity
            </p>
            <p className="text-sm text-secondary leading-relaxed line-clamp-3">
              {data.summary}
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {data.recommendations.length}
              </p>
              <p className="text-xs text-tertiary">Recommendations</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {data.recommendations.filter((r) => r.difficulty === "Easy").length}
              </p>
              <p className="text-xs text-tertiary">Quick wins</p>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right panel — recommendation cards */}
      <ResizablePanel defaultSize="70%" minSize="45%">
        <div className="h-full overflow-y-auto p-6">
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
          <div className="space-y-3">
            {sorted.map((rec) => (
              <RecommendationCard
                key={rec.stepOrder}
                rec={rec}
                expanded={expandedSet.has(rec.stepOrder)}
                onToggle={() => toggleOne(rec.stepOrder)}
                isStartHere={rec.stepOrder === data.startHere.stepOrder}
                startHereReason={
                  rec.stepOrder === data.startHere.stepOrder
                    ? data.startHere.reason
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
