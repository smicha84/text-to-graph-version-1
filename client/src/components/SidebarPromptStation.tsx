import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph } from "@/types/graph";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { getNodeDisplayLabel } from "@/lib/displayUtils";
import { Globe, Search, ArrowRight, History, InfoIcon, BrainCircuit, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useApiOperationStatus } from "@/hooks/use-api-logs";

interface SidebarPromptStationProps {
  onWebSearch: (nodeId: string, query: string) => void;
  isSearching: boolean;
  selectedNodeId?: string;
  graph: Graph | null;
}

export default function SidebarPromptStation({
  onWebSearch,
  isSearching,
  selectedNodeId,
  graph
}: SidebarPromptStationProps) {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  
  // Search history to show recently used prompts
  const [searchHistory, setSearchHistory] = useState<{nodeId: string, query: string, timestamp: Date}[]>([]);
  
  // Use the API logs hook to track web search operations
  const { 
    status, 
    metrics, 
    lastActivity 
  } = useApiOperationStatus('web_search');

  // Update suggestions when selected node changes
  useEffect(() => {
    if (selectedNodeId && graph) {
      // Generate a default search query based on the selected node
      const defaultQuery = generateWebSearchQuery(graph, selectedNodeId);
      setSearchPrompt(defaultQuery);
      
      // Generate suggested queries based on node type and connections
      const selectedNode = graph.nodes.find(node => node.id === selectedNodeId);
      if (selectedNode) {
        const nodeType = selectedNode.type.toLowerCase();
        const nodeLabel = getNodeDisplayLabel(selectedNode);
        
        // Create contextual suggestions based on node type
        const suggestions: string[] = [];
        
        if (nodeType.includes('person')) {
          suggestions.push(`${nodeLabel} biography`);
          suggestions.push(`${nodeLabel} career achievements`);
          suggestions.push(`${nodeLabel} relationships`);
        } else if (nodeType.includes('organization') || nodeType.includes('company')) {
          suggestions.push(`${nodeLabel} history`);
          suggestions.push(`${nodeLabel} products or services`);
          suggestions.push(`${nodeLabel} key people`);
        } else if (nodeType.includes('location') || nodeType.includes('place')) {
          suggestions.push(`${nodeLabel} geography`);
          suggestions.push(`Important landmarks in ${nodeLabel}`);
          suggestions.push(`${nodeLabel} historical significance`);
        } else if (nodeType.includes('event')) {
          suggestions.push(`${nodeLabel} timeline`);
          suggestions.push(`Key participants in ${nodeLabel}`);
          suggestions.push(`Impact of ${nodeLabel}`);
        } else if (nodeType.includes('concept') || nodeType.includes('idea')) {
          suggestions.push(`${nodeLabel} definition`);
          suggestions.push(`${nodeLabel} applications`);
          suggestions.push(`History of ${nodeLabel}`);
        } else {
          // Generic suggestions
          suggestions.push(`${nodeLabel} detailed information`);
          suggestions.push(`${nodeLabel} key characteristics`);
          suggestions.push(`${nodeLabel} related topics`);
        }
        
        // Always add Wikipedia category search as a suggestion
        suggestions.push(`Wikipedia categories for ${nodeLabel}`);
        
        setSuggestedQueries(suggestions);
      } else {
        setSuggestedQueries([]);
      }
    } else {
      // Don't clear the search prompt if no node is selected - allow free-form search
      // setSearchPrompt("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  const handleSearch = () => {
    if (selectedNodeId && searchPrompt.trim()) {
      // Add to search history
      setSearchHistory(prev => [
        { nodeId: selectedNodeId, query: searchPrompt.trim(), timestamp: new Date() },
        ...prev.slice(0, 9) // Keep only the 10 most recent searches
      ]);
      
      // Switch to live view tab to show progress
      setActiveTab("live");
      
      // Execute the search
      onWebSearch(selectedNodeId, searchPrompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-1">
          <Globe className="mr-2 h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Web Search</h2>
        </div>
        <p className="text-xs text-gray-500">
          {selectedNodeId 
            ? "Search the web to expand your graph with new connections" 
            : "Select a node from the graph to enable web search"}
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="live">
            Live View
            {status === 'loading' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col p-4 pt-2">
          {/* Search input fixed at the top */}
          <div className="mb-6 sticky top-0 z-10 bg-white pt-1 pb-3">
            <div className="relative">
              <Input
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedNodeId ? "Enter search query..." : "Select a node to search"}
                className="pr-10"
                disabled={isSearching || !selectedNodeId}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleSearch}
                disabled={isSearching || !selectedNodeId || !searchPrompt.trim()}
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Content area with plenty of margin to avoid overlap */}
          <div className="flex-1 overflow-auto mt-2">
            {suggestedQueries.length > 0 ? (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Suggested Queries</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ul className="space-y-1">
                    {suggestedQueries.map((query, index) => (
                      <li key={index}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-sm p-2 h-auto"
                          onClick={() => {
                            setSearchPrompt(query);
                            // Optional: immediately search with this query
                            // onWebSearch(selectedNodeId, query);
                          }}
                        >
                          <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{query}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : !selectedNodeId ? (
              <div className="flex flex-col items-center mt-6 text-center">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 w-full max-w-xs">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 mb-3 text-blue-500" />
                    <h3 className="font-medium text-blue-800 mb-2">How to use Web Search</h3>
                    <p className="text-blue-700 text-sm text-center mb-4">
                      Click on any node in your graph to start a web search and expand your graph with new connections.
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-md w-full mb-3">
                      <p className="mb-2"><strong>Tip:</strong> Search results will appear as connected nodes in your graph.</p>
                      <p className="mb-2"><strong>Tip:</strong> You can search for any topic related to a node in your graph.</p>
                      <p><strong>Tip:</strong> The ontology-based generation creates more coherent relationships between search results.</p>
                    </div>
                    <div className="text-xs text-purple-600 bg-purple-50 p-3 rounded-md w-full border border-purple-100">
                      <p className="mb-1"><strong>New Feature:</strong> Ontology Generation</p>
                      <p>Enable the <span className="text-purple-800 font-medium">Generate Ontology</span> option in settings for more coherent and consistent search results.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center text-gray-400">
                <InfoIcon className="h-8 w-8 mb-2 opacity-50" />
                <p>No suggested queries available</p>
                <p className="text-xs mt-2 max-w-xs opacity-80">
                  Select a node in your graph to generate queries based on that node's content and relationships.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 overflow-auto p-4 pt-2">
          {searchHistory.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
              {searchHistory.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-sm font-medium truncate">{item.query}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => {
                        if (selectedNodeId) {
                          setSearchPrompt(item.query);
                          setActiveTab("search");
                        }
                      }}
                      disabled={!selectedNodeId}
                    >
                      Use Again
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center text-gray-400">
              <History className="h-8 w-8 mb-2 opacity-50" />
              <p>No search history yet</p>
              <p className="text-xs mt-2 max-w-xs opacity-80">
                Your search history will be displayed here once you perform web searches on nodes in your graph.
              </p>
              <div className="text-xs text-purple-500 bg-purple-50 p-3 rounded-md mt-4 border border-purple-100 max-w-xs">
                <p className="font-medium mb-1">Ontology-based Search</p>
                <p>With ontology generation enabled, your search results will be more coherent and have better semantic connections to existing nodes.</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live" className="flex-1 overflow-auto p-4 pt-2">
          <Card className="mb-4">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <BrainCircuit className="h-4 w-4 mr-2" />
                Current Operation Status
              </CardTitle>
              <Badge 
                variant={
                  status === 'idle' ? 'outline' :
                  status === 'loading' ? 'default' :
                  status === 'complete' ? 'secondary' : 'destructive'
                }
                className={`text-xs ${status === 'complete' ? 'bg-green-500 hover:bg-green-700' : ''}`}
              >
                {status === 'idle' && 'Idle'}
                {status === 'loading' && 'Processing'}
                {status === 'complete' && 'Complete'}
                {status === 'error' && 'Error'}
              </Badge>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Operation:</span>
                  <span className="text-sm font-medium">Web Search</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Model:</span>
                  <span className="text-sm font-medium">{metrics.model || "claude-3-7-sonnet-20250219"}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-sm">Prompt Tokens:</span>
                  <span className="text-sm font-medium">{metrics.promptTokens || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion Tokens:</span>
                  <span className="text-sm font-medium">{metrics.completionTokens || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Tokens:</span>
                  <span className="text-sm font-medium">{metrics.totalTokens || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Processing Time:</span>
                  <span className="text-sm font-medium">{metrics.processingTimeMs ? `${metrics.processingTimeMs}ms` : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-2">
              <Clock size={12} />
              <span>Recent API Activity:</span>
            </div>
            
            {lastActivity ? (
              <div className={`p-3 rounded-md border mb-2 ${
                status === 'loading' ? 'bg-blue-50 border-blue-200' :
                status === 'complete' ? 'bg-green-50 border-green-200' :
                status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-medium ${
                      status === 'loading' ? 'text-blue-700' :
                      status === 'complete' ? 'text-green-700' :
                      status === 'error' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {status === 'loading' && '⟳ Processing...'}
                      {status === 'complete' && '✓ Complete'}
                      {status === 'error' && '✗ Error'}
                      {status === 'idle' && 'Idle'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(lastActivity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{lastActivity.message}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-md text-center mb-2">
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-2">No recent search activity</p>
                  <p className="text-xs text-gray-400 mb-3">
                    This panel will display real-time updates when you perform a web search
                  </p>
                  <div className="text-xs px-3 py-2 bg-purple-50 border border-purple-100 rounded-md text-purple-600 max-w-xs">
                    <p className="mb-1"><span className="text-purple-700 font-medium">New:</span> Enable ontology generation in settings for enhanced search results</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-md mt-4">
              <h4 className="text-xs font-medium text-blue-700 mb-2">How the Web Search Works</h4>
              <div className="text-xs text-blue-600 mb-3 text-left space-y-2">
                <p>
                  <strong>1.</strong> Select a node in your graph to begin a web search.
                </p>
                <p>
                  <strong>2.</strong> Claude analyzes search results and extracts relevant entities and relationships.
                </p>
                <p>
                  <strong>3.</strong> When ontology generation is enabled, Claude creates a domain-specific knowledge framework first.
                </p>
                <p>
                  <strong>4.</strong> Search results are added to your graph as connected nodes with source metadata.
                </p>
                <p>
                  <strong>5.</strong> All searches are saved with timestamps and can be viewed in the logs.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="flex items-center text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs border border-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 2v10h10c0-5.523-4.477-10-10-10Z"/><path d="M12 2a10 10 0 0 0-9.53 13.05L12 2Z"/></svg>
                  Ontology
                </span>
                <span className="px-1">+</span>
                <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-100">
                  <Globe className="h-3 w-3 mr-1" />
                  Web Search
                </span>
                <span className="px-1">=</span>
                <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  Better Results
                </span>
              </div>
              <p className="text-center text-xs text-blue-500 mt-3">
                <a href="/logs" className="hover:underline flex justify-center items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  View complete logs →
                </a>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}