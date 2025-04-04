import { pgTable, text, serial, integer, boolean, jsonb, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with enhanced fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Extended user schema for public profile info
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences"),
  socialLinks: jsonb("social_links"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  bio: true,
  avatarUrl: true,
  preferences: true,
  socialLinks: true,
});

// User graph schema
export const userGraphs = pgTable("user_graphs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const insertUserGraphSchema = createInsertSchema(userGraphs).pick({
  userId: true,
  name: true,
  description: true,
  isPublic: true,
  nodes: true,
  edges: true,
  metadata: true,
});

// Multi-user graph schema
export const multiUserGraphs = pgTable("multi_user_graphs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerUserId: integer("owner_user_id").references(() => users.id).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  contributorIds: jsonb("contributor_ids").notNull(),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  analyticsEnabled: boolean("analytics_enabled").default(true).notNull(),
  metadata: jsonb("metadata"),
});

export const insertMultiUserGraphSchema = createInsertSchema(multiUserGraphs).pick({
  name: true,
  description: true,
  ownerUserId: true,
  isPublic: true,
  contributorIds: true,
  nodes: true,
  edges: true,
  analyticsEnabled: true,
  metadata: true,
});

// Graph analytics schema
export const graphAnalytics = pgTable("graph_analytics", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id").notNull(),
  graphType: text("graph_type").notNull(), // 'user_graph' or 'multi_user_graph'
  metricType: text("metric_type").notNull(), // e.g., 'centrality', 'density', 'clustering'
  metricValue: jsonb("metric_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  parameters: jsonb("parameters"),
});

export const insertGraphAnalyticsSchema = createInsertSchema(graphAnalytics).pick({
  graphId: true,
  graphType: true,
  metricType: true,
  metricValue: true,
  parameters: true,
});

// Graph generation history (existing)
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
  generateOntology: z.boolean().optional().default(true), // Whether to generate domain ontology before extraction
  generateTaxonomies: z.boolean().optional().default(true), // Whether to generate entity taxonomies for hierarchical categorization
  model: z.literal("claude").default("claude"),
  appendMode: z.boolean().optional().default(false), // Whether to append to existing graph
  existingTaxonomy: z.any().optional(), // To pass existing taxonomy information to Claude
  sourceNodeType: z.string().optional(), // Type of the source node when doing web search
  sourceNodeLabel: z.string().optional(), // Label of the source node when doing web search
  graphContext: z.any().optional(), // Additional context about the existing graph
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

// New types for multi-user functionality
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserGraph = z.infer<typeof insertUserGraphSchema>;
export type UserGraph = typeof userGraphs.$inferSelect;
export type InsertMultiUserGraph = z.infer<typeof insertMultiUserGraphSchema>;
export type MultiUserGraph = typeof multiUserGraphs.$inferSelect;
export type InsertGraphAnalytics = z.infer<typeof insertGraphAnalyticsSchema>;
export type GraphAnalytics = typeof graphAnalytics.$inferSelect;

// In-memory graph representation
export interface Node {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  subgraphIds?: string[];
  labelDetail?: string;
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
  metadata?: Record<string, any>; // Added for GraphV2 metadata
}

// API Logs for tracking all LLM interactions
export const apiLogs = pgTable("api_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  type: text("type").notNull(), // "request" or "response"
  operation: text("operation").notNull(), // "generate_graph", "web_search", etc.
  requestData: jsonb("request_data"), // The data sent to the LLM
  responseData: jsonb("response_data"), // The data received from the LLM
  statusCode: integer("status_code"), // HTTP status code
  processingTimeMs: integer("processing_time_ms"), // Time it took to process
  sourceIp: text("source_ip"), // IP address of the client
  userAgent: text("user_agent"), // User agent of the client
  userId: integer("user_id").references(() => users.id), // Optional user ID if authenticated
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
});

export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
export type ApiLog = typeof apiLogs.$inferSelect;
