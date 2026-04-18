import { z } from "zod"

export const WorkflowStepSchema = z.object({
  order: z.number(),
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  timeEstimate: z.string(),
  painPoints: z.array(z.string()),
  automationPotential: z.enum(["High", "Medium", "Low"]),
  automationRationale: z.string(),
})

export const HandoffSchema = z.object({
  from: z.string(),
  to: z.string(),
  method: z.string(),
  description: z.string(),
})

export const ExtractedWorkflowSchema = z.object({
  trigger: z.string(),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Ad hoc"]),
  steps: z.array(WorkflowStepSchema),
  handoffs: z.array(HandoffSchema),
  totalTimePerCycle: z.string(),
})

export const AIRecommendationSchema = z.object({
  stepOrder: z.number(),
  stepName: z.string(),
  recommendationTitle: z.string(),
  recommendation: z.string(),
  toolSuggestion: z.string(),
  estimatedTimeSavings: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  rationale: z.string(),
})

export const AIRecommendationsResponseSchema = z.object({
  recommendations: z.array(AIRecommendationSchema),
  summary: z.string(),
  totalEstimatedTimeSavings: z.string(),
  startHere: z.object({
    stepOrder: z.number(),
    stepName: z.string(),
    reason: z.string(),
  }),
})
