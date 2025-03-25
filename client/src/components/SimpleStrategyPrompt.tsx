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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 border rounded-lg shadow-sm">
          <h3 className="text-md font-semibold flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Graph Summary
          </h3>
          <div className="bg-gray-50 p-3 border rounded-md text-sm font-mono whitespace-pre-wrap text-gray-700">
            {graph && graph.nodes ? generateGraphSummary() : "No graph data available"}
          </div>
        </div>
        
        <div className="bg-white p-4 border rounded-lg shadow-sm">
          <h3 className="text-md font-semibold flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
            Ontology Patterns
          </h3>
          <div className="bg-gray-50 p-3 border rounded-md text-sm font-mono whitespace-pre-wrap text-gray-700">
            {graph && graph.nodes ? generateOntologyPatterns() : "No graph data available"}
          </div>
        </div>
      </div>
      
      {selectedNodeId && (
        <div className="mb-4 bg-white p-4 border rounded-lg shadow-sm">
          <h3 className="text-md font-semibold flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Selected Node Context
          </h3>
          <div className="bg-gray-50 p-3 border rounded-md text-sm font-mono whitespace-pre-wrap text-gray-700">
            {getNodeContext(selectedNodeId)}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col bg-white p-4 border rounded-lg shadow-sm">
        <label htmlFor="prompt" className="flex items-center text-md font-semibold mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Strategic Query Builder
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Edit this prompt to generate strategic insights or run a web search with the selected node
        </p>
        <textarea
          id="prompt"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="flex-1 min-h-[180px] p-3 border rounded-md font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          placeholder="Generate a graph first to use the strategy prompt..."
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition duration-150 flex items-center"
            onClick={() => navigator.clipboard.writeText(promptText)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </button>
          {onWebSearch && selectedNodeId && (
            <button 
              onClick={executeWebSearch} 
              disabled={isSearching || !graph || !graph.nodes}
              className={`px-4 py-2 rounded-md text-sm text-white flex items-center ${isSearching ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} transition duration-150`}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Run Strategic Search
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}