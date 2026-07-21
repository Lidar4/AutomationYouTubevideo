import { Router, type IRouter } from "express";
import { db, trendingTopicsTable, trendingKeywordsTable, contentOpportunitiesTable, aiSuggestionsTable, videosTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetTrendingTopicsResponse,
  GetTrendingKeywordsResponse,
  GetTodaysOpportunitiesResponse,
  GetAiSuggestionsResponse,
} from "@workspace/api-zod";
import { desc } from "drizzle-orm";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [videos, topics] = await Promise.all([
    db.select().from(videosTable),
    db.select().from(trendingTopicsTable).limit(1),
  ]);

  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  const summary = {
    totalVideos,
    totalViews,
    totalSubscribers: 12847,
    totalRevenue: 3241.5,
    contentScore: 87,
    videosThisWeek: 3,
    avgViewsPerVideo,
    growthRate: 12.4,
  };

  res.json(GetDashboardSummaryResponse.parse(serialize(summary)));
});

router.get("/dashboard/trending-topics", async (_req, res): Promise<void> => {
  const topics = await db.select().from(trendingTopicsTable).orderBy(desc(trendingTopicsTable.score)).limit(10);
  res.json(GetTrendingTopicsResponse.parse(serialize(topics)));
});

router.get("/dashboard/trending-keywords", async (_req, res): Promise<void> => {
  const keywords = await db.select().from(trendingKeywordsTable).limit(10);
  res.json(GetTrendingKeywordsResponse.parse(serialize(keywords)));
});

router.get("/dashboard/opportunities", async (_req, res): Promise<void> => {
  const opps = await db.select().from(contentOpportunitiesTable).limit(5);
  res.json(GetTodaysOpportunitiesResponse.parse(serialize(opps)));
});

router.get("/dashboard/ai-suggestions", async (_req, res): Promise<void> => {
  const suggestions = await db.select().from(aiSuggestionsTable).limit(6);
  res.json(GetAiSuggestionsResponse.parse(serialize(suggestions)));
});

export default router;
