// This route has been split into /api/process/extract and /api/process/recommend
// to avoid Vercel's 60-second function timeout on hobby plan.
// Each sub-route handles one Claude API call.

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/process/extract and /api/process/recommend instead" },
    { status: 410 }
  )
}
