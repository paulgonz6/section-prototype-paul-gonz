import { ChatMessage } from "./chat-message"

interface ConversationViewProps {
  rawTranscript: string
}

function parseTranscript(
  raw: string
): { speaker: "Agent" | "Employee"; text: string }[] {
  const messages: { speaker: "Agent" | "Employee"; text: string }[] = []
  const lines = raw.split("\n")

  let currentSpeaker: "Agent" | "Employee" | null = null
  let currentText = ""

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const agentMatch = trimmed.match(/^Agent:\s*(.*)/)
    const employeeMatch = trimmed.match(/^Employee:\s*(.*)/)

    if (agentMatch) {
      if (currentSpeaker && currentText) {
        messages.push({ speaker: currentSpeaker, text: currentText.trim() })
      }
      currentSpeaker = "Agent"
      currentText = agentMatch[1]
    } else if (employeeMatch) {
      if (currentSpeaker && currentText) {
        messages.push({ speaker: currentSpeaker, text: currentText.trim() })
      }
      currentSpeaker = "Employee"
      currentText = employeeMatch[1]
    } else if (currentSpeaker) {
      currentText += " " + trimmed
    }
  }

  if (currentSpeaker && currentText) {
    messages.push({ speaker: currentSpeaker, text: currentText.trim() })
  }

  return messages
}

export function ConversationView({ rawTranscript }: ConversationViewProps) {
  const messages = parseTranscript(rawTranscript)

  if (messages.length === 0) {
    return (
      <div className="p-6 text-sm text-secondary font-mono whitespace-pre-wrap leading-relaxed">
        {rawTranscript}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      {messages.map((msg, i) => (
        <ChatMessage key={i} speaker={msg.speaker} text={msg.text} />
      ))}
    </div>
  )
}
