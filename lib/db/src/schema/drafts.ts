import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const draftsTable = pgTable("drafts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("long"),
  notes: text("notes"),
  contentId: integer("content_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schedulesTable = pgTable("schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("scheduled"),
  videoId: integer("video_id"),
  contentId: integer("content_id"),
  platform: text("platform").notNull().default("youtube"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDraftSchema = createInsertSchema(draftsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDraft = z.infer<typeof insertDraftSchema>;
export type Draft = typeof draftsTable.$inferSelect;

export const insertScheduleSchema = createInsertSchema(schedulesTable).omit({ id: true, createdAt: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedulesTable.$inferSelect;
