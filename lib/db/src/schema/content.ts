import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentTable = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  type: text("type").notNull().default("long"),
  topic: text("topic").notNull(),
  hook: text("hook"),
  outline: text("outline"),
  storyFlow: text("story_flow"),
  script: text("script"),
  cta: text("cta"),
  description: text("description"),
  seoTitle: text("seo_title"),
  tags: text("tags"),
  hashtags: text("hashtags"),
  thumbnailPrompt: text("thumbnail_prompt"),
  imagePrompt: text("image_prompt"),
  scenePrompt: text("scene_prompt"),
  status: text("status").notNull().default("draft"),
  researchId: integer("research_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
