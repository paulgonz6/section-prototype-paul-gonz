import type { Transcript, TranscriptMetadata } from "@/lib/types"

interface StatsBannerProps {
  transcripts: Pick<Transcript, "department" | "metadata" | "status">[]
}

export function StatsBanner({ transcripts }: StatsBannerProps) {
  const completed = transcripts.filter((t) => t.status === "completed")
  const pending = transcripts.filter((t) => t.status === "pending")

  const metas = completed
    .map((t) => t.metadata as TranscriptMetadata | null)
    .filter(Boolean) as TranscriptMetadata[]

  const avgAutomation =
    metas.length > 0
      ? Math.round(
          metas.reduce((sum, m) => sum + m.automationPotential, 0) /
            metas.length
        )
      : 0

  const totalWeeklyHours = Math.round(
    metas.reduce((sum, m) => sum + m.totalWeeklyHours, 0) * 10
  ) / 10

  const saveableHours = Math.round(totalWeeklyHours * (avgAutomation / 100) * 10) / 10

  const deptCounts: Record<string, number> = {}
  for (const t of transcripts) {
    deptCounts[t.department] = (deptCounts[t.department] || 0) + 1
  }

  const stats = [
    {
      label: "Workflows Mapped",
      value: transcripts.length.toString(),
      sublabel: `${completed.length} processed, ${pending.length} pending`,
    },
    {
      label: "Avg. Automation Potential",
      value: `${avgAutomation}%`,
      sublabel: "Across all completed workflows",
    },
    {
      label: "Total Weekly Hours",
      value: totalWeeklyHours.toString(),
      sublabel: `~${saveableHours}h saveable with AI`,
    },
    {
      label: "Departments",
      value: Object.keys(deptCounts).length.toString(),
      sublabel: Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([d, c]) => `${d} (${c})`)
        .join(", "),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-background-white border border-border rounded-xl p-4"
        >
          <p className="text-xs font-medium text-tertiary uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1.5">
            {stat.value}
          </p>
          <p className="text-xs text-secondary mt-1">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  )
}
