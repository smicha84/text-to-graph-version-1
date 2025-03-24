import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateGraphInputSchema, exportGraphSchema } from "@shared/schema";
import { storage } from "./storage";
import { generateGraphWithClaude, performWebSearch } from "./anthropic";
import { getApiLogs } from "./database";

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
  console.log("Using Claude API for graph generation");
  
  // If we're doing a web search, update the context to inform Claude about the source
  const webSearchMode = options.webSearchNode && options.webSearchQuery;
  const textToProcess = webSearchMode 
    ? `The following information was retrieved from a web search about "${options.webSearchQuery}":\n\n${text}`
    : text;
    
  const newGraph = await generateGraphWithClaude(textToProcess, options);
  
  // If append mode is true and we have an existing graph, merge them
  if (appendMode && existingGraph) {
    console.log("Merging with existing graph");
    return mergeGraphs(existingGraph, newGraph);
  }
  
  return newGraph;
}

async function webSearchAndExpandGraph(query: string, nodeId: string, existingGraph: any) {
  if (!existingGraph || !existingGraph.nodes || existingGraph.nodes.length === 0) {
    throw new Error("Cannot perform web search with an empty graph.");
  }
  
  // Find the node that triggered the search
  const sourceNode = existingGraph.nodes.find((node: any) => node.id === nodeId);
  if (!sourceNode) {
    throw new Error(`Node with ID ${nodeId} not found in the graph.`);
  }
  
  console.log(`Performing web search for node ${nodeId} with query: ${query}`);
  
  // Generate a new subgraph ID for this web search
  const subgraphId = `webSearch_${Date.now()}`;
  
  // Mark the source node as part of this new subgraph
  if (!sourceNode.subgraphIds) {
    sourceNode.subgraphIds = [];
  }
  if (!sourceNode.subgraphIds.includes(subgraphId)) {
    sourceNode.subgraphIds.push(subgraphId);
  }
  
  // Set up options for graph generation
  const options = {
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: 'claude',
    appendMode: true,
    webSearchNode: nodeId,
    webSearchQuery: query
  };
  
  // Perform the web search to get search results
  const searchResults = await performWebSearch(query);
  
  // Use the search results to generate the graph
  const graphWithWebResults = await generateGraphFromText(searchResults, options, existingGraph, true);
  
  // Add metadata to all new nodes and edges
  const originalNodeIds = new Set(existingGraph.nodes.map((node: any) => node.id));
  const originalEdgeIds = new Set(existingGraph.edges.map((edge: any) => edge.id));
  
  // Mark new nodes as part of the web search subgraph
  graphWithWebResults.nodes.forEach((node: any) => {
    if (!originalNodeIds.has(node.id)) {
      if (!node.subgraphIds) {
        node.subgraphIds = [];
      }
      if (!node.subgraphIds.includes(subgraphId)) {
        node.subgraphIds.push(subgraphId);
      }
      
      // Add metadata to indicate this is from web search
      if (!node.properties) {
        node.properties = {};
      }
      node.properties.source = "web search result";
    }
  });
  
  // Mark new edges as part of the web search subgraph
  graphWithWebResults.edges.forEach((edge: any) => {
    if (!originalEdgeIds.has(edge.id)) {
      if (!edge.subgraphIds) {
        edge.subgraphIds = [];
      }
      if (!edge.subgraphIds.includes(subgraphId)) {
        edge.subgraphIds.push(subgraphId);
      }
      
      // Add metadata to indicate this is from web search
      if (!edge.properties) {
        edge.properties = {};
      }
      edge.properties.source = "web search result";
    }
  });
  
  return graphWithWebResults;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate a graph from text
  app.post('/api/generate-graph', async (req, res) => {
    try {
      // Validate request body
      const { text, options, existingGraph, appendMode } = generateGraphInputSchema.parse(req.body);
      
      // Generate graph using Claude API, potentially merging with existing graph
      const result = await generateGraphFromText(text, options, existingGraph, appendMode);
      
      // Verify that we have nodes and edges arrays in the result
      if (!result || !Array.isArray(result.nodes) || !Array.isArray(result.edges)) {
        console.error('Invalid graph structure returned:', result);
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
  
  // API endpoint for web search
  app.post('/api/web-search', async (req, res) => {
    try {
      // Validate request body (ideally, we'd create a Zod schema for this)
      const { query, nodeId, graph } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'A query string is required' });
      }
      
      if (!nodeId || typeof nodeId !== 'string') {
        return res.status(400).json({ message: 'A node ID is required' });
      }
      
      if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
        return res.status(400).json({ message: 'A valid graph object is required' });
      }
      
      // Perform web search and expand the graph
      const expandedGraph = await webSearchAndExpandGraph(query, nodeId, graph);
      
      // Return the expanded graph
      res.json(expandedGraph);
    } catch (error) {
      console.error('Error performing web search:', error);
      let errorMessage = 'Failed to perform web search';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({ 
        message: 'Failed to perform web search',
        details: errorMessage
      });
    }
  });
  
  // API endpoint to get API logs
  app.get('/api/logs', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const operation = req.query.operation as string;
      
      const result = await getApiLogs(page, limit, operation);
      res.json(result);
    } catch (error) {
      console.error('Error fetching API logs:', error);
      res.status(500).json({ 
        message: 'Failed to fetch API logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
