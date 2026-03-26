import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { dashboardSettings } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await db.select().from(dashboardSettings)
    const result: Record<string, unknown> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[settings GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const userId = session.user.id

    const updated: string[] = []
    for (const [key, value] of Object.entries(body)) {
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
      updated.push(key)
    }

    return NextResponse.json({ updated })
  } catch (error) {
    console.error("[settings PATCH] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
