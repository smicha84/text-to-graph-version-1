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
  
  // Extract primary node information
  const nodeInfo = `${node.label}${node.type ? ` (${node.type})` : ''}: ${node.properties.name || 'Unknown'}`;
  
  // Extract connections information
  const connections = connectedEdges.map(edge => {
    const isOutgoing = edge.source === nodeId;
    const connectedNodeId = isOutgoing ? edge.target : edge.source;
    const connectedNode = connectedNodes.find(n => n.id === connectedNodeId);
    
    if (!connectedNode) return null;
    
    const direction = isOutgoing ? '->' : '<-';
    const relationship = edge.label;
    const nodeName = connectedNode.properties.name || connectedNode.label;
    const nodeType = connectedNode.type ? ` (${connectedNode.type})` : '';
    
    // Include edge properties if they exist
    let propString = '';
    if (Object.keys(edge.properties).length > 0) {
      propString = Object.entries(edge.properties)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      propString = ` [${propString}]`;
    }
    
    return `${direction} ${relationship}${propString} ${nodeName}${nodeType}`;
  }).filter(Boolean).join('\n');
  
  // Format the full query
  return `Search for information about ${nodeInfo}\n\nRelationships:\n${connections}`;
}