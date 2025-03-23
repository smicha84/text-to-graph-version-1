import { Graph, Node, Edge } from "@/types/graph";

/**
 * Get all direct connections (nodes and edges) for a specific node
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
 * Generate a search query based on a node and its connections
 */
export function generateWebSearchQuery(graph: Graph, nodeId: string): string {
  const { node, connectedEdges, connectedNodes } = getNodeConnections(graph, nodeId);
  
  // Get the node name based on its properties
  const nodeName = node.properties.name 
    || node.properties.title 
    || node.properties.identifier 
    || 'Unknown';
  
  // Collect important properties for context
  const importantProps = [];
  for (const [key, value] of Object.entries(node.properties)) {
    // Skip unimportant or redundant properties
    if (['id', 'type', 'subgraphIds', 'source', 'x', 'y'].includes(key)) continue;
    if (key === 'name' && value === nodeName) continue;
    
    // Add the property if it has a value
    if (value && String(value).trim()) {
      importantProps.push(`${key}: ${value}`);
    }
  }
  
  // Include node type information
  let typeInfo = node.label;
  if (node.type && node.type !== node.label) {
    typeInfo = `${node.label} (${node.type})`;
  }
  
  // Build the base query focused on the node
  let query = `${nodeName} ${typeInfo}`;
  
  // Add important related nodes and relationships for context
  const relationshipTerms: string[] = [];
  
  connectedEdges.forEach(edge => {
    const isOutgoing = edge.source === nodeId;
    const connectedNodeId = isOutgoing ? edge.target : edge.source;
    const connectedNode = connectedNodes.find(n => n.id === connectedNodeId);
    
    if (!connectedNode) return;
    
    const relationship = edge.label.toLowerCase().replace(/_/g, ' ');
    const relatedNodeName = connectedNode.properties.name 
      || connectedNode.properties.title
      || connectedNode.label;
    
    // Format: "related to Company X" or "works for Person Y"
    const term = isOutgoing
      ? `${relationship} ${relatedNodeName}`
      : `${relatedNodeName} ${relationship}`;
    
    relationshipTerms.push(term);
  });
  
  // Add relationship context if available
  if (relationshipTerms.length > 0) {
    query += ` ${relationshipTerms.join(' AND ')}`;
  }
  
  // Add property context if available
  if (importantProps.length > 0) {
    query += ` ${importantProps.join(' ')}`;
  }
  
  // Add details about what we're looking for
  query += ' details information facts';
  
  return query;
}