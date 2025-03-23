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

// API Templates/Presets
export const apiTemplates = pgTable("api_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  extractionPrompt: text("extraction_prompt").notNull(),
  temperature: text("temperature").notNull(),
  thinkingEnabled: boolean("thinking_enabled").notNull().default(true),
  thinkingBudget: integer("thinking_budget").notNull().default(2000),
  createdAt: text("created_at").notNull(),
});

export const insertApiTemplateSchema = createInsertSchema(apiTemplates).pick({
  userId: true,
  name: true,
  description: true,
  systemPrompt: true,
  extractionPrompt: true,
  temperature: true,
  thinkingEnabled: true,
  thinkingBudget: true,
  createdAt: true,
});

// API Call History
export const apiCalls = pgTable("api_calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  extractionPrompt: text("extraction_prompt").notNull(),
  options: jsonb("options").notNull(),
  requestTime: text("request_time").notNull(),
  responseTime: text("response_time"),
  responseData: jsonb("response_data"),
  status: text("status").notNull(), // 'pending', 'success', 'error'
  errorMessage: text("error_message"),
  apiTemplateId: integer("api_template_id").references(() => apiTemplates.id),
});

export const insertApiCallSchema = createInsertSchema(apiCalls).pick({
  userId: true,
  text: true,
  systemPrompt: true,
  extractionPrompt: true,
  options: true,
  requestTime: true,
  responseTime: true,
  responseData: true,
  status: true,
  errorMessage: true,
  apiTemplateId: true,
});

// API Options Schema
export const graphOptionsSchema = z.object({
  extractEntities: z.boolean().default(true),
  extractRelations: z.boolean().default(true),
  inferProperties: z.boolean().default(true),
  mergeEntities: z.boolean().default(true),
  model: z.literal("claude").default("claude"),
  appendMode: z.boolean().optional().default(false), // Whether to append to existing graph
  // New advanced API options
  customSystemPrompt: z.string().optional(),
  customExtractionPrompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  thinkingEnabled: z.boolean().optional(),
  thinkingBudget: z.number().optional(),
  apiTemplateId: z.number().optional(), // Reference to a saved template
});

// API Input Schema
export const generateGraphInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  options: graphOptionsSchema,
  existingGraph: z.any().optional(), // Optional existing graph to append to
  appendMode: z.boolean().optional().default(false), // Whether to append to existing graph
  saveApiCall: z.boolean().optional().default(true), // Whether to save the API call history
});

// Export Graph Schema
export const exportGraphSchema = z.object({
  format: z.enum(["png", "svg", "json", "cypher", "gremlin"]).default("json"),
  graph: z.any(),
  includeProperties: z.boolean().default(true),
  includeStyles: z.boolean().default(true),
});

// API Template Schema for frontend operations
export const apiTemplateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  extractionPrompt: z.string().min(1, "Extraction prompt is required"),
  temperature: z.string().default("1.0"),
  thinkingEnabled: z.boolean().default(true),
  thinkingBudget: z.number().default(2000),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGraph = z.infer<typeof insertGraphSchema>;
export type GraphRecord = typeof graphs.$inferSelect;
export type GraphOptions = z.infer<typeof graphOptionsSchema>;
export type GenerateGraphInput = z.infer<typeof generateGraphInputSchema>;
export type ExportGraphInput = z.infer<typeof exportGraphSchema>;
export type ApiTemplate = typeof apiTemplates.$inferSelect;
export type InsertApiTemplate = z.infer<typeof insertApiTemplateSchema>;
export type ApiCall = typeof apiCalls.$inferSelect;
export type InsertApiCall = z.infer<typeof insertApiCallSchema>;

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
