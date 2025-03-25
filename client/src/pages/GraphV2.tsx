import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import GraphPanel from "@/components/GraphPanel";
import SidebarPromptStation from "@/components/SidebarPromptStation";
import StrategyPrompt from "@/components/StrategyPrompt";
import WikipediaTaxonomyPanel from "@/components/WikipediaTaxonomyPanel";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getNodeDisplayLabel, getEdgeDisplayLabel } from "@/lib/displayUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph, GraphGenerationOptions, Node, Edge, WebSearchOptions, ExportOptions } from "@/types/graph";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2, PanelLeftOpen, PanelLeftClose, DatabaseIcon, NetworkIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ExportModal from "@/components/ExportModal";

// Helper function to determine if an element is a Node (not an Edge)
function isNode(element: Node | Edge | null): element is Node {
  return element !== null && !('source' in element);
}

export default function GraphV2() {
  const [text, setText] = useState("");
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    generateOntology: false,
    model: "claude",
    useEntityMergingLLM: true,
    useEntityTypeLLM: true,
    useRelationInferenceLLM: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  // Mutation for graph generation
  const generateMutation = useMutation({
    mutationFn: async ({ text, options }: { text: string, options: GraphGenerationOptions }) => {
      const response = await apiRequest('POST', '/api/generate-graph-v2', {
        text,
        options
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to generate graph");
      }
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setGraph(data);
      toast({
        title: "Graph generated successfully",
        description: `Created ${data.nodes.length} nodes and ${data.edges.length} edges.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating graph",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for web search
  const webSearchMutation = useMutation({
    mutationFn: async ({ nodeId, query }: WebSearchOptions) => {
      if (!graph) throw new Error("No graph data available for search");
      
      const response = await apiRequest('POST', '/api/web-search', {
        query,
        nodeId,
        graph
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to perform web search");
      }
      
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setGraph(data);
      toast({
        title: "Web search completed",
        description: `Graph expanded with search results. Now has ${data.nodes.length} nodes and ${data.edges.length} edges.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error performing web search",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // For graph export
  const exportMutation = useMutation<any, Error, ExportOptions>({
    mutationFn: async ({ format, includeProperties, includeStyles }: ExportOptions) => {
      const response = await apiRequest('POST', '/api/export-graph', {
        format,
        graph,
        includeProperties,
        includeStyles
      });
      
      if (!response.ok) {
        throw new Error("Failed to export graph");
      }
      
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateGraph = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a graph",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ text, options });
  };
  
  const handleExportGraph = (exportOptions: ExportOptions) => {
    if (!graph) return;
    exportMutation.mutate(exportOptions);
  };
  
  const handleWebSearch = (nodeId: string, query: string) => {
    webSearchMutation.mutate({ nodeId, query });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar for prompt station */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-y-auto bg-gray-50 border-r h-full`}>
          {sidebarOpen && (
            <div className="p-4">
              <h3 className="font-semibold mb-4 flex items-center justify-between">
                Prompt Station
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(false)}
                  className="h-7 w-7"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </h3>
              
              <SidebarPromptStation 
                onWebSearch={handleWebSearch}
                isSearching={webSearchMutation.isPending}
                selectedNodeId={isNode(selectedElement) ? selectedElement.id : undefined}
                graph={graph}
              />
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSidebarOpen(true)}
                    className="mr-2"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-3xl font-bold">Graph Generation V2</h1>
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Experimental
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Text</CardTitle>
                    <CardDescription>
                      Enter the text you want to convert into a graph structure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter text to analyze..."
                      className="min-h-[200px]"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      {text.length} characters
                    </div>
                    <Button 
                      onClick={handleGenerateGraph} 
                      disabled={generateMutation.isPending || !text.trim()}
                    >
                      {generateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generate Graph
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Options</CardTitle>
                    <CardDescription>
                      Customize how the graph is generated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="extract-entities">Extract Entities</Label>
                      <Switch
                        id="extract-entities"
                        checked={options.extractEntities}
                        onCheckedChange={(checked) => 
                          setOptions({...options, extractEntities: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="extract-relations">Extract Relations</Label>
                      <Switch
                        id="extract-relations"
                        checked={options.extractRelations}
                        onCheckedChange={(checked) => 
                          setOptions({...options, extractRelations: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="infer-properties">Infer Properties</Label>
                      <Switch
                        id="infer-properties"
                        checked={options.inferProperties}
                        onCheckedChange={(checked) => 
                          setOptions({...options, inferProperties: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="merge-entities">Merge Similar Entities</Label>
                      <Switch
                        id="merge-entities"
                        checked={options.mergeEntities}
                        onCheckedChange={(checked) => 
                          setOptions({...options, mergeEntities: checked})
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Graph Visualization Panel */}
            {graph && (
              <div className="mb-6">
                <GraphPanel
                  graph={graph}
                  isLoading={generateMutation.isPending || webSearchMutation.isPending}
                  onElementSelect={setSelectedElement}
                  onShowExportModal={() => setShowExportModal(true)}
                  onWebSearch={handleWebSearch}
                />
              </div>
            )}
            
            {/* Strategy Prompt Area */}
            {graph && (
              <div className="mb-6">
                <Card>
                  <CardContent className="p-0">
                    <StrategyPrompt
                      graph={graph}
                      selectedNodeId={isNode(selectedElement) ? selectedElement?.id : undefined}
                      onWebSearch={handleWebSearch}
                      isSearching={webSearchMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Wikipedia Taxonomy Panel */}
            {graph && (
              <div className="mb-6">
                <WikipediaTaxonomyPanel 
                  graph={graph}
                  onUpdateGraph={(updatedGraph) => setGraph(updatedGraph)}
                />
              </div>
            )}
            
            {/* Tabular representation of the graph */}
            {graph && (
              <div className="mt-8">
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle>Graph Data</CardTitle>
                    <CardDescription>
                      Generated {graph.nodes.length} nodes and {graph.edges.length} edges
                      {graph.metadata && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          V2 Enhanced
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="nodes">
                      <TabsList>
                        <TabsTrigger value="nodes">Nodes ({graph.nodes.length})</TabsTrigger>
                        <TabsTrigger value="edges">Edges ({graph.edges.length})</TabsTrigger>
                        {graph.metadata && (
                          <TabsTrigger value="metadata">Metadata</TabsTrigger>
                        )}
                        <TabsTrigger value="json">Raw JSON</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="nodes" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {graph.nodes.map(node => (
                            <Card 
                              key={node.id} 
                              className={`border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                selectedElement && 'id' in selectedElement && selectedElement.id === node.id 
                                  ? 'ring-2 ring-primary' 
                                  : ''
                              }`}
                              onClick={() => setSelectedElement(node)}
                            >
                              <CardHeader className="p-3 pb-1 bg-gray-50">
                                <CardTitle className="text-md">{getNodeDisplayLabel(node)}</CardTitle>
                                <CardDescription className="text-xs">Type: {node.type}</CardDescription>
                              </CardHeader>
                              <CardContent className="p-3 pt-2">
                                <div className="text-sm">
                                  <strong>Properties:</strong>
                                  <ul className="list-disc list-inside mt-1 space-y-1">
                                    {Object.entries(node.properties).map(([key, value]) => (
                                      <li key={key} className="text-xs">
                                        <span className="font-medium">{key}:</span> {String(value)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                              {node.properties.source === "web search result" && (
                                <div className="bg-blue-50 px-3 py-1 text-xs text-blue-700 border-t">
                                  From Web Search
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="edges" className="mt-4">
                        <div className="space-y-2">
                          {graph.edges.map(edge => (
                            <div 
                              key={edge.id} 
                              className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                                selectedElement && 'source' in selectedElement && selectedElement.id === edge.id 
                                  ? 'bg-gray-100 border-primary' 
                                  : ''
                              }`}
                              onClick={() => setSelectedElement(edge)}
                            >
                              <div className="w-1/3 font-medium truncate">
                                {graph.nodes.find(n => n.id === edge.source) ? 
                                  getNodeDisplayLabel(graph.nodes.find(n => n.id === edge.source)!) : edge.source}
                              </div>
                              <div className="flex-1 flex justify-center items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                                  {getEdgeDisplayLabel(edge)}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="w-1/3 text-right font-medium truncate">
                                {graph.nodes.find(n => n.id === edge.target) ? 
                                  getNodeDisplayLabel(graph.nodes.find(n => n.id === edge.target)!) : edge.target}
                              </div>
                              {edge.properties.source === "web search result" && (
                                <div className="ml-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                                  Web
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      {graph.metadata && (
                        <TabsContent value="metadata" className="mt-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="space-y-2">
                                {Object.entries(graph.metadata).map(([key, value]) => (
                                  <div key={key} className="flex border-b pb-2">
                                    <div className="w-1/3 font-medium">{key}</div>
                                    <div className="w-2/3">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}
                      
                      <TabsContent value="json" className="mt-4">
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm">
                          {JSON.stringify(graph, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Export modal */}
      {showExportModal && (
        <ExportModal
          graph={graph}
          onExport={handleExportGraph}
          onClose={() => setShowExportModal(false)}
          isExporting={exportMutation.isPending}
        />
      )}
    </div>
  );
}