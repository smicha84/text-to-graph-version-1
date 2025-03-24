import { Node, Edge } from "@/types/graph";

/**
 * Extracts a subtype from a type string if it contains parentheses
 * For example, "Person (Employee)" would return "Person" as main type and "Employee" as type2
 * 
 * @param typeString The type string to parse
 * @returns An object with mainType and type2 (subtype) properties
 */
export function parseNodeType(typeString: string): { mainType: string, type2: string | null } {
  if (!typeString) {
    return { mainType: "", type2: null };
  }
  
  // Check if the type contains parentheses with content inside
  const typeMatch = typeString.match(/^(.*?)\s*\((.*?)\)\s*$/);
  
  if (typeMatch && typeMatch[1] && typeMatch[2]) {
    // Return the parts outside and inside parentheses
    return {
      mainType: typeMatch[1].trim(),
      type2: typeMatch[2].trim()
    };
  }
  
  // If no parentheses or invalid format, return the whole string as mainType
  return {
    mainType: typeString.trim(),
    type2: null
  };
}

/**
 * Get a node's type2 value (subtype in parentheses)
 * Checks properties.type2 first, then parses from type if needed
 * 
 * @param node The node to get type2 for
 * @returns The type2 value or null if none exists
 */
export function getNodeType2(node: Node): string | null {
  // First check if type2 is already available in properties
  if (node.properties.type2) {
    return node.properties.type2 as string;
  }
  
  // If not, try to parse it from the type
  const { type2 } = parseNodeType(node.type);
  return type2;
}

/**
 * Get a node's main type (without parenthetical part)
 * 
 * @param node The node to get main type for
 * @returns The main type value
 */
export function getNodeMainType(node: Node): string {
  // Parse the node type
  const { mainType } = parseNodeType(node.type);
  return mainType || node.type; // Fallback to full type if parsing failed
}

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
  return `${getNodeMainType(node)} (${node.id.substring(0, 5)})`;
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