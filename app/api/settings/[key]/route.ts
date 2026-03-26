import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { dashboardSettings } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { key } = await params
    const result = await db
      .select()
      .from(dashboardSettings)
      .where(eq(dashboardSettings.key, key))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 })
    }

    return NextResponse.json({ key: result[0].key, value: result[0].value })
  } catch (error) {
    console.error("[settings/[key] GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { key } = await params
    const { value } = await request.json()
    const userId = session.user.id

    const existing = await db
      .select({ id: dashboardSettings.id })
      .from(dashboardSettings)
      .where(eq(dashboardSettings.key, key))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(dashboardSettings)
        .set({ value: value as never, updatedBy: userId, updatedAt: new Date() })
        .where(eq(dashboardSettings.key, key))
    } else {
      await db.insert(dashboardSettings).values({
        key,
        value: value as never,
        updatedBy: userId,
      })
    }

    return NextResponse.json({ key, value })
  } catch (error) {
    console.error("[settings/[key] PUT] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
