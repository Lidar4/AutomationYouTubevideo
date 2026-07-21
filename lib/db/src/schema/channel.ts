import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const channelTable = pgTable("channel", {
  id: serial("id").primaryKey(),
  channelName: text("channel_name").notNull().default("My Channel"),
  channelId: text("channel_id"),
  subscribers: integer("subscribers").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  totalVideos: integer("total_videos").notNull().default(0),
  healthScore: integer("health_score").notNull().default(75),
  monthlyRevenue: real("monthly_revenue").notNull().default(0),
  avgViewDuration: real("avg_view_duration").notNull().default(0),
  clickThroughRate: real("click_through_rate").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const competitorsTable = pgTable("competitors", {
  id: serial("id").primaryKey(),
  channelName: text("channel_name").notNull(),
  channelUrl: text("channel_url"),
  subscribers: integer("subscribers").notNull().default(0),
  totalVideos: integer("total_videos").notNull().default(0),
  avgViews: integer("avg_views").notNull().default(0),
  uploadFrequency: text("upload_frequency"),
  niche: text("niche"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const keywordsTable = pgTable("keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  volume: integer("volume").notNull().default(0),
  competition: text("competition").notNull().default("medium"),
  cpc: real("cpc").notNull().default(0),
  trend: real("trend").notNull().default(0),
  tracked: integer("tracked").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChannelSchema = createInsertSchema(channelTable).omit({ id: true, updatedAt: true });
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channelTable.$inferSelect;

export const insertCompetitorSchema = createInsertSchema(competitorsTable).omit({ id: true, createdAt: true });
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Competitor = typeof competitorsTable.$inferSelect;

export const insertKeywordSchema = createInsertSchema(keywordsTable).omit({ id: true, createdAt: true });
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;
export type Keyword = typeof keywordsTable.$inferSelect;
