export interface Node {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  subgraphIds?: string[];
  labelDetail?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
  subgraphIds?: string[];
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  subgraphCounter?: number;
  metadata?: Record<string, any>;
}