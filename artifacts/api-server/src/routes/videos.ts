import { Router, type IRouter } from "express";
import { db, videosTable } from "@workspace/db";
import {
  CreateVideoBody,
  UpdateVideoBody,
  GetVideoParams,
  UpdateVideoParams,
  DeleteVideoParams,
  ListVideosResponse,
  CreateVideoResponse,
  GetVideoResponse,
  UpdateVideoResponse,
  DeleteVideoResponse,
} from "@workspace/api-zod";
import { eq, desc, and } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/videos", async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

  let rows;
  if (req.query.type || req.query.status) {
    rows = await db.select().from(videosTable)
      .orderBy(desc(videosTable.createdAt)).limit(limit);
    if (req.query.type) rows = rows.filter(v => v.type === String(req.query.type));
    if (req.query.status) rows = rows.filter(v => v.status === String(req.query.status));
  } else {
    rows = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt)).limit(limit);
  }

  res.json(ListVideosResponse.parse(serialize(rows)));
});

router.post("/videos", async (req, res): Promise<void> => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(videosTable).values({
    title: parsed.data.title,
    type: parsed.data.type,
    contentId: parsed.data.contentId ?? null,
  }).returning();

  res.status(201).json(CreateVideoResponse.parse(serialize(row)));
});

router.get("/videos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetVideoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(videosTable).where(eq(videosTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  res.json(GetVideoResponse.parse(serialize(row)));
});

router.patch("/videos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateVideoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.update(videosTable).set(parsed.data)
    .where(eq(videosTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  res.json(UpdateVideoResponse.parse(serialize(row)));
});

router.delete("/videos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteVideoParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(videosTable).where(eq(videosTable.id, params.data.id));
  res.json(DeleteVideoResponse.parse(serialize({ success: true })));
});

export default router;
