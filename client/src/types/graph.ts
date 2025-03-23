export interface NodeStyle {
  color?: string;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  labelColor?: string;
  labelSize?: number;
  pinned?: boolean;
}

export interface EdgeStyle {
  color?: string;
  width?: number;
  dashed?: boolean;
  labelColor?: string;
  labelSize?: number;
  arrowSize?: number;
}

export interface Node {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  properties: Record<string, any>;
  subgraphIds?: string[]; // Array of IDs for subgraphs this node belongs to
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
  subgraphIds?: string[]; // Array of IDs for subgraphs this edge belongs to
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  subgraphCounter?: number; // Keeps track of the highest subgraph ID used
}

export interface GraphGenerationOptions {
  extractEntities: boolean;
  extractRelations: boolean;
  inferProperties: boolean;
  mergeEntities: boolean;
  model: 'claude'; // Only Claude model is supported
  appendMode?: boolean; // Whether to append to existing graph instead of replacing it
  
  // Advanced Claude API options
  saveApiCall?: boolean; // Whether to save this API call to history
  thinkingEnabled?: boolean; // Enable Claude "thinking" mode
  thinkingBudget?: number; // Token budget for Claude's thinking
  temperature?: string; // Temperature for generation (0-1)
  systemPrompt?: string; // System instructions for Claude
  customExtractionPrompt?: string; // Custom prompt for extraction (empty = use default)
  apiTemplateId?: number | null; // Reference to a saved API template
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
