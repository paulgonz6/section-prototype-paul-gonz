interface ChatMessageProps {
  speaker: "Agent" | "Employee"
  text: string
}

export function ChatMessage({ speaker, text }: ChatMessageProps) {
  const isAgent = speaker === "Agent"

  return (
    <div className="flex gap-3 mb-4">
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
          isAgent
            ? "bg-foreground text-white"
            : "bg-cream-dark text-foreground"
        }`}
      >
        {isAgent ? "A" : "E"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-tertiary mb-1">
          {isAgent ? "Agent" : "Employee"}
        </p>
        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
            isAgent
              ? "bg-cream/60 text-foreground"
              : "bg-background-white border border-border text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  )
}
