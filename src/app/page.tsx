import { createServerClient } from "@/lib/supabase/server"
import { StatsBanner } from "@/components/layout/stats-banner"
import { TranscriptGrid } from "@/components/transcript/transcript-grid"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let transcripts: any[] = []

  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from("transcripts")
      .select("id, role, department, workflow_name, metadata, status")
      .order("created_at", { ascending: true })
    transcripts = data || []
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Workflow Audit Overview
        </h1>
        <p className="text-sm text-secondary mt-1">
          Browse extracted workflows from employee interviews. Click any
          workflow to see the full conversation, extracted steps, and AI
          recommendations.
        </p>
      </div>

      <StatsBanner transcripts={transcripts} />
      <TranscriptGrid transcripts={transcripts} />
    </div>
  )
}
