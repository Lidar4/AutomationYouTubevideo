import { Router, type IRouter } from "express";
import { db, pipelineTable } from "@workspace/db";
import {
  CreatePipelineJobBody,
  UpdatePipelineJobBody,
  GetPipelineJobParams,
  UpdatePipelineJobParams,
  ListPipelineResponse,
  CreatePipelineJobResponse,
  GetPipelineJobResponse,
  UpdatePipelineJobResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

const PIPELINE_STEPS = [
  "topic", "research", "script", "voice",
  "scene_plan", "image_generation", "video_generation",
  "subtitle", "thumbnail", "seo", "review", "publish"
];

router.get("/pipeline", async (req, res): Promise<void> => {
  let rows = await db.select().from(pipelineTable).orderBy(desc(pipelineTable.createdAt));
  if (req.query.status) {
    rows = rows.filter(r => r.status === String(req.query.status));
  }
  res.json(ListPipelineResponse.parse(serialize(rows)));
});

router.post("/pipeline", async (req, res): Promise<void> => {
  const parsed = CreatePipelineJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stepsData = PIPELINE_STEPS.map((step, i) => ({
    key: step,
    label: step.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    status: i === 0 ? "active" : "pending",
  }));

  const now = new Date();
  const [row] = await db.insert(pipelineTable).values({
    topic: parsed.data.topic,
    currentStep: PIPELINE_STEPS[0],
    status: "running",
    progress: 8,
    steps: JSON.stringify(stepsData),
    updatedAt: now,
  }).returning();

  res.status(201).json(CreatePipelineJobResponse.parse(serialize(row)));
});

router.get("/pipeline/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPipelineJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(pipelineTable).where(eq(pipelineTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Pipeline job not found" });
    return;
  }

  res.json(GetPipelineJobResponse.parse(serialize(row)));
});

router.patch("/pipeline/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePipelineJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePipelineJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.update(pipelineTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(pipelineTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Pipeline job not found" });
    return;
  }

  res.json(UpdatePipelineJobResponse.parse(serialize(row)));
});

export default router;
