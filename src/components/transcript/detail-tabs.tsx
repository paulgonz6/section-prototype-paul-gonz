"use client"

import { useState } from "react"

interface DetailTabsProps {
  tabs: { key: string; label: string; content: React.ReactNode }[]
  defaultTab?: string
}

export function DetailTabs({ tabs, defaultTab }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key)

  return (
    <div>
      {/* Tab bar — Sana-style underline tabs */}
      <div className="border-b border-border bg-background-white">
        <div className="flex gap-0 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tabs.find((t) => t.key === activeTab)?.content}
    </div>
  )
}
