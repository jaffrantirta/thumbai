import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumbnail, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { headers } from "next/headers";

function extractJson(text: string): { caption?: string; subtext?: string } {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
  }
  return {};
}

function normaliseEndpoint(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, ratio, mode, includeSubject, thumbnailId } = body;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  if (!settings?.aiKey || !settings?.aiEndpoint) {
    return NextResponse.json(
      { error: "ai key not configured — go to settings first" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({
    apiKey: settings.aiKey,
    baseURL: normaliseEndpoint(settings.aiEndpoint),
  });

  try {
    if (mode === "image-gen") {
      const subjectClause = includeSubject === false
        ? "Do NOT include any people, persons, human figures, or faces. Focus on scenery, objects, graphics, or abstract elements only."
        : "May include a expressive human subject if it fits the theme.";

      const prompt = `Create a YouTube thumbnail for a video titled "${title}".${description ? ` About: ${description}.` : ""} Style: vibrant, eye-catching, professional. Aspect ratio: ${ratio}. ${subjectClause}`;

      const imageResp = await openai.images.generate({
        model: settings.imageModel || "dall-e-3",
        prompt,
        n: 1,
        size: ratio === "9:16" ? "1024x1792" : ratio === "1:1" ? "1024x1024" : "1792x1024",
      });

      const imageData = imageResp.data?.[0];

      // Handle both url (default) and b64_json response formats
      let imageUrl: string | undefined;
      if (imageData?.url) {
        imageUrl = imageData.url;
      } else if (imageData?.b64_json) {
        imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      }

      if (!imageUrl) {
        throw new Error(
          "the model returned no image — check that your image model name is correct in settings"
        );
      }

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
              'You are a YouTube thumbnail copywriter. Given a video title and description, produce a punchy main caption (max 5 words, ALL CAPS) and a short subtext (max 8 words). Reply with ONLY a JSON object, no markdown. Format: {"caption":"...","subtext":"..."}',
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
      const apiErr = err as Error & { status?: number };
      message = apiErr.status
        ? `api error ${apiErr.status}: ${err.message}`
        : err.message;
    }

    await db
      .update(thumbnail)
      .set({ status: "failed" })
      .where(eq(thumbnail.id, thumbnailId));

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
