import { type NextRequest, NextResponse } from "next/server"
import { runGA4Report } from "@/lib/ga4-client"
import { getCachedReport, setCachedReport } from "@/lib/analytics-cache"

export async function GET(request: NextRequest) {
  try {
    // Check for placeholder credentials first
    if (!process.env.GA4_PROPERTY_ID || 
        !process.env.GA4_CLIENT_EMAIL || 
        !process.env.GA4_PRIVATE_KEY ||
        process.env.GA4_CLIENT_EMAIL.includes('placeholder') || 
        process.env.GA4_PRIVATE_KEY.includes('placeholder')) {
      return NextResponse.json({
        labels: [],
        data: [],
        error: "GA4 credentials not configured"
      }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    console.log("[v0] Fetching monthly visitors data from GA4 with date range:", startDate, "to", endDate)

    const cached = await getCachedReport("monthly_visitors", startDate, endDate)
    if (cached) return NextResponse.json(cached)

    // Fetch visitor data from GA4 with custom date range
    const report = await runGA4Report(
      ["date"],
      ["activeUsers"],
      [{ startDate, endDate }],
      [{ dimension: { dimensionName: "date" }, desc: false }],
    )

    console.log("[v0] GA4 report received, processing data...")
    console.log("[v0] Number of rows returned:", report.rows?.length || 0)

    const labels: string[] = []
    const data: number[] = []

    report.rows?.forEach((row) => {
      const dateStr = row.dimensionValues?.[0]?.value
      const visitors = Number.parseInt(row.metricValues?.[0]?.value || "0")

      if (dateStr) {
        // Convert GA4 date format (YYYYMMDD) to readable format
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        const date = new Date(`${year}-${month}-${day}`)

        labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
        data.push(visitors)
      }
    })

    console.log("[v0] Processed data points:", data.length)
    console.log("[v0] Sample data:", { labels: labels.slice(0, 3), data: data.slice(0, 3) })

    const result = { labels, data }
    await setCachedReport("monthly_visitors", startDate, endDate, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching GA4 monthly visitors:", error)
    return NextResponse.json(
      {
        labels: [],
        data: [],
        error: error instanceof Error ? error.message : "Failed to fetch GA4 data",
      },
      { status: 200 },
    )
  }
}
