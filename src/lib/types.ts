export interface WorkflowStep {
  order: number
  name: string
  description: string
  tools: string[]
  timeEstimate: string
  painPoints: string[]
  automationPotential: "High" | "Medium" | "Low"
  automationRationale: string
}

export interface Handoff {
  from: string
  to: string
  method: string
  description: string
}

export interface ExtractedWorkflow {
  trigger: string
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Ad hoc"
  steps: WorkflowStep[]
  handoffs: Handoff[]
  totalTimePerCycle: string
}

export interface AIRecommendation {
  stepOrder: number
  stepName: string
  recommendationTitle: string
  recommendation: string
  toolSuggestion: string
  estimatedTimeSavings: string
  difficulty: "Easy" | "Medium" | "Hard"
  rationale: string
}

export interface TranscriptMetadata {
  totalSteps: number
  totalWeeklyHours: number
  automationPotential: number
  topPainPoint: string
}

export interface Transcript {
  id: string
  role: string
  department: string
  workflow_name: string
  raw_transcript: string
  extracted_workflow: ExtractedWorkflow | null
  ai_recommendations: AIRecommendation[] | null
  metadata: TranscriptMetadata | null
  status: "pending" | "extracting" | "recommending" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export type Department =
  | "Finance"
  | "Marketing"
  | "Legal"
  | "Operations"
  | "HR"
  | "Engineering"

export const DEPARTMENTS: Department[] = [
  "Finance",
  "Marketing",
  "Legal",
  "Operations",
  "HR",
  "Engineering",
]

export const DEPARTMENT_COLORS: Record<Department, string> = {
  Finance: "#3B82F6",
  Marketing: "#8B5CF6",
  Legal: "#F59E0B",
  Operations: "#10B981",
  HR: "#EC4899",
  Engineering: "#6366F1",
}
