"use client"

import { useState } from "react"
import type { Prompt } from "@/lib/types"

interface PromptEditorProps {
  prompt: Prompt
  history: Prompt[]
  onSave: (slug: string, template: string) => Promise<void>
}

export function PromptEditor({ prompt, history, onSave }: PromptEditorProps) {
  const [template, setTemplate] = useState(prompt.template)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const isDirty = template !== prompt.template

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(prompt.slug, template)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function handleRestore(version: Prompt) {
    setTemplate(version.template)
    setShowHistory(false)
  }

  return (
    <div className="bg-background-white border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{prompt.name}</h3>
          <p className="text-xs text-secondary mt-0.5">
            Slug: <code className="bg-cream px-1.5 py-0.5 rounded text-xs">{prompt.slug}</code>
            {" "}&middot; Version {prompt.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-cream transition-colors text-secondary"
            >
              History ({history.length})
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              saved
                ? "bg-auto-high text-white"
                : isDirty
                  ? "bg-foreground text-white hover:bg-primary-hover"
                  : "bg-cream text-tertiary cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Variable chips */}
      <div className="px-5 py-2.5 border-b border-border bg-cream/40 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-tertiary">Variables:</span>
        {prompt.variables.map((v) => (
          <code
            key={v}
            className="text-xs bg-accent-light text-accent-strong px-2 py-0.5 rounded-full font-mono"
          >
            {`{{${v}}}`}
          </code>
        ))}
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="px-5 py-3 border-b border-border bg-cream/30 max-h-48 overflow-y-auto">
          <p className="text-xs font-medium text-secondary mb-2">Previous versions</p>
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground">
                  v{h.version}
                </span>
                <span className="text-xs text-tertiary ml-2">
                  {new Date(h.updated_at).toLocaleDateString()} {new Date(h.updated_at).toLocaleTimeString()}
                </span>
                <p className="text-xs text-secondary truncate mt-0.5">
                  {h.template.slice(0, 100)}...
                </p>
              </div>
              <button
                onClick={() => handleRestore(h)}
                className="ml-3 px-2.5 py-1 text-xs border border-border rounded-md hover:bg-cream transition-colors text-secondary shrink-0"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full px-5 py-4 text-sm font-mono leading-relaxed bg-transparent resize-y focus:outline-none min-h-[300px] text-foreground placeholder:text-tertiary"
        spellCheck={false}
      />
    </div>
  )
}
