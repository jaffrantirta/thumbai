import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumbnail } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thumbnails = await db.query.thumbnail.findMany({
    where: eq(thumbnail.userId, session.user.id),
    orderBy: [desc(thumbnail.createdAt)],
  });

  return NextResponse.json(thumbnails);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, ratio, primaryColor, template, mode } = body;

  const [created] = await db
    .insert(thumbnail)
    .values({
      userId: session.user.id,
      title,
      description,
      ratio,
      primaryColor,
      template,
      mode,
      status: "generating",
    })
    .returning();

  return NextResponse.json(created);
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db
    .delete(thumbnail)
    .where(eq(thumbnail.id, id));

  return NextResponse.json({ success: true });
}
