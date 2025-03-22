import type { Express } from "express";
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
  
  for (let i = 0; i < entityNames.length; i++) {
    for (let j = 0; j < entityNames.length; j++) {
      if (i !== j) {
        const source = entityNames[i];
        const target = entityNames[j];
        const sourceId = entities[source].id;
        const targetId = entities[target].id;
        
        // Person WORKS_FOR Company
        if (entities[source].type === 'Person' && 
            entities[target].type === 'Organization' && 
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
        }
        
        // Company PRODUCES Product
        if (entities[source].type === 'Organization' && 
            entities[target].type === 'Product' && 
            text.includes(`${source} produces ${target}`)) {
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'PRODUCES',
            properties: {}
          });
        }
        
        // Company LOCATED_IN Location
        if (entities[source].type === 'Organization' && 
            entities[target].type === 'Location' && 
            text.includes(`${source} in ${target}`)) {
          relations.push({
            id: `e${edgeCounter++}`,
            source: sourceId,
            target: targetId,
            label: 'LOCATED_IN',
            properties: {}
          });
        }
        
        // Person KNOWS Person
        if (entities[source].type === 'Person' && 
            entities[target].type === 'Person' && 
            text.includes(`${source} knows ${target}`)) {
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

// Main graph generation function using Claude
async function generateGraphFromText(text: string, options: any) {
  try {
    // Use Claude API for AI-powered graph generation
    return await generateGraphWithClaude(text, options);
  } catch (error) {
    console.error("Error using Claude API for graph generation:", error);
    console.log("Falling back to regex-based generation");
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
