import { NextResponse } from "next/server"
import { runGA4Report } from "@/lib/ga4-client"

export async function GET() {
  try {
    // Fetch traffic from email campaigns using UTM parameters
    // This assumes email campaigns are tagged with utm_medium=email
    const report = await runGA4Report(
      ["sessionCampaignName"],
      ["sessions", "activeUsers", "averageSessionDuration"],
      [{ startDate: "30daysAgo", endDate: "today" }],
      [{ metric: { metricName: "sessions" }, desc: true }],
      {
        filter: {
          fieldName: "sessionMedium",
          stringFilter: {
            matchType: "EXACT",
            value: "email",
          },
        },
      },
    )

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const campaigns =
      report.rows?.slice(0, 10).map((row) => {
        const name = row.dimensionValues?.[0]?.value || "Untitled Campaign"
        const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
        const visitors = Number.parseInt(row.metricValues?.[1]?.value || "0")
        const avgEngagement = Number.parseFloat(row.metricValues?.[2]?.value || "0")

        return {
          name,
          sessions,
          visitors,
          avgEngagement: formatDuration(avgEngagement),
        }
      }) || []

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("[v0] Error fetching email traffic:", error)
    return NextResponse.json([], { status: 200 })
  }
}
