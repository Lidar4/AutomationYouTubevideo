import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const automationJobsTable = pgTable("automation_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  frequency: text("frequency").notNull().default("daily"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  config: text("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automationLogsTable = pgTable("automation_logs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  jobName: text("job_name").notNull(),
  status: text("status").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAutomationJobSchema = createInsertSchema(automationJobsTable).omit({ id: true, createdAt: true });
export type InsertAutomationJob = z.infer<typeof insertAutomationJobSchema>;
export type AutomationJob = typeof automationJobsTable.$inferSelect;

export const insertAutomationLogSchema = createInsertSchema(automationLogsTable).omit({ id: true, createdAt: true });
export type InsertAutomationLog = z.infer<typeof insertAutomationLogSchema>;
export type AutomationLog = typeof automationLogsTable.$inferSelect;
