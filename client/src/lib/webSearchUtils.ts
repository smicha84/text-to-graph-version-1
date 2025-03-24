import { Graph, Node, Edge } from "@/types/graph";

/**
 * NOTE: Web search functionality has been removed from this application.
 * This file is kept as a placeholder for future implementation.
 */

/**
 * Get all direct connections (nodes and edges) for a specific node
 * This utility is retained as it might be useful for other purposes.
 */
export function getNodeConnections(graph: Graph, nodeId: string) {
  // Find the node
  const node = graph.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found in graph`);
  }
  
  // Find all connected edges
  const connectedEdges = graph.edges.filter(
    edge => edge.source === nodeId || edge.target === nodeId
  );
  
  // Find all connected nodes
  const connectedNodeIds = new Set<string>();
  connectedEdges.forEach(edge => {
    if (edge.source === nodeId) {
      connectedNodeIds.add(edge.target);
    } else if (edge.target === nodeId) {
      connectedNodeIds.add(edge.source);
    }
  });
  
  const connectedNodes = graph.nodes.filter(node => 
    connectedNodeIds.has(node.id)
  );
  
  return {
    node,
    connectedEdges,
    connectedNodes
  };
}

/**
 * Placeholder function - web search functionality has been removed
 */
export function generateWebSearchQuery(graph: Graph, nodeId: string): string {
  return "Web search functionality has been removed";
}