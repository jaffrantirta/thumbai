import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  return NextResponse.json({ onboardingCompleted: settings?.onboardingCompleted ?? false });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { aiEndpoint, aiKey, aiModel, imageModel } = body;

  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  const data = {
    aiEndpoint: aiEndpoint || "",
    aiKey: aiKey || "",
    aiModel: aiModel || "gpt-4o",
    imageModel: imageModel || "dall-e-3",
    onboardingCompleted: true,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(userSettings).set(data).where(eq(userSettings.userId, session.user.id));
  } else {
    await db.insert(userSettings).values({ userId: session.user.id, ...data });
  }

  return NextResponse.json({ success: true });
}
