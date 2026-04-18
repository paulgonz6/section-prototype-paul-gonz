export function getExtractionPrompt(rawTranscript: string): string {
  return `You are an expert workflow analyst. Given the following interview transcript between an Agent and an Employee, extract a structured workflow representation.

<transcript>
${rawTranscript}
</transcript>

Extract the following:

1. **trigger**: What event or condition starts this workflow? Be specific.
2. **frequency**: How often does this workflow occur? Must be exactly one of: "Daily", "Weekly", "Monthly", "Quarterly", "Ad hoc"
3. **steps**: Each discrete step in the workflow. For each step include:
   - order (sequential, starting at 1)
   - name (short label, 3-6 words, e.g. "Download raw trial balance")
   - description (1-2 sentences explaining what happens)
   - tools (list of specific software/tools used: e.g. "Excel", "SAP", "Slack", "Email")
   - timeEstimate (human-readable: "2 hours", "30 minutes", "15 minutes")
   - painPoints (specific frustrations or inefficiencies mentioned for this step — use the employee's own words when possible)
   - automationPotential ("High", "Medium", or "Low"):
     * "High": Repetitive, rule-based, or template-driven work that can be fully automated, OR tasks like summarization, information gathering across multiple sources, data synthesis, or pattern recognition where an LLM can do the heavy lifting with minimal human review.
     * "Medium": Tasks where human judgment is needed for final decisions, but AI can meaningfully accelerate the work — e.g., drafting content for human editing, flagging anomalies for review, pre-populating forms from unstructured data, or prioritizing items based on criteria.
     * "Low": Tasks that are fundamentally about interpersonal relationships, physical actions, real-time negotiation, or novel strategic decisions where AI assistance provides marginal value.
     IMPORTANT: Do NOT mark a step "Low" simply because it involves judgment, creativity, or contextual reasoning. LLMs excel at synthesis, summarization, gap analysis, and contextual decision support in human-in-the-loop workflows. Reserve "Low" for tasks where AI genuinely cannot help.
   - automationRationale (1 sentence explaining why this step has that automation potential — if Medium or High, mention what AI would handle vs. what stays human)
4. **handoffs**: Each point where work transfers between people. Include from (who sends), to (who receives), method (how: "Email", "Slack", "Shared drive", etc.), and description.
5. **totalTimePerCycle**: Total time for one complete cycle of this workflow (e.g. "6.5 hours", "3 days")

Be precise. Only include information explicitly stated or strongly implied in the transcript. Do not invent tools or steps not mentioned. If the employee is vague about a step, still extract what you can but keep the description honest about the ambiguity.`
}
