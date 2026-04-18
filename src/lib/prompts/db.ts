import { createServerClient } from "@/lib/supabase/server"

export async function getActiveTemplate(slug: string): Promise<string | null> {
  try {
    const supabase = createServerClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from("prompts")
      .select("template")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (error || !data) return null
    return data.template
  } catch {
    return null
  }
}
