import { Router, type IRouter } from "express";
import { db, channelTable, competitorsTable, keywordsTable, videosTable } from "@workspace/db";
import {
  AddCompetitorBody,
  TrackKeywordBody,
  GetYoutubeAnalyticsQueryParams,
  GetChannelInfoResponse,
  GetYoutubeAnalyticsResponse,
  ListCompetitorsResponse,
  AddCompetitorResponse,
  RemoveCompetitorParams,
  RemoveCompetitorResponse,
  ListKeywordsResponse,
  TrackKeywordResponse,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/youtube/channel", async (_req, res): Promise<void> => {
  let [channel] = await db.select().from(channelTable).limit(1);
  if (!channel) {
    [channel] = await db.insert(channelTable).values({
      channelName: "My YouTube Channel",
      subscribers: 12847,
      totalViews: 2840192,
      totalVideos: 47,
      healthScore: 87,
      monthlyRevenue: 3241.5,
      avgViewDuration: 6.4,
      clickThroughRate: 4.2,
      updatedAt: new Date(),
    }).returning();
  }
  res.json(GetChannelInfoResponse.parse(serialize(channel)));
});

router.get("/youtube/analytics", async (req, res): Promise<void> => {
  const period = String(req.query.period ?? "30d");
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.views)).limit(5);

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const dailyStats = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split("T")[0],
      views: Math.round(2000 + Math.random() * 8000),
      watchTime: Math.round((50 + Math.random() * 200) * 10) / 10,
      revenue: Math.round((30 + Math.random() * 150) * 100) / 100,
      subscribers: Math.round(20 + Math.random() * 80),
    };
  });

  const analytics = {
    period,
    views: dailyStats.reduce((s, d) => s + d.views, 0),
    watchTime: Math.round(dailyStats.reduce((s, d) => s + d.watchTime, 0) * 10) / 10,
    subscribers: dailyStats.reduce((s, d) => s + d.subscribers, 0),
    revenue: Math.round(dailyStats.reduce((s, d) => s + d.revenue, 0) * 100) / 100,
    impressions: Math.round(dailyStats.reduce((s, d) => s + d.views, 0) * 6),
    ctr: Math.round((3.5 + Math.random() * 2) * 100) / 100,
    avgViewDuration: Math.round((4 + Math.random() * 4) * 100) / 100,
    topVideos: videos,
    dailyStats,
  };

  res.json(GetYoutubeAnalyticsResponse.parse(serialize(analytics)));
});

router.get("/youtube/competitors", async (_req, res): Promise<void> => {
  const rows = await db.select().from(competitorsTable).orderBy(desc(competitorsTable.subscribers));
  res.json(ListCompetitorsResponse.parse(serialize(rows)));
});

router.post("/youtube/competitors", async (req, res): Promise<void> => {
  const parsed = AddCompetitorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(competitorsTable).values({
    channelName: parsed.data.channelName,
    channelUrl: parsed.data.channelUrl ?? null,
    niche: parsed.data.niche ?? null,
    subscribers: Math.round(10000 + Math.random() * 500000),
    totalVideos: Math.round(20 + Math.random() * 300),
    avgViews: Math.round(1000 + Math.random() * 50000),
    uploadFrequency: "2-3 per week",
  }).returning();

  res.status(201).json(AddCompetitorResponse.parse(serialize(row)));
});

router.delete("/youtube/competitors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RemoveCompetitorParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(competitorsTable).where(eq(competitorsTable.id, params.data.id));
  res.json(RemoveCompetitorResponse.parse(serialize({ success: true })));
});

router.get("/youtube/keywords", async (_req, res): Promise<void> => {
  const rows = await db.select().from(keywordsTable).orderBy(desc(keywordsTable.volume));
  res.json(ListKeywordsResponse.parse(serialize(rows.map(k => ({ ...k, tracked: k.tracked === 1 })))));
});

router.post("/youtube/keywords", async (req, res): Promise<void> => {
  const parsed = TrackKeywordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(keywordsTable).values({
    keyword: parsed.data.keyword,
    volume: Math.round(1000 + Math.random() * 50000),
    competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
    cpc: Math.round((0.5 + Math.random() * 5) * 100) / 100,
    trend: Math.round((Math.random() * 40 - 10) * 10) / 10,
    tracked: 1,
  }).returning();

  res.status(201).json(TrackKeywordResponse.parse(serialize({ ...row, tracked: row.tracked === 1 })));
});

export default router;
