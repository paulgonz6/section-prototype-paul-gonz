"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { DEPARTMENTS } from "@/lib/types"
import type { Transcript } from "@/lib/types"
import { StatusBadge } from "@/components/ui/badge"

interface SidebarProps {
  transcripts: Pick<
    Transcript,
    "id" | "role" | "department" | "workflow_name" | "status" | "metadata"
  >[]
}

export function Sidebar({ transcripts }: SidebarProps) {
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [collapsed, setCollapsed] = useState(false)

  const filtered = transcripts.filter((t) => {
    const matchesSearch =
      !search ||
      t.workflow_name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
    const matchesDept =
      departmentFilter === "all" || t.department === departmentFilter
    return matchesSearch && matchesDept
  })

  if (collapsed) {
    return (
      <aside className="w-12 bg-sidebar border-r border-border flex flex-col items-center py-4 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-cream rounded-lg text-secondary"
          title="Expand sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-72 bg-sidebar border-r border-border flex flex-col shrink-0 h-full">
      {/* Header — Sana-style with logo area */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="font-semibold text-foreground text-sm">Workflow Audit</span>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 hover:bg-cream rounded-lg text-secondary"
          title="Collapse sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav links — Sana-style icon + label */}
      <div className="px-2 py-2 border-b border-border">
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/"
              ? "bg-cream-dark/60 text-foreground font-medium"
              : "text-secondary hover:bg-cream hover:text-foreground"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Overview
        </Link>
        <Link
          href="/upload"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/upload"
              ? "bg-cream-dark/60 text-foreground font-medium"
              : "text-secondary hover:bg-cream hover:text-foreground"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Transcript
        </Link>
      </div>

      {/* Search — Sana-style */}
      <div className="px-3 pt-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transcripts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-strong placeholder:text-tertiary"
          />
        </div>
      </div>

      {/* Department filter */}
      <div className="px-3 pt-2 pb-1">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-secondary"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Transcript list — Sana-style rows */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="text-xs text-tertiary px-3 py-1.5 font-medium uppercase tracking-wider">
          Transcripts ({filtered.length})
        </div>
        {filtered.map((t) => {
          const isActive = pathname === `/transcript/${t.id}`
          return (
            <Link
              key={t.id}
              href={`/transcript/${t.id}`}
              className={`block px-3 py-2.5 rounded-lg mb-0.5 transition-colors ${
                isActive
                  ? "bg-cream-dark/60"
                  : "hover:bg-cream"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm truncate ${isActive ? "font-medium text-foreground" : "text-foreground"}`}>
                  {t.workflow_name}
                </p>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-xs text-secondary truncate">
                {t.role} &middot; {t.department}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Footer — Sana-style bottom bar */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-tertiary">
          Section AI &middot; Workflow Audit
        </p>
      </div>
    </aside>
  )
}
