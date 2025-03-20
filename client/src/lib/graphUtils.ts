import { Graph, Node, Edge } from "@/types/graph";

/**
 * Creates a graph JSON representation that can be used for export
 */
export function createGraphJson(graph: Graph, includeProperties: boolean): string {
  if (!includeProperties) {
    // Strip properties if not needed
    const simplifiedGraph = {
      nodes: graph.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type
      })),
      edges: graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      }))
    };
    return JSON.stringify(simplifiedGraph, null, 2);
  }
  
  return JSON.stringify(graph, null, 2);
}

/**
 * Creates a Cypher query representation of the graph
 */
export function createCypherQuery(graph: Graph, includeProperties: boolean): string {
  let cypher = "";
  
  // Create nodes
  graph.nodes.forEach(node => {
    let props = "";
    if (includeProperties && node.properties) {
      props = Object.entries(node.properties)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(", ");
    }
    
    cypher += `CREATE (${node.id}:${node.label} {${props}})\n`;
  });
  
  // Create relationships
  graph.edges.forEach(edge => {
    let props = "";
    if (includeProperties && edge.properties) {
      props = Object.entries(edge.properties)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(", ");
    }
    
    cypher += `CREATE (${edge.source})-[:${edge.label} {${props}}]->(${edge.target})\n`;
  });
  
  return cypher;
}

/**
 * Creates a Gremlin query representation of the graph
 */
export function createGremlinQuery(graph: Graph, includeProperties: boolean): string {
  let gremlin = "";
  
  // Create vertices
  graph.nodes.forEach(node => {
    let propString = "";
    if (includeProperties && node.properties) {
      propString = Object.entries(node.properties)
        .map(([key, value]) => `.property('${key}', ${JSON.stringify(value)})`)
        .join("");
    }
    
    gremlin += `g.addV('${node.label}').property('id', '${node.id}')${propString}\n`;
  });
  
  // Create edges
  graph.edges.forEach(edge => {
    let propString = "";
    if (includeProperties && edge.properties) {
      propString = Object.entries(edge.properties)
        .map(([key, value]) => `.property('${key}', ${JSON.stringify(value)})`)
        .join("");
    }
    
    gremlin += `g.V('${edge.source}').addE('${edge.label}').to(g.V('${edge.target}'))${propString}\n`;
  });
  
  return gremlin;
}

/**
 * Utility function to add positions to nodes if they don't have them
 */
export function layoutGraph(graph: Graph): Graph {
  const nodesWithPositions = graph.nodes.map((node, index) => {
    if (node.x !== undefined && node.y !== undefined) {
      return node;
    }
    
    // Simple circular layout
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    const angle = (2 * Math.PI * index) / graph.nodes.length;
    
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return {
    ...graph,
    nodes: nodesWithPositions
  };
}
