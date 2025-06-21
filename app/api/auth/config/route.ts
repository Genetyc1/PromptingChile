import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasGitHub: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error getting auth config:", error)
    return NextResponse.json({ hasGoogle: false, hasGitHub: false })
  }
}
