"use client"

import { useState, useMemo } from "react"
import type { Transcript, TranscriptMetadata } from "@/lib/types"
import { DEPARTMENTS } from "@/lib/types"
import { TranscriptCard } from "./transcript-card"

type TranscriptListItem = Pick<
  Transcript,
  "id" | "role" | "department" | "workflow_name" | "metadata" | "status"
>

interface TranscriptGridProps {
  transcripts: TranscriptListItem[]
}

export function TranscriptGrid({ transcripts }: TranscriptGridProps) {
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("all")
  const [automationFilter, setAutomationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return transcripts.filter((t) => {
      if (
        search &&
        !t.workflow_name.toLowerCase().includes(search.toLowerCase()) &&
        !t.role.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      if (department !== "all" && t.department !== department) return false
      if (statusFilter !== "all" && t.status !== statusFilter) return false

      if (automationFilter !== "all" && t.metadata) {
        const meta = t.metadata as TranscriptMetadata
        if (automationFilter === "high" && meta.automationPotential < 70)
          return false
        if (
          automationFilter === "medium" &&
          (meta.automationPotential < 40 || meta.automationPotential >= 70)
        )
          return false
        if (automationFilter === "low" && meta.automationPotential >= 40)
          return false
      }

      return true
    })
  }, [transcripts, search, department, automationFilter, statusFilter])

  return (
    <div>
      {/* Filters — Deel-style clean inputs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-strong w-64 placeholder:text-tertiary"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-secondary"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={automationFilter}
          onChange={(e) => setAutomationFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-secondary"
        >
          <option value="all">All potential</option>
          <option value="high">High (70%+)</option>
          <option value="medium">Medium (40-70%)</option>
          <option value="low">Low (&lt;40%)</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-secondary"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-tertiary mb-4 font-medium">
        {filtered.length} workflow{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <TranscriptCard key={t.id} transcript={t} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-secondary">
          <p className="text-sm">No workflows match your filters.</p>
        </div>
      )}
    </div>
  )
}
