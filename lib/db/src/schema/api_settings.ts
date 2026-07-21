import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const apiSettingsTable = pgTable("api_settings", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull().unique(),
  label: text("label").notNull(),
  apiKey: text("api_key"),
  isConfigured: integer("is_configured").notNull().default(0),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiSettingSchema = createInsertSchema(apiSettingsTable).omit({ id: true, updatedAt: true });
export type InsertApiSetting = z.infer<typeof insertApiSettingSchema>;
export type ApiSetting = typeof apiSettingsTable.$inferSelect;
