import { Router, type IRouter } from "express";
import { db, researchTable } from "@workspace/db";
import {
  CreateResearchBody,
  GetResearchParams,
  DeleteResearchParams,
  ListResearchResponse,
  CreateResearchResponse,
  GetResearchResponse,
  DeleteResearchResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

const PIPELINE_STEPS = [
  "Topic Analysis",
  "Audience Analysis",
  "Keyword Analysis",
  "Related Questions",
  "Competitor Research",
  "Search Intent",
  "Evergreen Potential",
  "Viral Potential",
  "Content Gap Analysis",
];

function generateResearchData(topic: string) {
  const score = Math.random();
  return {
    status: "completed",
    shouldCreate: score > 0.3,
    reasoning: score > 0.3
      ? `This topic has strong search intent and high evergreen potential. The market shows clear content gaps that you can fill with unique positioning.`
      : `This topic is highly saturated with established channels. Consider a unique angle or sub-niche to differentiate.`,
    topicAnalysis: `"${topic}" targets a growing audience interested in practical knowledge. Search trends show consistent monthly volume with spikes around product launches and seasonal events. The topic sits at the intersection of educational and entertainment content.`,
    audienceAnalysis: `Primary audience: 18-34 year olds with medium-to-high interest in self-improvement and technology. Secondary audience: professionals seeking quick insights. Engagement patterns suggest 8-12 minute videos perform best for this demographic.`,
    keywordAnalysis: `Primary: "${topic}" (45K/month), "${topic} tutorial" (28K/month), "how to ${topic}" (19K/month). Long-tail opportunities: "${topic} for beginners" (8K, low competition), "best ${topic} tips" (6K, medium competition).`,
    relatedQuestions: `"What is the best way to ${topic}?", "How long does ${topic} take?", "Is ${topic} worth it in 2025?", "What tools do I need for ${topic}?", "Common mistakes when doing ${topic}"`,
    competitorResearch: `Top 3 competitors averaging 150K-800K views per video. Most content is 2-3 years old, creating a freshness gap. Key weakness: competitors focus on theory, not practical implementation. Opportunity: actionable, step-by-step format.`,
    searchIntent: `Mixed intent: 60% informational (how-to), 30% commercial (product comparison), 10% navigational. Videos addressing informational intent with commercial hooks perform 3x better in this niche.`,
    evergreenPotential: Math.round((0.5 + Math.random() * 0.5) * 10) / 10,
    viralPotential: Math.round((0.3 + Math.random() * 0.6) * 10) / 10,
    contentGapAnalysis: `Major gap: no comprehensive guide covering the full workflow from start to finish. Quick wins available in: beginner-friendly explainers, advanced technique breakdowns, and tool comparison videos. First-mover advantage available for mobile-focused content.`,
  };
}

router.get("/research", async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
  const rows = await db.select().from(researchTable).orderBy(desc(researchTable.createdAt)).limit(limit);
  res.json(ListResearchResponse.parse(serialize(rows)));
});

router.post("/research", async (req, res): Promise<void> => {
  const parsed = CreateResearchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const researchData = generateResearchData(parsed.data.topic);
  const now = new Date();
  const [row] = await db.insert(researchTable).values({
    topic: parsed.data.topic,
    ...researchData,
    updatedAt: now,
  }).returning();

  res.status(201).json(CreateResearchResponse.parse(serialize(row)));
});

router.get("/research/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetResearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(researchTable).where(eq(researchTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Research not found" });
    return;
  }

  res.json(GetResearchResponse.parse(serialize(row)));
});

router.delete("/research/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteResearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(researchTable).where(eq(researchTable.id, params.data.id));
  res.json(DeleteResearchResponse.parse(serialize({ success: true })));
});

export default router;
