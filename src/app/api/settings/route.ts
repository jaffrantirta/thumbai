import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  if (!settings) {
    return NextResponse.json({ aiEndpoint: "", aiKey: "", aiModel: "gpt-4o", imageModel: "dall-e-3" });
  }

  return NextResponse.json({
    aiEndpoint: settings.aiEndpoint || "",
    aiKey: settings.aiKey ? "••••••••" + settings.aiKey.slice(-4) : "",
    aiModel: settings.aiModel || "gpt-4o",
    imageModel: settings.imageModel || "dall-e-3",
    hasKey: !!settings.aiKey,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { aiEndpoint, aiKey, aiModel, imageModel } = body;

  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  const updateData: {
    aiEndpoint: string;
    aiModel: string;
    imageModel: string;
    updatedAt: Date;
    aiKey?: string;
  } = {
    aiEndpoint: aiEndpoint || "",
    aiModel: aiModel || "gpt-4o",
    imageModel: imageModel || "dall-e-3",
    updatedAt: new Date(),
  };

  if (aiKey && !aiKey.startsWith("••••")) {
    updateData.aiKey = aiKey;
  }

  if (existing) {
    await db.update(userSettings).set(updateData).where(eq(userSettings.userId, session.user.id));
  } else {
    await db.insert(userSettings).values({
      userId: session.user.id,
      ...updateData,
    });
  }

  return NextResponse.json({ success: true });
}
