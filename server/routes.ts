import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateGraphInputSchema, exportGraphSchema } from "@shared/schema";
import { storage } from "./storage";
import { generateGraphWithClaude } from "./anthropic";

// Main graph generation function using Claude API
async function generateGraphFromText(text: string, options: any) {
  console.log("Using Claude API for graph generation");
  return await generateGraphWithClaude(text, options);
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
