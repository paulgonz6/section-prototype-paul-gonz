import type { Department } from "@/lib/types"
import { Tooltip } from "@/components/ui/tooltip"

const departmentStyles: Partial<Record<Department, string>> = {
  Accounting: "bg-[#4A90D9]/10 text-[#4A90D9]",
  "Customer Success": "bg-[#06B6D4]/10 text-[#06B6D4]",
  "Customer Support": "bg-[#14B8A6]/10 text-[#14B8A6]",
  "Data & Analytics": "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  Design: "bg-[#F472B6]/10 text-[#F472B6]",
  Engineering: "bg-[#6C6CEB]/10 text-[#6C6CEB]",
  Facilities: "bg-[#78716C]/10 text-[#78716C]",
  Finance: "bg-[#4A90D9]/10 text-[#4A90D9]",
  HR: "bg-[#D97DA6]/10 text-[#D97DA6]",
  IT: "bg-[#6366F1]/10 text-[#6366F1]",
  Legal: "bg-[#D4A843]/10 text-[#D4A843]",
  Marketing: "bg-[#9B7EF0]/10 text-[#9B7EF0]",
  Operations: "bg-[#53A945]/10 text-[#53A945]",
  Procurement: "bg-[#F97316]/10 text-[#F97316]",
  "Product Management": "bg-[#A855F7]/10 text-[#A855F7]",
  "Quality Assurance": "bg-[#22D3EE]/10 text-[#22D3EE]",
  "Research & Development": "bg-[#4F46E5]/10 text-[#4F46E5]",
  Sales: "bg-[#EF4444]/10 text-[#EF4444]",
  Security: "bg-[#DC2626]/10 text-[#DC2626]",
  "Supply Chain": "bg-[#84CC16]/10 text-[#84CC16]",
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
    <Tooltip content={automationTooltips[level]}>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${automationStyles[level]}`}
      >
        {level}
      </span>
    </Tooltip>
  )
}

const difficultyStyles = {
  Easy: "bg-auto-high/10 text-auto-high",
  Medium: "bg-auto-medium/10 text-auto-medium",
  Hard: "bg-auto-low/10 text-auto-low",
}

const difficultyTooltips = {
  Easy: "Easy — straightforward to implement with minimal dependencies, configuration changes, or off-the-shelf tooling",
  Medium: "Medium — requires some integration work, cross-team coordination, or custom configuration",
  Hard: "Hard — significant effort involving complex integrations, process redesign, or organizational change management",
}

export function DifficultyBadge({
  level,
}: {
  level: "Easy" | "Medium" | "Hard"
}) {
  return (
    <Tooltip content={difficultyTooltips[level]}>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${difficultyStyles[level]}`}
      >
        {level}
      </span>
    </Tooltip>
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
