import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  generateGraphInputSchema, 
  exportGraphSchema, 
  apiTemplateSchema, 
  InsertApiCall,
  ApiTemplate
} from "@shared/schema";
import { storage } from "./storage";
import { generateGraphWithClaude } from "./anthropic";

// Import the buildPrompt function from anthropic.ts
import fs from 'fs';
import path from 'path';

// Function to extract the buildPrompt function from anthropic.ts
function buildPrompt(text: string, options: any): string {
  const defaultPrompt = `
Analyze the following text and extract a labeled property graph with entities and relationships. The graph should be represented as JSON with "nodes" and "edges" arrays.

TEXT TO ANALYZE:
"""
${text}
"""

EXTRACTION OPTIONS:
${options.extractEntities ? '- Extract entities (people, organizations, locations, products, concepts, events, documents, etc.)' : '- Skip entity extraction'}
${options.extractRelations ? '- Extract relationships between entities' : '- Skip relationship extraction'}
${options.inferProperties ? '- Infer additional properties for entities and relationships based on context' : '- Only extract explicitly mentioned properties'}
${options.mergeEntities ? '- Merge similar or duplicate entities into single nodes' : '- Keep entities separate even if they might be the same'}

RESPONSE FORMAT:
Respond with a JSON object that has the following structure:
{
  "nodes": [
    {
      "id": "n1",
      "label": "Person",
      "type": "Employee",
      "properties": {
        "name": "John Smith",
        "role": "Developer"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2",
      "label": "WORKS_FOR",
      "properties": {
        "since": 2020
      }
    }
  ]
}

Only respond with the JSON object, no explanations or other text.`;

  return defaultPrompt;
}

// Function to merge two graphs with subgraph tracking
function mergeGraphs(existingGraph: any, newGraph: any): any {
  // Create a deep copy of the existing graph
  const mergedGraph = {
    nodes: [...existingGraph.nodes],
    edges: [...existingGraph.edges],
    subgraphCounter: existingGraph.subgraphCounter || 0
  };
  
  // Generate a new subgraph ID for this addition
  const newSubgraphId = `sg${(mergedGraph.subgraphCounter || 0) + 1}`;
  mergedGraph.subgraphCounter = (mergedGraph.subgraphCounter || 0) + 1;
  
  // Create a map of existing node IDs and labels for quick lookup
  const existingNodeIds = new Map();
  existingGraph.nodes.forEach((node: any) => {
    // Use a combination of label and name property (if available) as a unique identifier
    const nodeName = node.properties.name || '';
    const nodeKey = `${node.label}:${nodeName}`.toLowerCase();
    existingNodeIds.set(nodeKey, node.id);
  });
  
  // Create a mapping from new node IDs to either existing IDs or new unique IDs
  const nodeIdMap = new Map();
  
  // Add new nodes, avoiding duplicates and tracking subgraph membership
  newGraph.nodes.forEach((newNode: any) => {
    const nodeName = newNode.properties.name || '';
    const nodeKey = `${newNode.label}:${nodeName}`.toLowerCase();
    
    // Check if a similar node already exists
    if (existingNodeIds.has(nodeKey)) {
      // Map this new node ID to the existing node ID
      const existingId = existingNodeIds.get(nodeKey);
      nodeIdMap.set(newNode.id, existingId);
      
      // Find the existing node and add the new subgraph ID to its list
      const existingNode = mergedGraph.nodes.find((n: any) => n.id === existingId);
      if (existingNode) {
        existingNode.subgraphIds = [...(existingNode.subgraphIds || []), newSubgraphId];
      }
    } else {
      // Generate a new unique ID for this node
      const newId = `n${mergedGraph.nodes.length + 1}`;
      nodeIdMap.set(newNode.id, newId);
      
      // Add the node with the new ID and subgraph ID
      mergedGraph.nodes.push({
        ...newNode,
        id: newId,
        subgraphIds: [newSubgraphId]
      });
    }
  });
  
  // Add new edges, updating source and target references and tracking subgraph membership
  newGraph.edges.forEach((newEdge: any) => {
    // Get mapped node IDs for source and target
    const sourceId = nodeIdMap.get(newEdge.source) || newEdge.source;
    const targetId = nodeIdMap.get(newEdge.target) || newEdge.target;
    
    // Create a new unique edge ID
    const newId = `e${mergedGraph.edges.length + 1}`;
    
    // Check if this edge already exists (same source, target, and label)
    const existingEdgeIndex = mergedGraph.edges.findIndex((edge: any) => 
      edge.source === sourceId && 
      edge.target === targetId && 
      edge.label === newEdge.label
    );
    
    if (existingEdgeIndex >= 0) {
      // The edge exists, so add this subgraph ID to its list
      const existingEdge = mergedGraph.edges[existingEdgeIndex];
      existingEdge.subgraphIds = [...(existingEdge.subgraphIds || []), newSubgraphId];
    } else {
      // Add a new edge with this subgraph ID
      mergedGraph.edges.push({
        ...newEdge,
        id: newId,
        source: sourceId,
        target: targetId,
        subgraphIds: [newSubgraphId]
      });
    }
  });
  
  return mergedGraph;
}

