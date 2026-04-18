import type { Department } from "@/lib/types"

const departmentStyles: Record<Department, string> = {
  Finance: "bg-[#4A90D9]/10 text-[#4A90D9]",
  Marketing: "bg-[#9B7EF0]/10 text-[#9B7EF0]",
  Legal: "bg-[#D4A843]/10 text-[#D4A843]",
  Operations: "bg-[#53A945]/10 text-[#53A945]",
  HR: "bg-[#D97DA6]/10 text-[#D97DA6]",
  Engineering: "bg-[#6C6CEB]/10 text-[#6C6CEB]",
}

export function DepartmentBadge({ department }: { department: string }) {
  const style = departmentStyles[department as Department] || "bg-foreground/5 text-secondary"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {department}
    </span>
  )
}

const automationStyles = {
  High: "bg-auto-high/10 text-auto-high",
  Medium: "bg-auto-medium/10 text-auto-medium",
  Low: "bg-auto-low/10 text-auto-low",
}

const automationTooltips = {
  High: "High potential — this step can be fully automated or handled by AI with minimal human oversight",
  Medium: "Medium potential — AI can significantly accelerate this step, but human judgment is needed for review or final decisions",
  Low: "Low potential — this step is primarily human-driven, though AI may provide limited support like context gathering",
}

export function AutomationBadge({
  level,
}: {
  level: "High" | "Medium" | "Low"
}) {
  return (
    <span
      title={automationTooltips[level]}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${automationStyles[level]}`}
    >
      {level}
    </span>
  )
}

const difficultyStyles = {
  Easy: "bg-auto-high/10 text-auto-high",
  Medium: "bg-auto-medium/10 text-auto-medium",
  Hard: "bg-auto-low/10 text-auto-low",
}

export function DifficultyBadge({
  level,
}: {
  level: "Easy" | "Medium" | "Hard"
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficultyStyles[level]}`}
    >
      {level}
    </span>
  )
}

const statusStyles: Record<string, string> = {
  pending: "bg-foreground/5 text-secondary",
  extracting: "bg-accent/20 text-accent-strong",
  recommending: "bg-accent/20 text-accent-strong",
  completed: "bg-auto-high/10 text-auto-high",
  failed: "bg-auto-low/10 text-auto-low",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}
    >
      {status}
    </span>
  )
}
