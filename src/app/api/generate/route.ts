import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumbnail, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, ratio, primaryColor, template, mode, thumbnailId } = body;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  if (!settings?.aiKey || !settings?.aiEndpoint) {
    return NextResponse.json(
      { error: "AI key not configured. Go to Settings to add your AI endpoint and key." },
      { status: 400 }
    );
  }

  const openai = new OpenAI({
    apiKey: settings.aiKey,
    baseURL: settings.aiEndpoint,
  });

  try {
    if (mode === "image-gen") {
      const prompt = `Create a YouTube thumbnail for a video titled "${title}". ${description ? `Video is about: ${description}.` : ""} Style: vibrant, eye-catching, professional. Primary color: ${primaryColor}. Aspect ratio: ${ratio}. No text overlay.`;

      const imageResp = await openai.images.generate({
        model: settings.imageModel || "dall-e-3",
        prompt,
        n: 1,
        size: ratio === "9:16" ? "1024x1792" : ratio === "1:1" ? "1024x1024" : "1792x1024",
      });

      const imageUrl = imageResp.data?.[0]?.url;

      await db
        .update(thumbnail)
        .set({ imageUrl, prompt, status: "done" })
        .where(eq(thumbnail.id, thumbnailId));

      return NextResponse.json({ imageUrl, mode: "image-gen" });
    } else {
      const chatResp = await openai.chat.completions.create({
        model: settings.aiModel || "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a YouTube thumbnail copywriter. Given a video title and description, produce a punchy main caption (max 5 words, ALL CAPS) and a short subtext (max 8 words). Return JSON: {caption: string, subtext: string}",
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = chatResp.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content) as { caption?: string; subtext?: string };

      await db
        .update(thumbnail)
        .set({
          aiCaption: parsed.caption || title.toUpperCase(),
          aiSubtext: parsed.subtext || description,
          status: "done",
        })
        .where(eq(thumbnail.id, thumbnailId));

      return NextResponse.json({
        caption: parsed.caption || title.toUpperCase(),
        subtext: parsed.subtext || description,
        mode: "template",
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await db
      .update(thumbnail)
      .set({ status: "failed" })
      .where(eq(thumbnail.id, thumbnailId));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
