import { pgTable, serial, text, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const researchTable = pgTable("research", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  shouldCreate: boolean("should_create"),
  reasoning: text("reasoning"),
  topicAnalysis: text("topic_analysis"),
  audienceAnalysis: text("audience_analysis"),
  keywordAnalysis: text("keyword_analysis"),
  relatedQuestions: text("related_questions"),
  competitorResearch: text("competitor_research"),
  searchIntent: text("search_intent"),
  evergreenPotential: real("evergreen_potential"),
  viralPotential: real("viral_potential"),
  contentGapAnalysis: text("content_gap_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResearchSchema = createInsertSchema(researchTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResearch = z.infer<typeof insertResearchSchema>;
export type Research = typeof researchTable.$inferSelect;
