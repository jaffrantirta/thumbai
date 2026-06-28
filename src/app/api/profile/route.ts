import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, thumbnail } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stats] = await db
    .select({ total: count() })
    .from(thumbnail)
    .where(eq(thumbnail.userId, session.user.id));

  return NextResponse.json({
    id:        session.user.id,
    name:      session.user.name,
    email:     session.user.email,
    image:     session.user.image ?? null,
    createdAt: session.user.createdAt,
    thumbnailCount: stats?.total ?? 0,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await db
    .update(user)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}
