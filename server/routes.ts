import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateGraphInputSchema, exportGraphSchema } from "@shared/schema";
import { storage } from "./storage";
import { generateGraphWithClaude, performWebSearch } from "./anthropic";
import { getApiLogs, logApiInteraction } from "./database";

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
  
  // If web search mode, we already have the context in the text format from the performWebSearch function
  // This helps Claude understand the context of the web search better
  const webSearchMode = options.webSearchNode && options.webSearchQuery;
  
  // Pass additional context to Claude to help it understand the source and create better connections
  let textToProcess = text;
  
  // Add appropriate context header based on the mode
  if (webSearchMode) {
    // The text from performWebSearch already includes the context header
    textToProcess = text;
  } else {
    // For normal text processing, just use the text as is
    textToProcess = text;
  }
  
  // Include the graphContext in the options if it exists
  const enhancedOptions = {...options};
  
  // Generate the graph with the contextualized text
  const newGraph = await generateGraphWithClaude(textToProcess, enhancedOptions);
  
  // If append mode is true and we have an existing graph, merge them intelligently
  if (appendMode && existingGraph) {
    console.log("Merging with existing graph");
    return mergeGraphs(existingGraph, newGraph);
  }
  
  return newGraph;
}

// Version 2 of graph generation function with enhanced capabilities
async function generateGraphV2FromText(text: string, options: any) {
  console.log("Using Claude API for graph generation V2");
  
  // In V2, we're using a more sophisticated prompt structure and processing approach
  const enhancedOptions = {
    ...options,
    version: 'v2',
    enhancedProcessing: true
  };
  
  // Use the same core API but with enhanced processing
  const newGraph = await generateGraphWithClaude(text, enhancedOptions);
  
  // Apply additional post-processing specific to V2
  // This is where we would add any V2-specific enhancements
  
  // For example, we might want to automatically apply a hierarchical layout
  if (newGraph && Array.isArray(newGraph.nodes) && Array.isArray(newGraph.edges)) {
    // Add metadata to mark this as a V2 graph
    newGraph.nodes.forEach(node => {
      if (!node.properties) {
        node.properties = {};
      }
      node.properties.generatedBy = 'GraphV2';
    });
    
    // Add generation metadata
    newGraph.metadata = {
      version: 'v2',
      generatedAt: new Date().toISOString(),
      nodeCount: newGraph.nodes.length,
      edgeCount: newGraph.edges.length,
      textLength: text.length
    };
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
  
  // Calculate the graph context for search with improved relevance
  const searchContext = buildGraphContextForSearch(existingGraph, nodeId);
  
  // Set up options for graph generation with enhanced context and ontology-based extraction
  const options = {
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true, // Enable entity merging
    model: 'claude',
    appendMode: true,
    webSearchNode: nodeId,
    webSearchQuery: query,
    graphContext: searchContext, // Pass the graph context to the model
    useEntityMergingLLM: true, // Use the LLM for entity merging
    useEntityTypeLLM: true, // Use the LLM for entity type detection
    useRelationInferenceLLM: true, // Use the LLM for relationship inference
    // Add a processing step to include ontology creation
    processingSteps: ['ontology_creation', 'entity_extraction', 'relationship_mapping'] 
  };
  
  // Perform the web search to get search results with context
  const searchResults = await performWebSearch(query, searchContext);
  
  // Use the search results to generate the graph with the enhanced context
  const graphWithWebResults = await generateGraphFromText(searchResults, options, existingGraph, true);
  
  // Identify original nodes and edges for tracking changes
  const originalNodeIds = new Set(existingGraph.nodes.map((node: any) => node.id));
  const originalEdgeIds = new Set(existingGraph.edges.map((edge: any) => edge.id));
  
  // Create an index of existing nodes by their labels and types for more effective merging
  const existingNodeIndex = new Map();
  existingGraph.nodes.forEach((node: any) => {
    // Create composite keys based on different node attributes for matching
    const labelKey = `label:${node.label.toLowerCase()}`;
    existingNodeIndex.set(labelKey, node);
    
    if (node.properties.name) {
      const nameKey = `name:${node.properties.name.toLowerCase()}`;
      existingNodeIndex.set(nameKey, node);
      
      // Combine label and name for even more specific matching
      const labelNameKey = `label+name:${node.label.toLowerCase()}:${node.properties.name.toLowerCase()}`;
      existingNodeIndex.set(labelNameKey, node);
    }
  });
  
  // Ensure we have a direct connection from the source node to at least one new node
  let hasDirectConnectionToSource = false;
  const newNodeIds = graphWithWebResults.nodes
    .filter((node: any) => !originalNodeIds.has(node.id))
    .map((node: any) => node.id);
  
  // Check if any new edges connect the source node to a new node
  graphWithWebResults.edges.forEach((edge: any) => {
    if (!originalEdgeIds.has(edge.id)) {
      if ((edge.source === nodeId && newNodeIds.includes(edge.target)) ||
          (edge.target === nodeId && newNodeIds.includes(edge.source))) {
        hasDirectConnectionToSource = true;
      }
    }
  });
  
  // If no direct connection exists, create one to the most relevant new node
  if (!hasDirectConnectionToSource && newNodeIds.length > 0) {
    // Find the most relevant new node (could be enhanced with more sophisticated relevance scoring)
    let mostRelevantNodeId = newNodeIds[0]; // Default to first new node
    let mostRelevantNode = graphWithWebResults.nodes.find((n: any) => n.id === mostRelevantNodeId);
    
    // If the source node has a name, try to find a new node with similar characteristics
    if (sourceNode.properties.name) {
      const sourceNameTokens = sourceNode.properties.name.toLowerCase().split(/\s+/);
      
      // Score new nodes by name similarity to source node
      let highestRelevanceScore = 0;
      
      newNodeIds.forEach((newId: string) => {
        const newNode = graphWithWebResults.nodes.find((n: any) => n.id === newId);
        if (newNode?.properties?.name) {
          const newNameTokens = newNode.properties.name.toLowerCase().split(/\s+/);
          
          // Calculate simple token overlap score
          let matchScore = 0;
          sourceNameTokens.forEach((token: string) => {
            if (newNameTokens.some((t: string) => t.includes(token) || token.includes(t))) {
              matchScore++;
            }
          });
          
          // If same type, boost the score
          if (newNode.type === sourceNode.type) {
            matchScore += 2;
          }
          
          if (matchScore > highestRelevanceScore) {
            highestRelevanceScore = matchScore;
            mostRelevantNodeId = newId;
            mostRelevantNode = newNode;
          }
        }
      });
    }
    
    // Create a new edge connecting the source node to the most relevant new node
    const newEdgeId = `e${graphWithWebResults.edges.length + 1}`;
    const relationLabel = determineAppropriateRelation(sourceNode, mostRelevantNode);
    
    graphWithWebResults.edges.push({
      id: newEdgeId,
      source: nodeId,
      target: mostRelevantNodeId,
      label: relationLabel,
      properties: {
        source: "web search result",
        search_query: query,
        search_date: new Date().toISOString(),
        confidence: 0.75,
        auto_connected: true
      },
      subgraphIds: [subgraphId]
    });
    
    console.log(`Created automatic connection from source node ${nodeId} to relevant new node ${mostRelevantNodeId}`);
  }
  
  // Second phase: Perform additional entity merging for new nodes that are similar to existing ones
  // but weren't caught by the initial merging process
  const newNodes = graphWithWebResults.nodes.filter((node: any) => !originalNodeIds.has(node.id));
  
  // Define the structure for node merging info
  interface MergeInfo {
    newNodeId: string;
    existingNodeId: string;
    strength: number;
  }
  
  const nodesToMerge: MergeInfo[] = []; // Track nodes that should be merged into existing ones
  
  // First pass: identify which new nodes should be merged with existing ones
  newNodes.forEach((newNode: any) => {
    // Skip nodes that are already directly connected to the source node
    const isDirectlyConnectedToSource = graphWithWebResults.edges.some((edge: any) => 
      (edge.source === nodeId && edge.target === newNode.id) || 
      (edge.target === nodeId && edge.source === newNode.id));
    
    if (isDirectlyConnectedToSource) {
      return; // Keep direct connections as separate nodes
    }
    
    // Check for name-based matches
    if (newNode.properties.name) {
      const newNodeName = newNode.properties.name.toLowerCase();
      
      // Look for existing nodes with similar names
      for (const existingNode of existingGraph.nodes) {
        if (existingNode.properties.name) {
          const existingName = existingNode.properties.name.toLowerCase();
          
          // Check for exact match or significant overlap
          if (existingName === newNodeName || 
              (existingName.includes(newNodeName) && newNodeName.length > 3) ||
              (newNodeName.includes(existingName) && existingName.length > 3)) {
            
            // Additional check - if same type or label, this is a stronger match
            const isSameType = existingNode.type === newNode.type;
            const isSameLabel = existingNode.label === newNode.label;
            
            if (isSameType || isSameLabel) {
              nodesToMerge.push({
                newNodeId: newNode.id,
                existingNodeId: existingNode.id,
                strength: (isSameType ? 2 : 0) + (isSameLabel ? 2 : 0) + 3 // Base score + bonuses
              });
              break;
            } else {
              // Still a potential match but weaker
              nodesToMerge.push({
                newNodeId: newNode.id,
                existingNodeId: existingNode.id,
                strength: 2 // Lower confidence for different type/label
              });
            }
          }
        }
      }
    }
  });
  
  // Sort merges by strength and merge from highest to lowest confidence
  nodesToMerge.sort((a, b) => b.strength - a.strength);
  
  // Track which nodes have been processed to avoid duplicate merges
  const processedNodes = new Set();
  
  // Second pass: perform the actual merging
  nodesToMerge.forEach((mergeInfo) => {
    if (processedNodes.has(mergeInfo.newNodeId)) {
      return; // Skip if this node has already been processed
    }
    
    const newNode = graphWithWebResults.nodes.find((n: any) => n.id === mergeInfo.newNodeId);
    const existingNode = graphWithWebResults.nodes.find((n: any) => n.id === mergeInfo.existingNodeId);
    
    if (!newNode || !existingNode) {
      return; // Skip if either node can't be found
    }
    
    // Merge properties from new node to existing node
    Object.entries(newNode.properties).forEach(([key, value]) => {
      // Don't overwrite existing values unless they're empty
      if (!existingNode.properties[key] || existingNode.properties[key] === "") {
        existingNode.properties[key] = value;
      }
    });
    
    // Add the subgraph ID from the new node to the existing node
    if (newNode.subgraphIds) {
      if (!existingNode.subgraphIds) {
        existingNode.subgraphIds = [];
      }
      
      newNode.subgraphIds.forEach((sgId: string) => {
        if (!existingNode.subgraphIds.includes(sgId)) {
          existingNode.subgraphIds.push(sgId);
        }
      });
    }
    
    // Update all edges that were connected to the new node to connect to the existing node instead
    graphWithWebResults.edges.forEach((edge: any) => {
      if (edge.source === mergeInfo.newNodeId) {
        edge.source = mergeInfo.existingNodeId;
      }
      if (edge.target === mergeInfo.newNodeId) {
        edge.target = mergeInfo.existingNodeId;
      }
    });
    
    // Mark the new node for removal
    processedNodes.add(mergeInfo.newNodeId);
    
    console.log(`Merged node ${mergeInfo.newNodeId} into existing node ${mergeInfo.existingNodeId}`);
  });
  
  // Remove merged nodes from the graph
  if (processedNodes.size > 0) {
    graphWithWebResults.nodes = graphWithWebResults.nodes.filter((node: any) => 
      !processedNodes.has(node.id));
    
    // Remove duplicate edges that might have been created during merging
    const seenEdges = new Set();
    graphWithWebResults.edges = graphWithWebResults.edges.filter((edge: any) => {
      const edgeKey = `${edge.source}-${edge.label}-${edge.target}`;
      if (seenEdges.has(edgeKey)) {
        return false; // Skip this duplicate edge
      }
      seenEdges.add(edgeKey);
      return true;
    });
  }
  
  // Mark all remaining new nodes as part of the web search subgraph with enhanced metadata
  graphWithWebResults.nodes.forEach((node: any) => {
    if (!originalNodeIds.has(node.id)) {
      if (!node.subgraphIds) {
        node.subgraphIds = [];
      }
      if (!node.subgraphIds.includes(subgraphId)) {
        node.subgraphIds.push(subgraphId);
      }
      
      // Add enhanced metadata to indicate this is from web search
      if (!node.properties) {
        node.properties = {};
      }
      
      // Add the source and search-related metadata
      node.properties.source = "web search result";
      node.properties.search_query = query;
      node.properties.search_date = new Date().toISOString();
      node.properties.source_node_id = nodeId;
      node.properties.source_node_label = sourceNode.label;
      node.properties.source_node_type = sourceNode.type;
      
      // Add structured metadata object for organization
      if (!node.properties.metadata) {
        node.properties.metadata = {};
      }
      
      node.properties.metadata.webSearch = {
        query,
        timestamp: new Date().toISOString(),
        subgraphId,
        originNode: {
          id: nodeId,
          label: sourceNode.label,
          type: sourceNode.type
        }
      };
    }
  });
  
  // Mark all remaining new edges as part of the web search subgraph with enhanced metadata
  graphWithWebResults.edges.forEach((edge: any) => {
    if (!originalEdgeIds.has(edge.id)) {
      if (!edge.subgraphIds) {
        edge.subgraphIds = [];
      }
      if (!edge.subgraphIds.includes(subgraphId)) {
        edge.subgraphIds.push(subgraphId);
      }
      
      // Add enhanced metadata to indicate this is from web search
      if (!edge.properties) {
        edge.properties = {};
      }
      
      // Add the source and search-related metadata
      edge.properties.source = "web search result";
      edge.properties.search_query = query;
      edge.properties.search_date = new Date().toISOString();
      edge.properties.source_node_id = nodeId;
      edge.properties.subgraph_id = subgraphId;
      
      // Add structured metadata object for organization
      if (!edge.properties.metadata) {
        edge.properties.metadata = {};
      }
      
      edge.properties.metadata.webSearch = {
        query,
        timestamp: new Date().toISOString(),
        subgraphId,
        originNode: {
          id: nodeId,
          label: sourceNode.label,
          type: sourceNode.type
        }
      };
      
      // Calculate and set edge confidence if connecting to existing nodes
      const isConnectingExisting = 
        (originalNodeIds.has(edge.source) && !originalNodeIds.has(edge.target)) ||
        (!originalNodeIds.has(edge.source) && originalNodeIds.has(edge.target));
      
      if (isConnectingExisting) {
        edge.properties.confidence = 0.85; // Higher confidence for connections to existing nodes
      } else {
        edge.properties.confidence = 0.7; // Lower for new-to-new connections
      }
    }
  });
  
  // Add search metadata to the graph itself
  if (!graphWithWebResults.metadata) {
    graphWithWebResults.metadata = {};
  }
  
  if (!graphWithWebResults.metadata.searches) {
    graphWithWebResults.metadata.searches = [];
  }
  
  // Record this search operation in graph metadata
  graphWithWebResults.metadata.searches.push({
    query,
    nodeId,
    timestamp: new Date().toISOString(),
    newNodesAdded: graphWithWebResults.nodes.length - existingGraph.nodes.length,
    newEdgesAdded: graphWithWebResults.edges.length - existingGraph.edges.length,
    mergedNodeCount: processedNodes.size,
    subgraphId
  });
  
  return graphWithWebResults;
}

/**
 * Determine an appropriate relation label between two nodes based on their types
 * Using an ontology-based approach for more meaningful and consistent relationships
 */
function determineAppropriateRelation(sourceNode: any, targetNode: any): string {
  // Default relation if nothing else matches
  let relation = "RELATED_TO";
  
  // Get node types in lowercase for easier matching
  const sourceType = (sourceNode.type || "").toLowerCase();
  const targetType = (targetNode.type || "").toLowerCase();
  const sourceLabel = (sourceNode.label || "").toLowerCase();
  const targetLabel = (targetNode.label || "").toLowerCase();
  
  // Use node ontology to determine the most appropriate relationship
  // This improves consistency with the ontology-based graph generation
  
  // Location-based relations
  if (sourceType.includes("location") || sourceLabel.includes("location")) {
    if (targetType.includes("location") || targetLabel.includes("location")) {
      // Location to location
      relation = "CONNECTED_TO";
    } else if (targetType.includes("person") || targetLabel.includes("person")) {
      // Location to person
      relation = "LOCATION_OF";
    } else if (targetType.includes("organization") || targetLabel.includes("organization")) {
      // Location to organization
      relation = "HEADQUARTERS_OF";
    } else if (targetType.includes("event") || targetLabel.includes("event")) {
      // Location to event
      relation = "VENUE_OF";
    }
  }
  // Person-based relations
  else if (sourceType.includes("person") || sourceLabel.includes("person")) {
    if (targetType.includes("location") || targetLabel.includes("location")) {
      // Person to location
      relation = "LIVES_IN";
    } else if (targetType.includes("organization") || targetLabel.includes("organization")) {
      // Person to organization
      relation = "AFFILIATED_WITH";
    } else if (targetType.includes("person") || targetLabel.includes("person")) {
      // Person to person
      relation = "KNOWS";
    } else if (targetType.includes("concept") || targetLabel.includes("concept")) {
      // Person to concept
      relation = "ASSOCIATED_WITH";
    }
  }
  // Organization-based relations
  else if (sourceType.includes("organization") || sourceLabel.includes("organization")) {
    if (targetType.includes("location") || targetLabel.includes("location")) {
      // Organization to location
      relation = "LOCATED_IN";
    } else if (targetType.includes("person") || targetLabel.includes("person")) {
      // Organization to person
      relation = "EMPLOYS";
    } else if (targetType.includes("organization") || targetLabel.includes("organization")) {
      // Organization to organization
      relation = "PARTNERED_WITH";
    }
  }
  // Concept-based relations
  else if (sourceType.includes("concept") || sourceLabel.includes("concept")) {
    relation = "RELATED_TO";
  }
  
  return relation;
}

/**
 * Build a relevant context object to provide to Claude for the web search
 * This helps the model understand the graph structure to make better connections
 */
function buildGraphContextForSearch(graph: any, nodeId: string) {
  // Find the source node
  const sourceNode = graph.nodes.find((node: any) => node.id === nodeId);
  if (!sourceNode) {
    throw new Error(`Source node ${nodeId} not found`);
  }
  
  // Get all edges connected to this node
  const connectedEdges = graph.edges.filter(
    (edge: any) => edge.source === nodeId || edge.target === nodeId
  );
  
  // Get IDs of all nodes directly connected to the source node
  const connectedNodeIds = new Set<string>();
  connectedEdges.forEach((edge: any) => {
    if (edge.source === nodeId) connectedNodeIds.add(edge.target);
    if (edge.target === nodeId) connectedNodeIds.add(edge.source);
  });
  
  // Get the connected nodes
  const connectedNodes = graph.nodes.filter(
    (node: any) => connectedNodeIds.has(node.id)
  );
  
  // Find highest centrality nodes in the graph (simplified)
  // In a full implementation, we would calculate actual centrality metrics
  const centralityNodes = findImportantNodes(graph, 3);
  
  // Build the context object
  return {
    sourceNode,
    directConnections: connectedNodes.map((node: any) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      properties: node.properties
    })),
    relationships: connectedEdges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      properties: edge.properties
    })),
    importantNodes: centralityNodes.map((node: any) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      properties: node.properties
    }))
  };
}

