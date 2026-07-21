import { Router, type IRouter } from "express";
import { db, automationJobsTable, automationLogsTable } from "@workspace/db";
import {
  CreateAutomationJobBody,
  UpdateAutomationJobBody,
  GetAutomationJobParams,
  UpdateAutomationJobParams,
  DeleteAutomationJobParams,
  ListAutomationJobsResponse,
  CreateAutomationJobResponse,
  GetAutomationJobResponse,
  UpdateAutomationJobResponse,
  DeleteAutomationJobResponse,
  GetAutomationLogsResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/automation/jobs", async (req, res): Promise<void> => {
  let rows = await db.select().from(automationJobsTable).orderBy(desc(automationJobsTable.createdAt));
  if (req.query.type) rows = rows.filter(r => r.type === String(req.query.type));
  if (req.query.status) rows = rows.filter(r => r.status === String(req.query.status));
  res.json(ListAutomationJobsResponse.parse(serialize(rows)));
});

router.post("/automation/jobs", async (req, res): Promise<void> => {
  const parsed = CreateAutomationJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const nextRun = new Date();
  nextRun.setHours(nextRun.getHours() + (parsed.data.frequency === "hourly" ? 1 : parsed.data.frequency === "daily" ? 24 : 168));

  const [row] = await db.insert(automationJobsTable).values({
    name: parsed.data.name,
    type: parsed.data.type,
    frequency: parsed.data.frequency,
    config: parsed.data.config ?? null,
    status: "active",
    nextRun,
  }).returning();

  res.status(201).json(CreateAutomationJobResponse.parse(serialize(row)));
});

router.get("/automation/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAutomationJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(automationJobsTable).where(eq(automationJobsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetAutomationJobResponse.parse(serialize(row)));
});

router.patch("/automation/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateAutomationJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAutomationJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.update(automationJobsTable).set(parsed.data)
    .where(eq(automationJobsTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateAutomationJobResponse.parse(serialize(row)));
});

router.delete("/automation/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteAutomationJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(automationJobsTable).where(eq(automationJobsTable.id, params.data.id));
  res.json(DeleteAutomationJobResponse.parse(serialize({ success: true })));
});

router.get("/automation/logs", async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
  const rows = await db.select().from(automationLogsTable).orderBy(desc(automationLogsTable.createdAt)).limit(limit);
  res.json(GetAutomationLogsResponse.parse(serialize(rows)));
});

export default router;
