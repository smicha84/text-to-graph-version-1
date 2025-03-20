import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Graph generation history
export const graphs = pgTable("graphs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  options: jsonb("options").notNull(),
  result: jsonb("result").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertGraphSchema = createInsertSchema(graphs).pick({
  userId: true,
  text: true,
  options: true,
  result: true,
  createdAt: true,
});

// API Options Schema
export const graphOptionsSchema = z.object({
  extractEntities: z.boolean().default(true),
  extractRelations: z.boolean().default(true),
  inferProperties: z.boolean().default(true),
  mergeEntities: z.boolean().default(true),
  model: z.string().default("o1-pro"),
});

// API Input Schema
export const generateGraphInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  options: graphOptionsSchema,
});

// Export Graph Schema
export const exportGraphSchema = z.object({
  format: z.enum(["png", "svg", "json", "cypher", "gremlin"]).default("json"),
  graph: z.any(),
  includeProperties: z.boolean().default(true),
  includeStyles: z.boolean().default(true),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGraph = z.infer<typeof insertGraphSchema>;
export type Graph = typeof graphs.$inferSelect;
export type GraphOptions = z.infer<typeof graphOptionsSchema>;
export type GenerateGraphInput = z.infer<typeof generateGraphInputSchema>;
export type ExportGraphInput = z.infer<typeof exportGraphSchema>;
