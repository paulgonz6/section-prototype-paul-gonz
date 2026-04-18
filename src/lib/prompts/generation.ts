interface TranscriptConfig {
  role: string
  department: string
  workflowName: string
  quality: "detailed" | "vague" | "brief" | "complex"
}

export function getGenerationPrompt(config: TranscriptConfig): string {
  const qualityInstructions = {
    detailed:
      "The employee is articulate and organized. They explain each step clearly, name specific tools, give concrete time estimates, and clearly describe their pain points. This is a high-quality interview.",
    vague:
      'The employee is hesitant and meandering. They use phrases like "um, I guess I kind of...", "I\'m not totally sure but...", "it depends, sometimes I...", and go on tangents. They give vague time estimates ("a while", "not too long"). The interviewer has to work harder to extract specifics. This simulates a challenging interview.',
    brief:
      "The employee gives short, one-sentence answers. They don't elaborate unless pushed. The interviewer has to ask follow-up questions to get any detail. Some steps may be under-explained. This simulates a reluctant or busy participant.",
    complex:
      'The workflow has conditional branches and exceptions. The employee describes paths that fork based on conditions (e.g., "if the amount is over $10k, it goes to a different approval chain", "for international vendors, there\'s an extra compliance step"). Include at least 2 branching conditions. This tests whether extraction handles non-linear workflows.',
  }

  return `You are simulating a realistic interview between a workflow audit agent and an employee. Generate a natural conversation transcript.

<context>
Role: ${config.role}
Department: ${config.department}
Workflow: ${config.workflowName}
</context>

<quality_style>
${qualityInstructions[config.quality]}
</quality_style>

Generate a conversation between "Agent" and "Employee" with 15-35 turns. The conversation should:

1. Start with the agent introducing the purpose and asking the employee to walk through their workflow
2. Cover what triggers the workflow and how often it happens
3. Walk through each step in detail — what they do, what tools they use, how long it takes
4. Probe into pain points, frustrations, and workarounds
5. Ask about handoffs to other people or teams
6. Ask what they wish could be automated or improved
7. End naturally when the workflow is fully covered

Format each line as:
Agent: [message]
Employee: [message]

Make it feel like a real conversation. Include:
- Natural speech patterns (not robotic)
- Specific, realistic tool names (Excel, SAP, Salesforce, Slack, Google Sheets, Jira, Workday, etc.)
- Realistic time estimates
- Genuine-sounding frustrations
- Department-appropriate terminology

Do NOT include any preamble, headers, or explanation. Just output the conversation transcript directly.`
}

export interface TranscriptSpec {
  role: string
  department: string
  workflowName: string
  quality: "detailed" | "vague" | "brief" | "complex"
}

