import { NextResponse, type NextRequest } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/db"
import { campaignMetrics } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await db
      .select()
      .from(campaignMetrics)
      .orderBy(desc(campaignMetrics.sendDate))

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("[admin/campaigns GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      campaignName,
      subject,
      sendDate,
      totalSent = 0,
      totalDelivered = 0,
      totalOpened = 0,
      totalClicked = 0,
      totalBounced = 0,
      totalUnsubscribed = 0,
      listName,
      externalId,
      tags,
      rawData,
    } = body

    if (!campaignName) {
      return NextResponse.json({ error: "campaignName is required" }, { status: 400 })
    }

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : "0"
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : "0"
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(2) : "0"

    const [campaign] = await db
      .insert(campaignMetrics)
      .values({
        campaignName,
        subject: subject ?? null,
        sendDate: sendDate ? new Date(sendDate) : null,
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        totalUnsubscribed,
        openRate,
        clickRate,
        bounceRate,
        listName: listName ?? null,
        externalId: externalId ?? null,
        tags: tags ?? null,
        rawData: rawData ?? null,
      })
      .returning()

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("[admin/campaigns POST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