// Main graph generation function using Claude API
async function generateGraphFromText(text: string, options: any, existingGraph?: any, appendMode = false) {
  // Log detailed request information for debugging
  console.log("Starting graph generation with Claude API");
  console.log("Text length:", text.length);
  console.log("Options:", JSON.stringify(options, null, 2));
  console.log("Append mode:", appendMode);
  
  if (existingGraph) {
    console.log("Existing graph stats:", {
      nodes: existingGraph.nodes?.length || 0,
      edges: existingGraph.edges?.length || 0
    });
  }
  
  try {
    // Generate new graph
    const newGraph = await generateGraphWithClaude(text, options);
    
    // Log and validate the returned graph
    if (!newGraph) {
      console.error("Claude API returned null or undefined graph");
      throw new Error("Invalid response from Claude API: null or undefined graph");
    }
    
    if (!Array.isArray(newGraph.nodes)) {
      console.error("Claude API returned graph without nodes array:", newGraph);
      throw new Error("Invalid response from Claude API: missing nodes array");
    }
    
    if (!Array.isArray(newGraph.edges)) {
      console.error("Claude API returned graph without edges array:", newGraph);
      throw new Error("Invalid response from Claude API: missing edges array");
    }
    
    console.log("Successfully generated new graph:", {
      nodes: newGraph.nodes.length,
      edges: newGraph.edges.length
    });
    
    // If append mode is true and we have an existing graph, merge them
    if (appendMode && existingGraph) {
      console.log("Merging with existing graph");
      const mergedGraph = mergeGraphs(existingGraph, newGraph);
      console.log("Merged graph stats:", {
        nodes: mergedGraph.nodes.length,
        edges: mergedGraph.edges.length
      });
      return mergedGraph;
    }
    
    return newGraph;
  } catch (error) {
    console.error("Error in generateGraphFromText:", error);
    // Re-throw to be handled by the calling function
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced API endpoint to generate a graph from text with API call history tracking
  app.post('/api/generate-graph', async (req, res) => {
    try {
      // Validate request body
      const { text, options, existingGraph, appendMode, saveApiCall } = generateGraphInputSchema.parse(req.body);
      
      // Create an API call record if tracking is enabled (default is true)
      let apiCallId: number | null = null;
      if (saveApiCall !== false) {
        const now = new Date().toISOString();
        const systemPrompt = options.customSystemPrompt || "You are an expert in natural language processing and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph.";
        const extractionPrompt = options.customExtractionPrompt || buildPrompt(text, options);
        
        try {
          const apiCall = await storage.createApiCall({
            userId: null, // No user authentication in this version
            text,
            systemPrompt,
            extractionPrompt,
            options: options,
            requestTime: now,
            status: 'pending',
            apiTemplateId: options.apiTemplateId || null
          });
          apiCallId = apiCall.id;
        } catch (logError) {
          console.error('Failed to log API call:', logError);
          // Continue with graph generation even if logging fails
        }
      }
      
      // Generate graph using Claude API, potentially merging with existing graph
      const result = await generateGraphFromText(text, options, existingGraph, appendMode);
      
      // Update the API call record with the result if we created one
      if (apiCallId !== null) {
        try {
          await storage.updateApiCall(apiCallId, {
            responseTime: new Date().toISOString(),
            responseData: result,
            status: 'success'
          });
        } catch (updateError) {
          console.error('Failed to update API call record:', updateError);
          // Continue with the response even if the update fails
        }
      }
      
      // Verify that we have nodes and edges arrays in the result
      if (!result || !Array.isArray(result.nodes) || !Array.isArray(result.edges)) {
        console.error('Invalid graph structure returned:', result);
        
        // Update API call record with error if we created one
        if (apiCallId !== null) {
          try {
            await storage.updateApiCall(apiCallId, {
              responseTime: new Date().toISOString(),
              status: 'error',
              errorMessage: 'The API generated a graph without valid nodes and edges arrays'
            });
          } catch (updateError) {
            console.error('Failed to update API call record with error:', updateError);
          }
        }
        
        return res.status(500).json({ 
          message: 'Generated graph has an invalid structure',
          details: 'The API generated a graph without valid nodes and edges arrays'
        });
      }
      
      // Return the generated or merged graph
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error generating graph:', error);
        // Include more details in the error response
        let errorMessage = 'Failed to generate graph';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(500).json({ 
          message: 'Failed to generate graph',
          details: errorMessage
        });
      }
    }
  });
  
  // API endpoint to export a graph
  app.post('/api/export-graph', async (req, res) => {
    try {
      const { format, graph, includeProperties, includeStyles } = exportGraphSchema.parse(req.body);
      
      // Process based on requested format
      switch (format) {
        case 'json':
          return res.json({
            data: JSON.stringify(graph, null, 2),
            contentType: 'application/json',
            filename: 'graph.json'
          });
          
        case 'svg':
          // In a real implementation, we would generate an actual SVG here
          return res.json({
            data: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><!-- SVG content would be here --></svg>`,
            contentType: 'image/svg+xml',
            filename: 'graph.svg'
          });
          
        case 'cypher':
          // Generate Cypher queries from the graph
          let cypherQueries = '';
          
          // Create nodes
          graph.nodes.forEach((node: any) => {
            const propString = includeProperties 
              ? Object.entries(node.properties)
                  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                  .join(', ')
              : '';
            
            cypherQueries += `CREATE (n${node.id}:${node.label} {${propString}})\n`;
          });
          
          // Create relationships
          graph.edges.forEach((edge: any) => {
            const propString = includeProperties && edge.properties
              ? Object.entries(edge.properties)
                  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                  .join(', ')
              : '';
            
            cypherQueries += `CREATE (n${edge.source})-[:${edge.label} {${propString}}]->(n${edge.target})\n`;
          });
          
          return res.json({
            data: cypherQueries,
            contentType: 'text/plain',
            filename: 'graph.cypher'
          });
          
        case 'gremlin':
          // Generate Gremlin queries from the graph
          let gremlinQueries = '';
          
          // Create vertices
          graph.nodes.forEach((node: any) => {
            const propString = includeProperties 
              ? Object.entries(node.properties)
                  .map(([key, value]) => `.property('${key}', ${JSON.stringify(value)})`)
                  .join('')
              : '';
            
            gremlinQueries += `g.addV('${node.label}').property('id', '${node.id}')${propString}\n`;
          });
          
          // Create edges
          graph.edges.forEach((edge: any) => {
            const propString = includeProperties && edge.properties
              ? Object.entries(edge.properties)
                  .map(([key, value]) => `.property('${key}', ${JSON.stringify(value)})`)
                  .join('')
              : '';
            
            gremlinQueries += `g.V('${edge.source}').addE('${edge.label}').to(g.V('${edge.target}'))${propString}\n`;
          });
          
          return res.json({
            data: gremlinQueries,
            contentType: 'text/plain',
            filename: 'graph.gremlin'
          });
          
        default:
          // PNG format would typically be generated on the client side
          return res.status(400).json({ message: 'Format not supported on server' });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error exporting graph:', error);
        res.status(500).json({ message: 'Failed to export graph' });
      }
    }
  });
  
  // API Template Management Endpoints
  
  // Get all API templates
  app.get('/api/templates', async (req, res) => {
    try {
      // In a real app with authentication, we would filter by user ID
      const templates = await storage.getApiTemplatesByUser(null);
      res.json(templates);
    } catch (error) {
      console.error('Error getting API templates:', error);
      res.status(500).json({ message: 'Failed to get API templates' });
    }
  });
  
  // Get a specific API template by ID
  app.get('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      const template = await storage.getApiTemplate(id);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error getting API template:', error);
      res.status(500).json({ message: 'Failed to get API template' });
    }
  });
  
  // Create a new API template
  app.post('/api/templates', async (req, res) => {
    try {
      const templateData = apiTemplateSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const template = await storage.createApiTemplate({
        ...templateData,
        userId: null, // No authentication in this version
        createdAt: now
      });
      
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error creating API template:', error);
        res.status(500).json({ message: 'Failed to create API template' });
      }
    }
  });
  
  // Update an API template
  app.put('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      const templateData = apiTemplateSchema.parse(req.body);
      
      // Make sure the template exists
      const existingTemplate = await storage.getApiTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // Update the template
      const updatedTemplate = await storage.updateApiTemplate(id, templateData);
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error updating API template:', error);
        res.status(500).json({ message: 'Failed to update API template' });
      }
    }
  });
  
  // Delete an API template
  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      // Make sure the template exists
      const existingTemplate = await storage.getApiTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // Delete the template
      const success = await storage.deleteApiTemplate(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: 'Failed to delete template' });
      }
    } catch (error) {
      console.error('Error deleting API template:', error);
      res.status(500).json({ message: 'Failed to delete API template' });
    }
  });
  
  // API Call History Endpoints
  
  // Get API call history
  app.get('/api/call-history', async (req, res) => {
    try {
      // In a real app with authentication, we would filter by user ID
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const calls = await storage.getApiCallsByUser(null, limit);
      res.json(calls);
    } catch (error) {
      console.error('Error getting API call history:', error);
      res.status(500).json({ message: 'Failed to get API call history' });
    }
  });
  
  // Get a specific API call by ID
  app.get('/api/call-history/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid call ID' });
      }
      
      const call = await storage.getApiCall(id);
      if (!call) {
        return res.status(404).json({ message: 'API call not found' });
      }
      
      res.json(call);
    } catch (error) {
      console.error('Error getting API call:', error);
      res.status(500).json({ message: 'Failed to get API call' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