export const TRANSCRIPT_SPECS: TranscriptSpec[] = [
  // Finance (10)
  { role: "Financial Analyst", department: "Finance", workflowName: "Monthly Financial Close", quality: "detailed" },
  { role: "Accounts Payable Specialist", department: "Finance", workflowName: "Invoice Processing", quality: "vague" },
  { role: "Controller", department: "Finance", workflowName: "Quarterly Audit Preparation", quality: "complex" },
  { role: "FP&A Manager", department: "Finance", workflowName: "Annual Budget Planning", quality: "detailed" },
  { role: "Staff Accountant", department: "Finance", workflowName: "Expense Report Review", quality: "brief" },
  { role: "Treasury Analyst", department: "Finance", workflowName: "Cash Flow Forecasting", quality: "vague" },
  { role: "Accounts Receivable Clerk", department: "Finance", workflowName: "Collections Follow-up", quality: "detailed" },
  { role: "Payroll Administrator", department: "Finance", workflowName: "Bi-weekly Payroll Processing", quality: "complex" },
  { role: "Tax Specialist", department: "Finance", workflowName: "Sales Tax Filing", quality: "brief" },
  { role: "Procurement Analyst", department: "Finance", workflowName: "Purchase Order Approval", quality: "vague" },

  // Marketing (8)
  { role: "Content Marketing Manager", department: "Marketing", workflowName: "Blog Content Production", quality: "detailed" },
  { role: "Demand Generation Manager", department: "Marketing", workflowName: "Campaign Launch Process", quality: "complex" },
  { role: "Brand Manager", department: "Marketing", workflowName: "Brand Asset Approval", quality: "vague" },
  { role: "Social Media Manager", department: "Marketing", workflowName: "Social Media Content Calendar", quality: "detailed" },
  { role: "Email Marketing Specialist", department: "Marketing", workflowName: "Email Campaign Execution", quality: "brief" },
  { role: "Marketing Ops Manager", department: "Marketing", workflowName: "Marketing Analytics Reporting", quality: "detailed" },
  { role: "Event Marketing Coordinator", department: "Marketing", workflowName: "Event Planning and Execution", quality: "complex" },
  { role: "Product Marketing Manager", department: "Marketing", workflowName: "Product Launch Messaging", quality: "vague" },

  // Legal (8)
  { role: "Contract Manager", department: "Legal", workflowName: "Vendor Contract Review", quality: "detailed" },
  { role: "Paralegal", department: "Legal", workflowName: "NDA Processing", quality: "brief" },
  { role: "Compliance Analyst", department: "Legal", workflowName: "Regulatory Compliance Audit", quality: "complex" },
  { role: "Corporate Counsel", department: "Legal", workflowName: "Litigation Document Preparation", quality: "vague" },
  { role: "IP Coordinator", department: "Legal", workflowName: "Patent Filing Coordination", quality: "detailed" },
  { role: "Privacy Officer", department: "Legal", workflowName: "Data Privacy Impact Assessment", quality: "complex" },
  { role: "Legal Operations Manager", department: "Legal", workflowName: "Legal Invoice Review", quality: "brief" },
  { role: "Regulatory Affairs Specialist", department: "Legal", workflowName: "Policy Update Distribution", quality: "vague" },

  // Operations (8)
  { role: "Supply Chain Analyst", department: "Operations", workflowName: "Inventory Reorder Process", quality: "detailed" },
  { role: "Procurement Manager", department: "Operations", workflowName: "Vendor Evaluation and Selection", quality: "complex" },
  { role: "Facilities Manager", department: "Operations", workflowName: "Facility Maintenance Scheduling", quality: "vague" },
  { role: "Quality Assurance Manager", department: "Operations", workflowName: "Product Quality Inspection", quality: "detailed" },
  { role: "Logistics Coordinator", department: "Operations", workflowName: "Shipping and Fulfillment", quality: "brief" },
  { role: "Operations Analyst", department: "Operations", workflowName: "Operational Metrics Reporting", quality: "detailed" },
  { role: "Warehouse Manager", department: "Operations", workflowName: "Receiving and Inventory Check-in", quality: "vague" },
  { role: "Process Improvement Lead", department: "Operations", workflowName: "Process Optimization Review", quality: "complex" },

  // HR (8)
  { role: "HR Coordinator", department: "HR", workflowName: "New Employee Onboarding", quality: "detailed" },
  { role: "Recruiter", department: "HR", workflowName: "Candidate Pipeline Management", quality: "vague" },
  { role: "HRBP", department: "HR", workflowName: "Performance Review Cycle", quality: "complex" },
  { role: "Compensation Analyst", department: "HR", workflowName: "Annual Compensation Review", quality: "detailed" },
  { role: "Benefits Administrator", department: "HR", workflowName: "Open Enrollment Processing", quality: "brief" },
  { role: "L&D Manager", department: "HR", workflowName: "Training Program Development", quality: "vague" },
  { role: "HR Operations Specialist", department: "HR", workflowName: "Employee Offboarding", quality: "brief" },
  { role: "People Analytics Manager", department: "HR", workflowName: "Quarterly Turnover Analysis", quality: "complex" },

  // Engineering (8)
  { role: "QA Lead", department: "Engineering", workflowName: "Release Testing Process", quality: "detailed" },
  { role: "Technical Writer", department: "Engineering", workflowName: "API Documentation Updates", quality: "vague" },
  { role: "Release Manager", department: "Engineering", workflowName: "Production Deployment Process", quality: "complex" },
  { role: "DevOps Engineer", department: "Engineering", workflowName: "Infrastructure Provisioning", quality: "detailed" },
  { role: "Security Engineer", department: "Engineering", workflowName: "Security Vulnerability Scanning", quality: "brief" },
  { role: "Engineering Manager", department: "Engineering", workflowName: "Sprint Planning and Standup", quality: "vague" },
  { role: "Site Reliability Engineer", department: "Engineering", workflowName: "Incident Response and Postmortem", quality: "complex" },
  { role: "Data Engineer", department: "Engineering", workflowName: "ETL Pipeline Monitoring", quality: "brief" },
]
