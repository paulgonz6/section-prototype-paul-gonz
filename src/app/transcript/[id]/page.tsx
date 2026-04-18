import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TranscriptDetailClient } from "@/components/transcript/transcript-detail-client"

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()
  if (!supabase) notFound()

  const { data: transcript, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !transcript) {
    notFound()
  }

  return <TranscriptDetailClient initialData={transcript} />
}
