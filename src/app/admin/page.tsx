"use client"

import { useState, useEffect, useCallback } from "react"
import { PasswordGate } from "@/components/admin/password-gate"
import { PromptEditor } from "@/components/admin/prompt-editor"
import { ReprocessPanel } from "@/components/admin/reprocess-panel"
import type { Prompt } from "@/lib/types"

export default function AdminPage() {
  return (
    <PasswordGate>
      <AdminDashboard />
    </PasswordGate>
  )
}

function AdminDashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPrompts = useCallback(async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        fetch("/api/admin/prompts"),
        fetch("/api/admin/prompts?all=true"),
      ])
      const active = await activeRes.json()
      const all = await allRes.json()
      if (Array.isArray(active)) setPrompts(active)
      if (Array.isArray(all)) setAllPrompts(all)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  async function handleSave(slug: string, template: string) {
    const res = await fetch("/api/admin/prompts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, template }),
    })
    if (!res.ok) throw new Error("Save failed")
    await fetchPrompts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-secondary mt-1">
          Manage AI prompts and reprocess transcripts
        </p>
      </div>

      <div className="space-y-6">
        {/* Prompt editors */}
        <div>
          <h2 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            AI Prompts
          </h2>
          <div className="space-y-4">
            {prompts.map((p) => {
              const history = allPrompts
                .filter((h) => h.slug === p.slug && !h.is_active)
                .sort((a, b) => b.version - a.version)
              return (
                <PromptEditor
                  key={p.id}
                  prompt={p}
                  history={history}
                  onSave={handleSave}
                />
              )
            })}
            {prompts.length === 0 && (
              <div className="bg-background-white border border-border rounded-xl px-5 py-8 text-center">
                <p className="text-sm text-secondary">
                  No prompts found. Run the database migration to seed initial prompts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reprocess */}
        <div>
          <h2 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Reprocessing
          </h2>
          <ReprocessPanel />
        </div>
      </div>
    </div>
  )
}
