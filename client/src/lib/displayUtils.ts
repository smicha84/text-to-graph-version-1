import { Node, Edge } from "@/types/graph";

/**
 * Utility function to derive a display label from a node's properties
 * This centralizes the logic for how labels are generated throughout the UI
 * 
 * @param node The node to derive a label for
 * @returns A string to use as the node's display label
 */
export function getNodeDisplayLabel(node: Node): string {
  // Priority order for display label sources:
  // 1. name property (most common identifier)
  // 2. title property (common for documents, articles)
  // 3. id with type (fallback)
  
  if (node.properties.name) {
    return node.properties.name as string;
  }
  
  if (node.properties.title) {
    return node.properties.title as string;
  }
  
  // For entities with identifiers
  if (node.properties.identifier) {
    return node.properties.identifier as string;
  }
  
  // For locations
  if (node.type === 'Location' && node.properties.address) {
    return node.properties.address as string;
  }
  
  // Generate a label from the most relevant property based on type
  if (node.type === 'Person' && node.properties.firstName && node.properties.lastName) {
    return `${node.properties.firstName} ${node.properties.lastName}`;
  }
  
  // Last resort fallback
  return `${node.type} (${node.id.substring(0, 5)})`;
}

/**
 * Utility function to get the edge relationship label
 * 
 * @param edge The edge to get a display label for
 * @returns A string to use as the edge's display label
 */
export function getEdgeDisplayLabel(edge: Edge): string {
  // Check if the edge has a 'type' or 'relationship' property that describes the connection
  if (edge.properties.relationship) {
    return edge.properties.relationship as string;
  }
  
  if (edge.properties.type) {
    return edge.properties.type as string;
  }
  
  // Use the predicate property if available (common in knowledge graphs)
  if (edge.properties.predicate) {
    return edge.properties.predicate as string;
  }
  
  // Fall back to the most descriptive property available
  if (edge.properties.description) {
    return edge.properties.description as string;
  }
  
  // Default fallback
  return 'related to';
}