import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pipelineTable = pgTable("pipeline", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  currentStep: text("current_step").notNull().default("research"),
  status: text("status").notNull().default("running"),
  progress: integer("progress").notNull().default(0),
  steps: text("steps").notNull().default("[]"),
  videoId: integer("video_id"),
  contentId: integer("content_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPipelineSchema = createInsertSchema(pipelineTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelineTable.$inferSelect;
