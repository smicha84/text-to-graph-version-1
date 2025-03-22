export interface Node {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  properties: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface GraphGenerationOptions {
  extractEntities: boolean;
  extractRelations: boolean;
  inferProperties: boolean;
  mergeEntities: boolean;
  model: 'claude'; // Only Claude model is supported
  appendMode?: boolean; // Whether to append to existing graph instead of replacing it
}

export interface ZoomPanInfo {
  scale: number;
  translateX: number;
  translateY: number;
}

export type ExportFormat = 'png' | 'svg' | 'json' | 'cypher' | 'gremlin';

export interface ExportOptions {
  format: ExportFormat;
  includeProperties: boolean;
  includeStyles: boolean;
}
