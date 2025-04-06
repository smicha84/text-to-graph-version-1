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
  labelDetail?: string;
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
  metadata?: Record<string, any>; // Metadata for the graph including search history, generation info, etc.
}

export interface GraphGenerationOptions {
  extractEntities: boolean;
  extractRelations: boolean;
  inferProperties: boolean;
  mergeEntities: boolean;
  generateOntology: boolean; // Whether to generate domain ontology before extraction
  generateTaxonomies: boolean; // Whether to generate entity taxonomies for categorical structure
  model: 'claude'; // Only Claude model is supported
  appendMode?: boolean; // Whether to append to existing graph instead of replacing it
  webSearchNode?: string; // ID of the node that triggered a web search
  webSearchQuery?: string; // The query used for web search
  
  // Processing mode toggles - these determine if LLM or algorithmic approaches are used
  // Default is true (use LLM) for all these options
  useEntityMergingLLM: boolean; // Whether to use LLM for entity deduplication/merging (true) or algorithm (false)
  useEntityTypeLLM: boolean; // Whether to use LLM for entity type detection (true) or algorithm (false)
  useRelationInferenceLLM: boolean; // Whether to use LLM for relationship inference (true) or algorithm (false)
  
  // Activity tracking
  processingSteps?: string[]; // Array of processing steps completed
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

export interface WebSearchOptions {
  nodeId: string;
  query: string;
}
