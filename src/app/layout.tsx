import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createServerClient } from "@/lib/supabase/server"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Workflow Audit Prototype",
  description:
    "Extract structured workflow entities from interview transcripts and generate AI recommendations",
}

async function getTranscriptList() {
  try {
    const supabase = createServerClient()
    if (!supabase) return []
    const { data } = await supabase
      .from("transcripts")
      .select("id, role, department, workflow_name, status, metadata")
      .order("created_at", { ascending: true })
    return data || []
  } catch {
    return []
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const transcripts = await getTranscriptList()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex">
        <TooltipProvider>
          <Sidebar transcripts={transcripts} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  )
}
