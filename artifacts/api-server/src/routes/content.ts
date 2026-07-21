import { Router, type IRouter } from "express";
import { db, contentTable } from "@workspace/db";
import {
  CreateContentBody,
  UpdateContentBody,
  GetContentParams,
  UpdateContentParams,
  DeleteContentParams,
  ListContentResponse,
  CreateContentResponse,
  GetContentResponse,
  UpdateContentResponse,
  DeleteContentResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

function generateContent(topic: string, type: string) {
  const videoType = type === "short" ? "Short" : "Long Video";
  return {
    title: `${topic}: Complete Guide for 2025`,
    hook: `What if I told you that most people are completely wrong about ${topic}? In the next ${type === "short" ? "60 seconds" : "10 minutes"}, I'll show you exactly what works and what doesn't.`,
    outline: `1. Introduction (0:00-0:30)\n2. The Problem with Current Approaches (0:30-2:00)\n3. The Solution - Step by Step (2:00-6:00)\n4. Common Mistakes to Avoid (6:00-8:00)\n5. Pro Tips & Advanced Strategies (8:00-9:30)\n6. Call to Action (9:30-10:00)`,
    storyFlow: `Open with a bold claim that challenges conventional wisdom. → Validate the viewer's frustration with current approaches. → Position yourself as someone who found the real solution. → Deliver concrete, actionable steps. → Show the transformation possible. → Close with urgency and clear next step.`,
    script: `[HOOK]\nHey, before you click away - in the next ${type === "short" ? "minute" : "few minutes"} I'm going to show you something about ${topic} that most creators get completely wrong.\n\n[MAIN CONTENT]\nHere's the thing nobody tells you about ${topic}...\n\nStep 1: [Action step with specific detail]\nStep 2: [Action step with specific detail]\nStep 3: [Action step with specific detail]\n\n[CLOSE]\nIf you found this valuable, hit subscribe because I'm posting new content every week to help you grow faster.`,
    cta: `Like this video if it helped you, subscribe for weekly ${topic} tips, and comment below with your biggest challenge - I read every reply.`,
    description: `In this video, I break down everything you need to know about ${topic}. Whether you're a complete beginner or looking to level up, this step-by-step guide will transform your approach.\n\n⏱️ TIMESTAMPS:\n0:00 - Introduction\n1:30 - The Core Problem\n3:00 - Step-by-Step Solution\n7:00 - Common Mistakes\n9:00 - Pro Tips\n\n🔔 Subscribe for weekly content\n\n#${topic.replace(/\s+/g, '')} #Tutorial #Guide`,
    seoTitle: `${topic}: Complete Step-by-Step Guide (2025) | Everything You Need to Know`,
    tags: `${topic}, ${topic} tutorial, ${topic} for beginners, how to ${topic}, ${topic} tips, ${topic} guide, ${topic} 2025`,
    hashtags: `#${topic.replace(/\s+/g, '')} #Tutorial #HowTo #Tips #${videoType.replace(/\s+/g, '')}`,
    thumbnailPrompt: `Bold text "${topic.toUpperCase()}" on dark background. Person pointing at screen with shocked/excited expression. Red arrow highlighting key element. High contrast, YouTube-optimized thumbnail.`,
    imagePrompt: `Professional content creator at desk with multiple monitors showing ${topic} dashboard. Modern, sleek workspace. Dramatic lighting. Photorealistic. 16:9 ratio.`,
    scenePrompt: `Scene 1: Tight shot of hands typing on keyboard. Scene 2: Screen recording of ${topic} process. Scene 3: Talking head shot with clean background. Scene 4: B-roll of results/outcomes. Scene 5: Outro card with subscribe animation.`,
  };
}

router.get("/content", async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
  const rows = await db.select().from(contentTable).orderBy(desc(contentTable.createdAt)).limit(limit);
  res.json(ListContentResponse.parse(serialize(rows)));
});

router.post("/content", async (req, res): Promise<void> => {
  const parsed = CreateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const generated = generateContent(parsed.data.topic, parsed.data.type);
  const now = new Date();
  const [row] = await db.insert(contentTable).values({
    topic: parsed.data.topic,
    type: parsed.data.type,
    researchId: parsed.data.researchId ?? null,
    ...generated,
    status: "ready",
    updatedAt: now,
  }).returning();

  res.status(201).json(CreateContentResponse.parse(serialize(row)));
});

router.get("/content/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(contentTable).where(eq(contentTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  res.json(GetContentResponse.parse(serialize(row)));
});

router.patch("/content/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateContentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.update(contentTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(contentTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  res.json(UpdateContentResponse.parse(serialize(row)));
});

router.delete("/content/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteContentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(contentTable).where(eq(contentTable.id, params.data.id));
  res.json(DeleteContentResponse.parse(serialize({ success: true })));
});

export default router;
