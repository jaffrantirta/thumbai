import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumbnail, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { headers } from "next/headers";

function extractJson(text: string): { caption?: string; subtext?: string } {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch { /* ignore */ } }
  return {};
}

function normaliseEndpoint(url: string) {
  return url.replace(/\/+$/, "");
}

async function describeFace(openai: OpenAI, faceBase64: string, model: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: faceBase64, detail: "low" } },
          {
            type: "text",
            text: "Describe this person's appearance for image generation: age range, gender, hairstyle, hair color, facial features, skin tone. 2 sentences max, no names.",
          },
        ],
      }],
      max_tokens: 120,
    });
    return resp.choices[0]?.message?.content?.trim() || "";
  } catch {
    // vision not supported by this model — return empty, fallback to generic person
    return "";
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, ratio, mode, includeSubject, faceBase64, vibe, thumbnailId } = body;

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

  const chatModel = settings.aiModel || "gpt-4o";

  try {
    if (mode === "image-gen") {
      // Build subject clause
      let subjectClause: string;

      if (!includeSubject) {
        subjectClause = "Do NOT include any people, persons, human figures, or faces. Focus on scenery, objects, graphics, or abstract elements only.";
      } else {
        let faceDesc = "";
        if (faceBase64) {
          faceDesc = await describeFace(openai, faceBase64, chatModel);
        }

        const vibeDesc = vibe ? `The overall mood and expression should be: ${vibe}.` : "";

        subjectClause = faceDesc
          ? `Include a person who looks exactly like this: ${faceDesc} ${vibeDesc}`
          : `Include an expressive human subject. ${vibeDesc}`;
      }

      const prompt = [
        `Create a vibrant, eye-catching YouTube thumbnail.`,
        `Video title: "${title}".`,
        description ? `Topic: ${description}.` : "",
        `Aspect ratio: ${ratio}.`,
        subjectClause,
        "High quality, professional, dramatic lighting, bold composition.",
      ].filter(Boolean).join(" ");

      const imageResp = await openai.images.generate({
        model: settings.imageModel || "dall-e-3",
        prompt,
        n: 1,
        size: ratio === "9:16" ? "1024x1792" : ratio === "1:1" ? "1024x1024" : "1792x1024",
      });

      const imageData = imageResp.data?.[0];
      let imageUrl: string | undefined;
      if (imageData?.url) imageUrl = imageData.url;
      else if (imageData?.b64_json) imageUrl = `data:image/png;base64,${imageData.b64_json}`;

      if (!imageUrl) {
        throw new Error("the model returned no image — check your image model name in settings");
      }

      await db.update(thumbnail)
        .set({ imageUrl, prompt, status: "done" })
        .where(eq(thumbnail.id, thumbnailId));

      return NextResponse.json({ imageUrl, mode: "image-gen" });

    } else {
      const chatResp = await openai.chat.completions.create({
        model: chatModel,
        messages: [
          {
            role: "system",
            content: 'You are a YouTube thumbnail copywriter. Given a video title and description, produce a punchy main caption (max 5 words, ALL CAPS) and a short subtext (max 8 words). Reply with ONLY a JSON object, no markdown. Format: {"caption":"...","subtext":"..."}',
          },
          { role: "user", content: `Title: ${title}\nDescription: ${description}` },
        ],
      });

      const raw = chatResp.choices[0]?.message?.content || "{}";
      const parsed = extractJson(raw);
      const aiCaption = parsed.caption || title.toUpperCase().slice(0, 40);
      const aiSubtext = parsed.subtext || description.slice(0, 60);

      await db.update(thumbnail)
        .set({ aiCaption, aiSubtext, status: "done" })
        .where(eq(thumbnail.id, thumbnailId));

      return NextResponse.json({ caption: aiCaption, subtext: aiSubtext, mode: "template" });
    }

  } catch (err: unknown) {
    let message = "generation failed";
    if (err instanceof Error) {
      const apiErr = err as Error & { status?: number };
      message = apiErr.status ? `api error ${apiErr.status}: ${err.message}` : err.message;
    }
    await db.update(thumbnail).set({ status: "failed" }).where(eq(thumbnail.id, thumbnailId));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
