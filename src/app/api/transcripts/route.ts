import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }
  const { searchParams } = new URL(request.url)

  const department = searchParams.get("department")
  const search = searchParams.get("search")
  const status = searchParams.get("status")

  let query = supabase
    .from("transcripts")
    .select(
      "id, role, department, workflow_name, metadata, status, created_at"
    )
    .order("created_at", { ascending: false })

  if (department) {
    query = query.eq("department", department)
  }

  if (status) {
    query = query.eq("status", status)
  }

  if (search) {
    query = query.or(
      `workflow_name.ilike.%${search}%,role.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }
  const body = await request.json()

  const { role, department, workflow_name, raw_transcript } = body

  if (!role || !department || !workflow_name || !raw_transcript) {
    return NextResponse.json(
      { error: "Missing required fields: role, department, workflow_name, raw_transcript" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("transcripts")
    .insert({
      role,
      department,
      workflow_name,
      raw_transcript,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
