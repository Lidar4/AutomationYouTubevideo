import { Router, type IRouter } from "express";
import { db, draftsTable, schedulesTable } from "@workspace/db";
import {
  CreateDraftBody,
  UpdateDraftBody,
  UpdateDraftParams,
  DeleteDraftParams,
  CreateScheduleBody,
  UpdateScheduleBody,
  UpdateScheduleParams,
  DeleteScheduleParams,
  ListDraftsResponse,
  CreateDraftResponse,
  UpdateDraftResponse,
  DeleteDraftResponse,
  ListSchedulesResponse,
  CreateScheduleResponse,
  UpdateScheduleResponse,
  DeleteScheduleResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

// Drafts
router.get("/drafts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(draftsTable).orderBy(desc(draftsTable.updatedAt));
  res.json(ListDraftsResponse.parse(serialize(rows)));
});

router.post("/drafts", async (req, res): Promise<void> => {
  const parsed = CreateDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const [row] = await db.insert(draftsTable).values({
    title: parsed.data.title,
    type: parsed.data.type,
    notes: parsed.data.notes ?? null,
    contentId: parsed.data.contentId ?? null,
    updatedAt: now,
  }).returning();

  res.status(201).json(CreateDraftResponse.parse(serialize(row)));
});

router.patch("/drafts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateDraftParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.update(draftsTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(draftsTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Draft not found" });
    return;
  }

  res.json(UpdateDraftResponse.parse(serialize(row)));
});

router.delete("/drafts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteDraftParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(draftsTable).where(eq(draftsTable.id, params.data.id));
  res.json(DeleteDraftResponse.parse(serialize({ success: true })));
});

// Schedules
router.get("/schedules", async (_req, res): Promise<void> => {
  const rows = await db.select().from(schedulesTable).orderBy(schedulesTable.scheduledAt);
  res.json(ListSchedulesResponse.parse(serialize(rows)));
});

router.post("/schedules", async (req, res): Promise<void> => {
  const parsed = CreateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(schedulesTable).values({
    title: parsed.data.title,
    scheduledAt: new Date(parsed.data.scheduledAt),
    videoId: parsed.data.videoId ?? null,
    contentId: parsed.data.contentId ?? null,
    platform: parsed.data.platform,
    status: "scheduled",
  }).returning();

  res.status(201).json(CreateScheduleResponse.parse(serialize(row)));
});

router.patch("/schedules/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateScheduleParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.scheduledAt) {
    updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  }

  const [row] = await db.update(schedulesTable).set(updateData)
    .where(eq(schedulesTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.json(UpdateScheduleResponse.parse(serialize(row)));
});

router.delete("/schedules/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteScheduleParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(schedulesTable).where(eq(schedulesTable.id, params.data.id));
  res.json(DeleteScheduleResponse.parse(serialize({ success: true })));
});

export default router;
