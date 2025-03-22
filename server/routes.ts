import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateGraphInputSchema, exportGraphSchema } from "@shared/schema";
import { storage } from "./storage";
import { generateGraphWithClaude } from "./anthropic";

// Fallback function if Claude API fails
async function generateGraphFromTextFallback(text: string, options: any) {
  console.log("Using fallback graph generation method");
  // Simple entity extraction
  const entities: Record<string, any> = {};
  const personRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/g;
  const companyRegex = /([A-Z][a-z]+ (Corp|Inc|LLC|Company))/g;
  const productRegex = /(Widget [A-Za-z0-9]+)/g;
  const locationRegex = /(New York|San Francisco|London|Tokyo)/g;
  
  let match;
  let idCounter = 1;
  
  // Extract persons
  while ((match = personRegex.exec(text)) !== null) {
    const name = match[0];
    if (!entities[name]) {
      entities[name] = {
        id: `n${idCounter++}`,
        label: 'Person',
        type: 'Person',
        properties: { name }
      };
    }
  }
  
  // Extract companies
  while ((match = companyRegex.exec(text)) !== null) {
    const name = match[0];
    if (!entities[name]) {
      entities[name] = {
        id: `n${idCounter++}`,
        label: 'Company',
        type: 'Organization',
        properties: { name }
      };
    }
  }
  
  // Extract products
  while ((match = productRegex.exec(text)) !== null) {
    const name = match[0];
    if (!entities[name]) {
      entities[name] = {
        id: `n${idCounter++}`,
        label: 'Product',
        type: 'Product',
        properties: { name }
      };
    }
  }
  
  // Extract locations
  while ((match = locationRegex.exec(text)) !== null) {
    const name = match[0];
    if (!entities[name]) {
      entities[name] = {
        id: `n${idCounter++}`,
        label: 'Location',
        type: 'Location',
        properties: { name }
      };
    }
  }
  
  // Simple relation extraction
  const relations = [];
  let edgeCounter = 1;
  
  // Try to extract relations like "works for", "produces", etc.
  const entityNames = Object.keys(entities);
  
  // Add more comprehensive relation detection
  for (let i = 0; i < entityNames.length; i++) {
    for (let j = 0; j < entityNames.length; j++) {
      if (i !== j) {
        const source = entityNames[i];
        const target = entityNames[j];
        const sourceId = entities[source].id;
        const targetId = entities[target].id;
        const sourceType = entities[source].type;
        const targetType = entities[target].type;
        
        // First try explicit pattern matching
        
        // Person WORKS_FOR Company
        if (sourceType === 'Person' && 
            targetType === 'Organization' && 
            text.includes(`${source} works for ${target}`)) {
          const properties: Record<string, any> = {};
          
          // Extract "since" year if available
          const sinceMatch = new RegExp(`${source} works for ${target} since (\\d{4})`).exec(text);
          if (sinceMatch) {
            properties.since = parseInt(sinceMatch[1]);
          }
          
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'WORKS_FOR',
            properties
          });
          
          // Continue to next iteration to avoid duplicate relations
          continue;
        }
        
        // Company PRODUCES Product
        if (sourceType === 'Organization' && 
            targetType === 'Product' && 
            (text.includes(`${source} produces ${target}`) || 
             text.includes(`${source} makes ${target}`))) {
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'PRODUCES',
            properties: {}
          });
          continue;
        }
        
        // Company LOCATED_IN Location
        if (sourceType === 'Organization' && 
            targetType === 'Location' && 
            (text.includes(`${source} in ${target}`) || 
             text.includes(`${source} based in ${target}`) ||
             text.includes(`${source} headquarters in ${target}`))) {
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'LOCATED_IN',
            properties: {}
          });
          continue;
        }
        
        // Person KNOWS Person
        if (sourceType === 'Person' && 
            targetType === 'Person' && 
            (text.includes(`${source} knows ${target}`) ||
             text.includes(`${source} and ${target}`) ||
             text.includes(`${source}, ${target}`))) {
          const properties: Record<string, any> = {};
          
          // Extract "since" year if available
          const sinceMatch = new RegExp(`${source} knows ${target} since (\\d{4})`).exec(text);
          if (sinceMatch) {
            properties.since = parseInt(sinceMatch[1]);
          }
          
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'KNOWS',
            properties
          });
          continue;
        }
        
        // Fallback: Create relationships based on entity types alone
        // This ensures we generate some edges even without explicit textual patterns
        
        // Connect all Persons to Organizations
        if (sourceType === 'Person' && targetType === 'Organization') {
          // Limit to first few organizations for each person to avoid too many edges
          if (relations.filter(r => r.source === sourceId && r.label === 'ASSOCIATED_WITH').length < 2) {
            relations.push({
              id: `e${edgeCounter++}`,
              source: sourceId,
              target: targetId,
              label: 'ASSOCIATED_WITH',
              properties: {}
            });
          }
        }
        
        // Connect Organizations to Locations
        if (sourceType === 'Organization' && targetType === 'Location') {
          if (!relations.some(r => r.source === sourceId && r.target === targetId)) {
            relations.push({
              id: `e${edgeCounter++}`,
              source: sourceId,
              target: targetId,
              label: 'BASED_IN',
              properties: {}
            });
          }
        }
        
        // Connect some Persons to each other to create a social network
        if (sourceType === 'Person' && targetType === 'Person') {
          // Limit connections to avoid a fully connected graph
          const existingConnections = relations.filter(
            r => (r.source === sourceId || r.target === sourceId) && 
                 (r.source === targetId || r.target === targetId)
          );
          
          if (existingConnections.length === 0 && Math.random() > 0.7) {
            relations.push({
              id: `e${edgeCounter++}`,
              source: sourceId,
              target: targetId,
              label: 'CONNECTED_TO',
              properties: {}
            });
          }
        }
      }
    }
  }
  
  // Apply layout
  const nodes = Object.values(entities);
  const centerX = 400;
  const centerY = 300;
  const radius = 200;
  
  nodes.forEach((node: any, index: number) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
  
  return {
    nodes,
    edges: relations
  };
}

// Main graph generation function that selects based on model
async function generateGraphFromText(text: string, options: any) {
  try {
    // Check if the model is set to 'fallback', otherwise use Claude
    if (options.model === 'fallback') {
      console.log("Using regex-based generation by user selection");
      return generateGraphFromTextFallback(text, options);
    } else {
      // Default to Claude API for AI-powered graph generation
      console.log("Using Claude API for graph generation");
      return await generateGraphWithClaude(text, options);
    }
  } catch (error) {
    console.error("Error using Claude API for graph generation:", error);
    console.log("Falling back to regex-based generation due to error");
    // Fall back to the regex approach if Claude fails
    return generateGraphFromTextFallback(text, options);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate a graph from text
  app.post('/api/generate-graph', async (req, res) => {
    try {
      // Validate request body
      const { text, options } = generateGraphInputSchema.parse(req.body);
      
      // Generate graph using Claude or fallback
      const result = await generateGraphFromText(text, options);
      
      // Return the generated graph
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error generating graph:', error);
        res.status(500).json({ message: 'Failed to generate graph' });
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
