import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumbnail, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { headers } from "next/headers";

function extractJson(text: string): { caption?: string; subtext?: string } {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Extract JSON object from fenced code block or raw text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // ignore
      }
    }
  }
  return {};
}

function normaliseEndpoint(url: string): string {
  // Remove trailing slash so SDK can append paths correctly
  return url.replace(/\/+$/, "");
}

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
      { error: "ai key not configured — go to settings to add your endpoint and key" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({
    apiKey: settings.aiKey,
    baseURL: normaliseEndpoint(settings.aiEndpoint),
  });

  try {
    if (mode === "image-gen") {
      const prompt = `Create a YouTube thumbnail for a video titled "${title}".${description ? ` Video is about: ${description}.` : ""} Style: vibrant, eye-catching, professional. Primary color: ${primaryColor}. Aspect ratio: ${ratio}. No text overlay needed.`;

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
      // Template + AI mode — do NOT use response_format (not universally supported)
      const chatResp = await openai.chat.completions.create({
        model: settings.aiModel || "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              'You are a YouTube thumbnail copywriter. Given a video title and description, produce a punchy main caption (max 5 words, ALL CAPS) and a short subtext (max 8 words). Reply with ONLY a JSON object, no markdown, no explanation. Format: {"caption":"...","subtext":"..."}',
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
      });

      const raw = chatResp.choices[0]?.message?.content || "{}";
      const parsed = extractJson(raw);

      const aiCaption = parsed.caption || title.toUpperCase().slice(0, 40);
      const aiSubtext = parsed.subtext || description.slice(0, 60);

      await db
        .update(thumbnail)
        .set({ aiCaption, aiSubtext, status: "done" })
        .where(eq(thumbnail.id, thumbnailId));

      return NextResponse.json({ caption: aiCaption, subtext: aiSubtext, mode: "template" });
    }
  } catch (err: unknown) {
    let message = "generation failed";
    if (err instanceof Error) {
      // Surface the real status code if it's an OpenAI API error
      const anyErr = err as Error & { status?: number; code?: string };
      if (anyErr.status) {
        message = `api error ${anyErr.status}: ${err.message}`;
      } else {
        message = err.message;
      }
    }

    await db
      .update(thumbnail)
      .set({ status: "failed" })
      .where(eq(thumbnail.id, thumbnailId));

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