/**
 * Find the most important nodes in the graph based on a simplified centrality measure
 * In a real implementation, this would use proper graph algorithms
 */
function findImportantNodes(graph: any, count: number = 5) {
  // Create a simple map of connection counts to simulate centrality
  const connectionCounts = new Map<string, number>();
  
  // Count the number of connections for each node
  graph.edges.forEach((edge: any) => {
    connectionCounts.set(
      edge.source, 
      (connectionCounts.get(edge.source) || 0) + 1
    );
    connectionCounts.set(
      edge.target, 
      (connectionCounts.get(edge.target) || 0) + 1
    );
  });
  
  // Sort nodes by connection count
  const nodesByImportance = [...graph.nodes].sort((a, b) => {
    const aCount = connectionCounts.get(a.id) || 0;
    const bCount = connectionCounts.get(b.id) || 0;
    return bCount - aCount; // Descending order
  });
  
  // Return the top N nodes or all if fewer
  return nodesByImportance.slice(0, Math.min(count, nodesByImportance.length));
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
    const startTime = Date.now();
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
      
      // Log the request
      await logApiInteraction(
        'request',
        'web_search',
        {
          query,
          nodeId,
          graphStats: {
            nodeCount: graph.nodes.length,
            edgeCount: graph.edges.length
          }
        },
        undefined, // No response data for request log
        200, // Success status code
        0, // No processing time yet
        req.ip,
        req.headers['user-agent']
      );
      
      // Perform web search and expand the graph
      const expandedGraph = await webSearchAndExpandGraph(query, nodeId, graph);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Log the response
      await logApiInteraction(
        'response',
        'web_search',
        undefined, // No request data needed in response log
        {
          query,
          nodeId,
          processingTimeMs: processingTime,
          resultStats: {
            totalNodes: expandedGraph.nodes.length,
            totalEdges: expandedGraph.edges.length,
            newNodesAdded: expandedGraph.nodes.length - graph.nodes.length,
            newEdgesAdded: expandedGraph.edges.length - graph.edges.length
          }
        },
        200,
        processingTime,
        req.ip,
        req.headers['user-agent']
      );
      
      // Return the expanded graph
      res.json(expandedGraph);
    } catch (error) {
      console.error('Error performing web search:', error);
      let errorMessage = 'Failed to perform web search';
      const statusCode = 500;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Log the error
      await logApiInteraction(
        'error',
        'web_search',
        req.body,
        { error: errorMessage },
        statusCode,
        Date.now() - startTime,
        req.ip,
        req.headers['user-agent']
      );
      
      res.status(statusCode).json({ 
        message: 'Failed to perform web search',
        details: errorMessage
      });
    }
  });
  
  // API endpoint for GraphV2 generation
  app.post('/api/generate-graph-v2', async (req, res) => {
    try {
      // Validate request body using the same schema for now
      const { text, options } = generateGraphInputSchema.parse(req.body);
      
      // Generate graph using Claude API with V2 enhancements
      const result = await generateGraphV2FromText(text, options);
      
      // Verify that we have nodes and edges arrays in the result
      if (!result || !Array.isArray(result.nodes) || !Array.isArray(result.edges)) {
        console.error('Invalid graph structure returned from V2:', result);
        return res.status(500).json({ 
          message: 'Generated graph has an invalid structure',
          details: 'The API generated a graph without valid nodes and edges arrays'
        });
      }
      
      // Return the generated graph
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Error generating graph V2:', error);
        let errorMessage = 'Failed to generate graph';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(500).json({ 
          message: 'Failed to generate graph V2',
          details: errorMessage
        });
      }
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
  
  // Test endpoint to create a sample web search log - for testing only
  app.get('/api/create-test-log', async (req, res) => {
    try {
      // Create a request log
      await logApiInteraction(
        'request',
        'web_search',
        {
          query: 'Test web search query',
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 3000,
          temperature: 0.5,
          has_graph_context: true,
          context_size: 500
        },
        undefined,
        200,
        0,
        req.ip,
        req.headers['user-agent']
      );
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a response log
      await logApiInteraction(
        'response',
        'web_search',
        undefined,
        {
          model: 'claude-3-7-sonnet-20250219',
          prompt_tokens: 1250,
          completion_tokens: 950,
          total_tokens: 2200,
          search_results: [
            { title: 'Test Result 1', url: 'https://example.com/1' },
            { title: 'Test Result 2', url: 'https://example.com/2' }
          ]
        },
        200,
        1050,
        req.ip,
        req.headers['user-agent']
      );
      
      res.json({ message: 'Test logs created successfully' });
    } catch (error) {
      console.error('Error creating test logs:', error);
      res.status(500).json({ message: 'Failed to create test logs' });
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
