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
  | "Accounting"
  | "Customer Success"
  | "Customer Support"
  | "Data & Analytics"
  | "Design"
  | "Engineering"
  | "Facilities"
  | "Finance"
  | "HR"
  | "IT"
  | "Legal"
  | "Marketing"
  | "Operations"
  | "Procurement"
  | "Product Management"
  | "Quality Assurance"
  | "Research & Development"
  | "Sales"
  | "Security"
  | "Supply Chain"

export interface Prompt {
  id: string
  slug: string
  name: string
  template: string
  variables: string[]
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const DEPARTMENTS: Department[] = [
  "Accounting",
  "Customer Success",
  "Customer Support",
  "Data & Analytics",
  "Design",
  "Engineering",
  "Facilities",
  "Finance",
  "HR",
  "IT",
  "Legal",
  "Marketing",
  "Operations",
  "Procurement",
  "Product Management",
  "Quality Assurance",
  "Research & Development",
  "Sales",
  "Security",
  "Supply Chain",
]

export const DEPARTMENT_COLORS: Record<Department, string> = {
  "Accounting": "#3B82F6",
  "Customer Success": "#06B6D4",
  "Customer Support": "#14B8A6",
  "Data & Analytics": "#8B5CF6",
  "Design": "#F472B6",
  "Engineering": "#6366F1",
  "Facilities": "#78716C",
  "Finance": "#3B82F6",
  "HR": "#EC4899",
  "IT": "#6366F1",
  "Legal": "#F59E0B",
  "Marketing": "#8B5CF6",
  "Operations": "#10B981",
  "Procurement": "#F97316",
  "Product Management": "#A855F7",
  "Quality Assurance": "#22D3EE",
  "Research & Development": "#4F46E5",
  "Sales": "#EF4444",
  "Security": "#DC2626",
  "Supply Chain": "#84CC16",
}
