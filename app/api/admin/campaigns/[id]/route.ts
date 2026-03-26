import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { campaignMetrics } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await db
      .select()
      .from(campaignMetrics)
      .where(eq(campaignMetrics.id, id))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[admin/campaigns/[id] GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await db
      .select({ id: campaignMetrics.id })
      .from(campaignMetrics)
      .where(eq(campaignMetrics.id, id))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Recalculate rates if counts are updated
    const updates: Partial<typeof body> = { ...body, updatedAt: new Date() }
    if (body.totalSent !== undefined) {
      const sent = body.totalSent
      const opened = body.totalOpened ?? 0
      const clicked = body.totalClicked ?? 0
      const bounced = body.totalBounced ?? 0
      if (sent > 0) {
        updates.openRate = ((opened / sent) * 100).toFixed(2)
        updates.clickRate = ((clicked / sent) * 100).toFixed(2)
        updates.bounceRate = ((bounced / sent) * 100).toFixed(2)
      }
    }

    const [updated] = await db
      .update(campaignMetrics)
      .set(updates)
      .where(eq(campaignMetrics.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[admin/campaigns/[id] PATCH] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await db
      .delete(campaignMetrics)
      .where(eq(campaignMetrics.id, id))
      .returning({ id: campaignMetrics.id })

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ deleted: deleted[0].id })
  } catch (error) {
    console.error("[admin/campaigns/[id] DELETE] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
