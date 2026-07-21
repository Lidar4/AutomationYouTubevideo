import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trendingTopicsTable = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  score: real("score").notNull().default(0),
  category: text("category").notNull().default("general"),
  growth: real("growth").notNull().default(0),
  searchVolume: integer("search_volume").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trendingKeywordsTable = pgTable("trending_keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  volume: integer("volume").notNull().default(0),
  competition: text("competition").notNull().default("medium"),
  trend: real("trend").notNull().default(0),
  cpc: real("cpc").notNull().default(0),
});

export const contentOpportunitiesTable = pgTable("content_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  estimatedViews: integer("estimated_views").notNull().default(0),
  difficulty: text("difficulty").notNull().default("medium"),
});

export const aiSuggestionsTable = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  type: text("type").notNull().default("video"),
  score: real("score").notNull().default(0),
});

export const insertTrendingTopicSchema = createInsertSchema(trendingTopicsTable).omit({ id: true, createdAt: true });
export type InsertTrendingTopic = z.infer<typeof insertTrendingTopicSchema>;
export type TrendingTopic = typeof trendingTopicsTable.$inferSelect;
