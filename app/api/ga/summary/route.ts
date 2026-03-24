import { type NextRequest, NextResponse } from "next/server"
import { runGA4Report } from "@/lib/ga4-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get("endDate") || "today"
    const startDate = searchParams.get("startDate") || "30daysAgo"

    console.log("[v0] Fetching GA4 summary data with date range:", startDate, "to", endDate)

    // Calculate the number of days in the selected range
    const calculateDaysDiff = (start: string, end: string) => {
      if (start.includes("daysAgo")) {
        return Number.parseInt(start.replace("daysAgo", ""))
      }
      const startDateObj = new Date(start)
      const endDateObj = end === "today" ? new Date() : new Date(end)
      return Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))
    }

    const daysDiff = calculateDaysDiff(startDate, endDate)

    // Calculate previous period for comparison
    const previousStartDate = startDate.includes("daysAgo")
      ? `${daysDiff * 2}daysAgo`
      : new Date(new Date(startDate).getTime() - daysDiff * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const previousEndDate = startDate.includes("daysAgo")
      ? `${daysDiff + 1}daysAgo`
      : new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Fetch current period metrics
    const currentReport = await runGA4Report(
      [],
      ["activeUsers", "sessions", "averageSessionDuration", "bounceRate"],
      [{ startDate, endDate }],
    )

    console.log("[v0] Current period data received")

    // Fetch previous period metrics for comparison
    const previousReport = await runGA4Report(
      [],
      ["activeUsers", "sessions", "averageSessionDuration", "bounceRate"],
      [{ startDate: previousStartDate, endDate: previousEndDate }],
    )

    console.log("[v0] Previous period data received")

    const currentMetrics = currentReport.rows?.[0]?.metricValues
    const previousMetrics = previousReport.rows?.[0]?.metricValues

    if (!currentMetrics || !previousMetrics) {
      console.warn("[v0] No metrics data returned from GA4")
      throw new Error("No data returned from GA4")
    }

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    const currentUsers = Number.parseInt(currentMetrics[0]?.value || "0")
    const previousUsers = Number.parseInt(previousMetrics[0]?.value || "0")

    const currentSessions = Number.parseInt(currentMetrics[1]?.value || "0")
    const previousSessions = Number.parseInt(previousMetrics[1]?.value || "0")

    const currentAvgTime = Number.parseFloat(currentMetrics[2]?.value || "0")
    const previousAvgTime = Number.parseFloat(previousMetrics[2]?.value || "0")

    const currentBounce = Number.parseFloat(currentMetrics[3]?.value || "0") * 100
    const previousBounce = Number.parseFloat(previousMetrics[3]?.value || "0") * 100

    // Format average session duration to MM:SS
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const summary = {
      totalVisitors: currentUsers,
      totalSessions: currentSessions,
      avgTime: formatDuration(currentAvgTime),
      bounceRate: `${currentBounce.toFixed(1)}%`,
      visitorChange: calculateChange(currentUsers, previousUsers),
      sessionChange: calculateChange(currentSessions, previousSessions),
      avgTimeChange: calculateChange(currentAvgTime, previousAvgTime),
      bounceChange: calculateChange(currentBounce, previousBounce),
    }

    console.log("[v0] Summary calculated:", summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Error fetching GA4 summary:", error)
    return NextResponse.json(
      {
        totalVisitors: 0,
        totalSessions: 0,
        avgTime: "0:00",
        bounceRate: "0%",
        visitorChange: 0,
        sessionChange: 0,
        avgTimeChange: 0,
        bounceChange: 0,
        error: error instanceof Error ? error.message : "Failed to fetch GA4 data",
      },
      { status: 200 },
    )
  }
}
