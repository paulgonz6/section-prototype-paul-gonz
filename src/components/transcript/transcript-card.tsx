import Link from "next/link"
import type { Transcript, TranscriptMetadata } from "@/lib/types"
import { DepartmentBadge, StatusBadge } from "@/components/ui/badge"

interface TranscriptCardProps {
  transcript: Pick<
    Transcript,
    "id" | "role" | "department" | "workflow_name" | "metadata" | "status"
  >
}

export function TranscriptCard({ transcript: t }: TranscriptCardProps) {
  const meta = t.metadata as TranscriptMetadata | null

  const automationColor =
    meta && meta.automationPotential >= 70
      ? "bg-auto-high"
      : meta && meta.automationPotential >= 40
        ? "bg-auto-medium"
        : "bg-auto-low"

  return (
    <Link
      href={`/transcript/${t.id}`}
      className="block bg-background-white border border-border rounded-xl p-4 hover:border-border-strong hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <DepartmentBadge department={t.department} />
        <StatusBadge status={t.status} />
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-0.5">
        {t.workflow_name}
      </h3>
      <p className="text-xs text-secondary mb-3">{t.role}</p>

      {meta ? (
        <div className="space-y-2">
          {/* Automation potential bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-tertiary">Automation potential</span>
              <span className="font-semibold text-foreground">{meta.automationPotential}%</span>
            </div>
            <div className="h-1.5 bg-cream rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${automationColor}`}
                style={{ width: `${meta.automationPotential}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-secondary">
            <span>{meta.totalSteps} steps</span>
            <span>{meta.totalWeeklyHours}h/week</span>
          </div>

          <p className="text-xs text-auto-low truncate">
            {meta.topPainPoint}
          </p>
        </div>
      ) : (
        <p className="text-xs text-tertiary">Not yet processed</p>
      )}
    </Link>
  )
}
