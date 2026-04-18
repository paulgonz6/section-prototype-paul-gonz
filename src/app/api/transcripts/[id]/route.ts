import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const { data, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "Transcript not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
