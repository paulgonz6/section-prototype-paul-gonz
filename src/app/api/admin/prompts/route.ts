import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const all = searchParams.get("all") === "true"

  let query = supabase
    .from("prompts")
    .select("*")
    .order("slug")
    .order("version", { ascending: false })

  if (!all) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const { slug, template } = await request.json()

  if (!slug || !template) {
    return NextResponse.json({ error: "Missing slug or template" }, { status: 400 })
  }

  // Get the current active prompt for this slug
  const { data: current, error: fetchError } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
  }

  // Deactivate the current version
  await supabase
    .from("prompts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", current.id)

  // Insert new version
  const { data: newPrompt, error: insertError } = await supabase
    .from("prompts")
    .insert({
      slug: current.slug,
      name: current.name,
      template,
      variables: current.variables,
      version: current.version + 1,
      is_active: true,
    })
    .select()
    .single()

  if (insertError) {
    // Rollback: reactivate old version
    await supabase
      .from("prompts")
      .update({ is_active: true })
      .eq("id", current.id)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(newPrompt)
}
