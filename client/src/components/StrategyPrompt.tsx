import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon, ShieldIcon, NetworkIcon, MapIcon, BrainCircuitIcon, SendIcon } from "lucide-react";
import { getNodeDisplayLabel } from "@/lib/displayUtils";
import { Graph, Node, Edge } from "@/types/graph";

interface StrategyPromptProps {
  graph: Graph | null;
  selectedNodeId?: string;
  onWebSearch?: (nodeId: string, query: string) => void;
  isSearching?: boolean;
}

export default function StrategyPrompt({ 
  graph, 
  selectedNodeId, 
  onWebSearch,
  isSearching = false
}: StrategyPromptProps) {
  const [promptText, setPromptText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("strategy");
  const [expandedSections, setExpandedSections] = useState<{
    graphSummary: boolean;
    nodeContext: boolean;
    ontologyPatterns: boolean;
  }>({
    graphSummary: true,
    nodeContext: true,
    ontologyPatterns: false
  });
  
  const selectedNode = selectedNodeId && graph ? 
    graph.nodes.find(node => node.id === selectedNodeId) : 
    null;
    
  // Generate graph summary
  const generateGraphSummary = () => {
    if (!graph) return "";
    
    // Get unique node types and edge labels safely using Array.from
    const nodeTypes = Array.from(new Set(graph.nodes.map(node => node.type)));
    const edgeLabels = Array.from(new Set(graph.edges.map(edge => edge.label)));
    
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
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return "Node not found";
    
    // Get connected nodes and their relationships
    const connectedEdges = graph.edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );
    
    const connections = connectedEdges.map(edge => {
      const isSource = edge.source === nodeId;
      const otherNodeId = isSource ? edge.target : edge.source;
      const otherNode = graph.nodes.find(n => n.id === otherNodeId);
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
Selected Node: ${getNodeDisplayLabel(node)} (${node.type})
Properties: ${Object.entries(node.properties)
  .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
  .join(', ')}

Connected to:
${connections.length === 0 ? "No connections" : connections.map(conn => 
  `- ${conn?.direction === "outgoing" ? "→" : "←"} ${getNodeDisplayLabel(conn?.node as Node)} (${conn?.node.type}) [${conn?.relationship}]`
).join('\n')}
`.trim();
    
    return nodeContext;
  };
  
  // Generate ontology patterns
  const generateOntologyPatterns = () => {
    if (!graph) return "No graph available";
    
    // Extract node types and their frequency
    const nodeTypes: Record<string, number> = {};
    graph.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });
    
    // Extract relationship patterns
    const relationshipPatterns: Record<string, number> = {};
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
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
    
    if (expandedSections.graphSummary) {
      contextSections.push(generateGraphSummary());
    }
    
    if (expandedSections.nodeContext && selectedNodeId) {
      contextSections.push(getNodeContext(selectedNodeId));
    }
    
    if (expandedSections.ontologyPatterns) {
      contextSections.push(generateOntologyPatterns());
    }
    
    const generatedPrompt = `${basicIntro}

${contextSections.join("\n\n")}

Based on this graph structure, can you suggest:
1. What key relationships might be missing?
2. Which entities would be most valuable to explore further?
3. Are there any patterns or clusters that could be expanded?
4. What strategic web searches would help expand this knowledge graph most effectively?`;
    
    setPromptText(generatedPrompt);
  }, [graph, selectedNodeId, expandedSections]);
  
  type SectionKey = 'graphSummary' | 'nodeContext' | 'ontologyPatterns';
  
  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Execute web search if node is selected
  const executeWebSearch = () => {
    if (selectedNodeId && onWebSearch) {
      onWebSearch(selectedNodeId, promptText);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuitIcon size={18} className="text-blue-500" />
          Strategic Graph Prompt
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Load graph data into prompts for strategic exploration and web search
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-gray-200">
          <TabsList className="w-full bg-gray-50 p-0">
            <TabsTrigger 
              value="strategy" 
              className="flex-1 py-2 data-[state=active]:bg-white rounded-none"
            >
              <ShieldIcon size={14} className="mr-1" />
              Strategy Prompt
            </TabsTrigger>
            <TabsTrigger 
              value="context" 
              className="flex-1 py-2 data-[state=active]:bg-white rounded-none"
            >
              <NetworkIcon size={14} className="mr-1" />
              Data Explorer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="strategy" className="flex-1 p-0 mt-0 flex flex-col">
          <div className="p-4 space-y-3 bg-gray-50 border-b">
            <Collapsible 
              open={expandedSections.graphSummary} 
              className="border rounded-md bg-white"
            >
              <CollapsibleTrigger 
                onClick={() => toggleSection('graphSummary')}
                className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 hover:bg-blue-50">Graph</Badge>
                  <span className="font-medium">Graph Summary</span>
                </div>
                {expandedSections.graphSummary ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 text-sm font-mono bg-gray-50 border-t">
                {graph ? generateGraphSummary() : "No graph data available"}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={expandedSections.nodeContext} 
              className="border rounded-md bg-white"
              disabled={!selectedNodeId}
            >
              <CollapsibleTrigger 
                onClick={() => toggleSection('nodeContext')}
                className={`flex w-full items-center justify-between px-4 py-2 ${selectedNodeId ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 hover:bg-green-50">Node</Badge>
                  <span className="font-medium">Node Context</span>
                  {!selectedNodeId && <span className="ml-2 text-xs text-gray-500">(Select a node first)</span>}
                </div>
                {expandedSections.nodeContext ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 text-sm font-mono bg-gray-50 border-t">
                {selectedNodeId && graph 
                  ? getNodeContext(selectedNodeId) 
                  : "No node selected"}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={expandedSections.ontologyPatterns} 
              className="border rounded-md bg-white"
            >
              <CollapsibleTrigger 
                onClick={() => toggleSection('ontologyPatterns')}
                className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 bg-purple-50 text-purple-700 hover:bg-purple-50">Patterns</Badge>
                  <span className="font-medium">Ontology Patterns</span>
                </div>
                {expandedSections.ontologyPatterns ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 text-sm font-mono bg-gray-50 border-t">
                {graph ? generateOntologyPatterns() : "No graph data available"}
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="flex-1 p-4 flex flex-col">
            <label htmlFor="prompt" className="text-sm font-medium mb-2 text-gray-700">
              Strategic Graph Prompt
            </label>
            <div className="flex-1 relative flex flex-col">
              <Textarea 
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="flex-1 min-h-[200px] font-mono text-sm resize-none"
                placeholder="Select data sources above to generate a strategic prompt..."
              />
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(promptText)}
                >
                  Copy to Clipboard
                </Button>
                {onWebSearch && selectedNodeId && (
                  <Button 
                    onClick={executeWebSearch} 
                    disabled={isSearching || !graph}
                    className="gap-1"
                  >
                    <SendIcon size={14} />
                    Run Strategic Search
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      
        <TabsContent value="context" className="flex-1 p-4 mt-0 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Graph Data Explorer</CardTitle>
              <CardDescription>
                Explore the raw data in your knowledge graph
              </CardDescription>
            </CardHeader>
            <CardContent>
              {graph ? (
                <Tabs defaultValue="nodes">
                  <TabsList>
                    <TabsTrigger value="nodes">Nodes ({graph.nodes.length})</TabsTrigger>
                    <TabsTrigger value="edges">Edges ({graph.edges.length})</TabsTrigger>
                    {graph.metadata && <TabsTrigger value="metadata">Metadata</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="nodes" className="mt-4">
                    <ScrollArea className="h-[400px] rounded border p-2">
                      <div className="space-y-3">
                        {graph.nodes.map((node) => (
                          <div key={node.id} className="border rounded-md p-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-semibold">{getNodeDisplayLabel(node)}</span>
                              <Badge>{node.type}</Badge>
                            </div>
                            <div className="mt-2 text-xs font-mono overflow-auto max-h-24">
                              {Object.entries(node.properties).map(([key, value]) => (
                                <div key={key} className="flex">
                                  <span className="text-gray-500 min-w-24">{key}:</span>
                                  <span className="whitespace-pre-wrap">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="edges" className="mt-4">
                    <ScrollArea className="h-[400px] rounded border p-2">
                      <div className="space-y-3">
                        {graph.edges.map((edge) => {
                          const source = graph.nodes.find(n => n.id === edge.source);
                          const target = graph.nodes.find(n => n.id === edge.target);
                          
                          return (
                            <div key={edge.id} className="border rounded-md p-3 text-sm">
                              <div className="flex justify-between">
                                <span className="font-mono text-xs">({edge.id})</span>
                                <Badge variant="outline" className="bg-blue-50">{edge.label}</Badge>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                <Badge variant="secondary">{source?.type}</Badge>
                                <span className="font-semibold">{source ? getNodeDisplayLabel(source) : edge.source}</span>
                                <span className="mx-1">→</span>
                                <Badge variant="secondary">{target?.type}</Badge>
                                <span className="font-semibold">{target ? getNodeDisplayLabel(target) : edge.target}</span>
                              </div>
                              
                              {Object.keys(edge.properties).length > 0 && (
                                <div className="mt-2 text-xs font-mono overflow-auto max-h-24">
                                  {Object.entries(edge.properties).map(([key, value]) => (
                                    <div key={key} className="flex">
                                      <span className="text-gray-500 min-w-24">{key}:</span>
                                      <span>
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  {graph.metadata && (
                    <TabsContent value="metadata" className="mt-4">
                      <div className="rounded border p-4 bg-gray-50 font-mono text-sm">
                        <pre>{JSON.stringify(graph.metadata, null, 2)}</pre>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MapIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No graph data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}