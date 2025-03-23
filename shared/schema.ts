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
  model: z.literal("claude").default("claude"),
  appendMode: z.boolean().optional().default(false), // Whether to append to existing graph
  saveApiCall: z.boolean().optional().default(true), // Whether to save the API call in the database
  thinkingEnabled: z.boolean().optional().default(true), // Whether to enable Claude's thinking
  thinkingBudget: z.number().optional().default(2000), // Budget for Claude's thinking in tokens
  temperature: z.string().optional().default("1.0"), // Temperature for Claude generation
  systemPrompt: z.string().optional(), // Custom system prompt
  customExtractionPrompt: z.string().optional(), // Custom extraction prompt
  useFunctionCalling: z.boolean().optional().default(false), // Whether to use function calling
  apiTemplateId: z.string().nullable().optional(), // ID of the API template to use
});

// API Input Schema
export const generateGraphInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  options: graphOptionsSchema,
  existingGraph: z.any().optional(), // Optional existing graph to append to
  appendMode: z.boolean().optional().default(false), // Whether to append to existing graph
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
export type GraphRecord = typeof graphs.$inferSelect;
export type GraphOptions = z.infer<typeof graphOptionsSchema>;
export type GenerateGraphInput = z.infer<typeof generateGraphInputSchema>;
export type ExportGraphInput = z.infer<typeof exportGraphSchema>;

// In-memory graph representation
export interface Node {
  id: string;
  label: string;
  type: string;
  labelDetail?: string; // New property to store what was in parentheses
  properties: Record<string, any>;
  x?: number;
  y?: number;
  subgraphIds?: string[];
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
  subgraphIds?: string[];
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  subgraphCounter?: number;
}
