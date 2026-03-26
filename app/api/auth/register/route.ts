import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Only authenticated admins can create new users
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role = "viewer" } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!["admin", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, name: name || null, role })
      .returning({ id: users.id, email: users.email, name: users.name, role: users.role })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("[auth/register] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
