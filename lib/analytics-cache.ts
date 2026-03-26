import { and, eq, gt } from "drizzle-orm"
import { db } from "@/db"
import { analyticsSnapshots } from "@/db/schema"

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function getCachedReport(
  reportType: string,
  startDate: string,
  endDate: string
): Promise<unknown | null> {
  try {
    const now = new Date()
    const rows = await db
      .select()
      .from(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.reportType, reportType),
          eq(analyticsSnapshots.dateRangeStart, startDate),
          eq(analyticsSnapshots.dateRangeEnd, endDate),
          gt(analyticsSnapshots.expiresAt, now)
        )
      )
      .limit(1)

    if (rows.length === 0) return null

    console.log(`[analytics-cache] Cache hit: ${reportType} ${startDate}→${endDate}`)
    return rows[0].data
  } catch (error) {
    // Cache errors are non-fatal — fall through to live fetch
    console.error("[analytics-cache] getCachedReport error:", error)
    return null
  }
}

export async function setCachedReport(
  reportType: string,
  startDate: string,
  endDate: string,
  data: unknown
): Promise<void> {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS)

    // Upsert: delete existing then insert fresh
    await db
      .delete(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.reportType, reportType),
          eq(analyticsSnapshots.dateRangeStart, startDate),
          eq(analyticsSnapshots.dateRangeEnd, endDate)
        )
      )

    await db.insert(analyticsSnapshots).values({
      reportType,
      dateRangeStart: startDate,
      dateRangeEnd: endDate,
      data: data as never,
      fetchedAt: now,
      expiresAt,
    })

    console.log(`[analytics-cache] Cached: ${reportType} ${startDate}→${endDate} (expires ${expiresAt.toISOString()})`)
  } catch (error) {
    // Cache write errors are non-fatal
    console.error("[analytics-cache] setCachedReport error:", error)
  }
}
