import { useState, useEffect } from "react";

// Simple strategy prompt component
interface SimpleStrategyPromptProps {
  graph: any | null;
  selectedNodeId?: string;
  onWebSearch?: (nodeId: string, query: string) => void;
  isSearching?: boolean;
}

export default function SimpleStrategyPrompt({
  graph,
  selectedNodeId,
  onWebSearch,
  isSearching = false
}: SimpleStrategyPromptProps) {
  const [promptText, setPromptText] = useState<string>("");
  
  const selectedNode = selectedNodeId && graph ? 
    graph.nodes.find((node: any) => node.id === selectedNodeId) : 
    null;
    
  // Generate graph summary
  const generateGraphSummary = () => {
    if (!graph) return "";
    
    // Get unique node types and edge labels safely using Array.from
    const nodeTypes = Array.from(new Set(graph.nodes.map((node: any) => node.type)));
    const edgeLabels = Array.from(new Set(graph.edges.map((edge: any) => edge.label)));
    
    return `
Graph Summary:
- ${graph.nodes.length} nodes (entities)
- ${graph.edges.length} relationships
- Primary node types: ${nodeTypes.slice(0, 5).join(', ')}
- Main relationship types: ${edgeLabels.slice(0, 5).join(', ')}
`.trim();
  };

  // Get node context for the selected node
  const getNodeContext = (nodeId: string) => {
    if (!graph) return "";
    
    // Find the node
    const node = graph.nodes.find((n: any) => n.id === nodeId);
    if (!node) return "Node not found";
    
    // Get connected nodes and their relationships
    const connectedEdges = graph.edges.filter(
      (edge: any) => edge.source === nodeId || edge.target === nodeId
    );
    
    const connections = connectedEdges.map((edge: any) => {
      const isSource = edge.source === nodeId;
      const otherNodeId = isSource ? edge.target : edge.source;
      const otherNode = graph.nodes.find((n: any) => n.id === otherNodeId);
      if (!otherNode) return null;
      
      return {
        direction: isSource ? "outgoing" : "incoming",
        relationship: edge.label,
        node: otherNode,
        edgeId: edge.id
      };
    }).filter(Boolean);
    
    // Format the context
    const nodeContext = `
Selected Node: ${node.properties.name || node.id} (${node.type})
Properties: ${Object.entries(node.properties)
  .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
  .join(', ')}

Connected to:
${connections.length === 0 ? "No connections" : connections.map((conn: any) => 
  `- ${conn?.direction === "outgoing" ? "→" : "←"} ${conn?.node.properties.name || conn?.node.id} (${conn?.node.type}) [${conn?.relationship}]`
).join('\n')}
`.trim();
    
    return nodeContext;
  };
  
  // Generate ontology patterns
  const generateOntologyPatterns = () => {
    if (!graph) return "No graph available";
    
    // Extract node types and their frequency
    const nodeTypes: Record<string, number> = {};
    graph.nodes.forEach((node: any) => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });
    
    // Extract relationship patterns
    const relationshipPatterns: Record<string, number> = {};
    graph.edges.forEach((edge: any) => {
      const sourceNode = graph.nodes.find((n: any) => n.id === edge.source);
      const targetNode = graph.nodes.find((n: any) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;
      
      const pattern = `${sourceNode.type} -[${edge.label}]-> ${targetNode.type}`;
      relationshipPatterns[pattern] = (relationshipPatterns[pattern] || 0) + 1;
    });
    
    // Format the ontology
    return `
Node Types:
${Object.entries(nodeTypes)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${type} (${count})`)
  .join('\n')}

Relationship Patterns:
${Object.entries(relationshipPatterns)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([pattern, count]) => `- ${pattern} (${count})`)
  .join('\n')}
`.trim();
  };
  
  // Update prompt text when graph or selected node changes
  useEffect(() => {
    if (!graph) {
      setPromptText("Generate a graph first to use the strategy prompt.");
      return;
    }
    
    const basicIntro = "I'm exploring a knowledge graph and need strategic insights about how to expand it.";
    
    let contextSections = [];
    
    contextSections.push(generateGraphSummary());
    
    if (selectedNodeId) {
      contextSections.push(getNodeContext(selectedNodeId));
    }
    
    contextSections.push(generateOntologyPatterns());
    
    const generatedPrompt = `${basicIntro}

${contextSections.join("\n\n")}

Based on this graph structure, can you suggest:
1. What key relationships might be missing?
2. Which entities would be most valuable to explore further?
3. Are there any patterns or clusters that could be expanded?
4. What strategic web searches would help expand this knowledge graph most effectively?`;
    
    setPromptText(generatedPrompt);
  }, [graph, selectedNodeId]);
  
  // Execute web search if node is selected
  const executeWebSearch = () => {
    if (selectedNodeId && onWebSearch) {
      onWebSearch(selectedNodeId, promptText);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-lg font-semibold mb-2">Strategic Graph Prompt</h2>
      <p className="text-sm text-gray-500 mb-4">
        Generate strategic insights for exploring and expanding your knowledge graph
      </p>
      
      <div className="bg-gray-50 p-4 mb-4 border rounded">
        <h3 className="font-medium mb-2">Graph Summary</h3>
        <pre className="text-sm bg-white p-3 border rounded whitespace-pre-wrap">
          {graph ? generateGraphSummary() : "No graph data available"}
        </pre>
      </div>
      
      {selectedNodeId && (
        <div className="bg-gray-50 p-4 mb-4 border rounded">
          <h3 className="font-medium mb-2">Node Context</h3>
          <pre className="text-sm bg-white p-3 border rounded whitespace-pre-wrap">
            {getNodeContext(selectedNodeId)}
          </pre>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 mb-4 border rounded">
        <h3 className="font-medium mb-2">Ontology Patterns</h3>
        <pre className="text-sm bg-white p-3 border rounded whitespace-pre-wrap">
          {graph ? generateOntologyPatterns() : "No graph data available"}
        </pre>
      </div>
      
      <div className="flex-1 flex flex-col">
        <label htmlFor="prompt" className="text-sm font-medium mb-2">
          Strategic Graph Prompt
        </label>
        <textarea
          id="prompt"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="flex-1 min-h-[200px] p-3 border rounded font-mono text-sm resize-none"
          placeholder="Generate a graph first to use the strategy prompt..."
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border rounded text-sm"
            onClick={() => navigator.clipboard.writeText(promptText)}
          >
            Copy to Clipboard
          </button>
          {onWebSearch && selectedNodeId && (
            <button 
              onClick={executeWebSearch} 
              disabled={isSearching || !graph}
              className={`px-4 py-2 rounded text-sm text-white ${isSearching ? 'bg-gray-500' : 'bg-blue-600'}`}
            >
              {isSearching ? 'Running Search...' : 'Run Strategic Search'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}