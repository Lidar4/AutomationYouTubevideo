import { Router, type IRouter } from "express";
import { db, apiSettingsTable } from "@workspace/db";
import {
  UpsertApiSettingBody,
  ListApiSettingsResponse,
  UpsertApiSettingResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

const DEFAULT_PROVIDERS = [
  { provider: "openai", label: "OpenAI", description: "GPT-4 and DALL-E for content generation" },
  { provider: "youtube", label: "YouTube Data API", description: "Upload videos and manage your channel" },
  { provider: "youtube_analytics", label: "YouTube Analytics", description: "Access detailed analytics data" },
  { provider: "google_oauth", label: "Google OAuth", description: "Authentication with Google account" },
  { provider: "elevenlabs", label: "ElevenLabs", description: "Text-to-speech voice generation" },
  { provider: "runway", label: "Runway ML", description: "AI video generation" },
  { provider: "luma", label: "Luma AI", description: "3D and video AI generation" },
  { provider: "google_veo", label: "Google Veo", description: "Google's video generation model" },
  { provider: "image_generation", label: "Image Generation", description: "AI-powered thumbnail and scene images" },
];

async function ensureDefaultSettings() {
  const existing = await db.select().from(apiSettingsTable);
  const existingProviders = new Set(existing.map(e => e.provider));

  const toInsert = DEFAULT_PROVIDERS.filter(p => !existingProviders.has(p.provider));
  if (toInsert.length > 0) {
    await db.insert(apiSettingsTable).values(
      toInsert.map(p => ({ ...p, isConfigured: 0, updatedAt: new Date() }))
    );
  }
}

router.get("/api-settings", async (_req, res): Promise<void> => {
  await ensureDefaultSettings();
  const rows = await db.select().from(apiSettingsTable);
  res.json(ListApiSettingsResponse.parse(serialize(rows.map(r => ({ ...r, isConfigured: r.isConfigured === 1 })))));
});

router.put("/api-settings/:provider", async (req, res): Promise<void> => {
  const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;

  const parsed = UpsertApiSettingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(apiSettingsTable).where(eq(apiSettingsTable.provider, provider));

  if (existing) {
    const [row] = await db.update(apiSettingsTable).set({
      apiKey: parsed.data.apiKey,
      isConfigured: parsed.data.apiKey ? 1 : 0,
      updatedAt: new Date(),
    }).where(eq(apiSettingsTable.provider, provider)).returning();

    res.json(UpsertApiSettingResponse.parse(serialize({ ...row, isConfigured: row.isConfigured === 1 })));
  } else {
    const providerInfo = DEFAULT_PROVIDERS.find(p => p.provider === provider);
    const [row] = await db.insert(apiSettingsTable).values({
      provider,
      label: providerInfo?.label ?? provider,
      description: providerInfo?.description ?? null,
      apiKey: parsed.data.apiKey,
      isConfigured: parsed.data.apiKey ? 1 : 0,
      updatedAt: new Date(),
    }).returning();

    res.json(UpsertApiSettingResponse.parse(serialize({ ...row, isConfigured: row.isConfigured === 1 })));
  }
});

export default router;
