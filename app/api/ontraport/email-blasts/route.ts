import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/db"
import { campaignMetrics } from "@/db/schema"

export async function GET() {
  try {
    const campaigns = await db
      .select({
        id: campaignMetrics.id,
        subject: campaignMetrics.subject,
        sendDate: campaignMetrics.sendDate,
        totalSent: campaignMetrics.totalSent,
        openRate: campaignMetrics.openRate,
        clickRate: campaignMetrics.clickRate,
        campaignName: campaignMetrics.campaignName,
        listName: campaignMetrics.listName,
      })
      .from(campaignMetrics)
      .orderBy(desc(campaignMetrics.sendDate))
      .limit(50)

    const blasts = campaigns.map((c) => ({
      id: c.id,
      subject: c.subject ?? c.campaignName,
      sendDate: c.sendDate
        ? new Date(c.sendDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Unknown",
      totalSent: c.totalSent,
      openRate: c.openRate ? `${Number(c.openRate).toFixed(1)}%` : "0%",
      clickRate: c.clickRate ? `${Number(c.clickRate).toFixed(1)}%` : "0%",
    }))

    return NextResponse.json(blasts)
  } catch (error) {
    console.error("[email-blasts] Error querying campaign_metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    )
  }
}
