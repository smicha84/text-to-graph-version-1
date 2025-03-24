import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph } from "@/types/graph";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
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
        const nodeLabel = selectedNode.label;
        
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
          <div className="mb-4">
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
          
          <div className="flex-1 overflow-auto">
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
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 w-full max-w-xs">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 mb-3 text-blue-500" />
                    <h3 className="font-medium text-blue-800 mb-1">How to use Web Search</h3>
                    <p className="text-blue-700 text-sm text-center mb-3">
                      Click on any node in your graph to start a web search and expand your graph with new connections.
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded-md w-full">
                      <p className="mb-1"><strong>Tip:</strong> Search results will appear as connected nodes in your graph.</p>
                      <p><strong>Tip:</strong> You can search for any topic related to a node in your graph.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                <InfoIcon className="h-8 w-8 mb-2 opacity-50" />
                <p>No suggested queries available</p>
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
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
              <History className="h-8 w-8 mb-2 opacity-50" />
              <p>No search history yet</p>
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
                  <p className="text-xs text-gray-400">
                    This panel will display real-time updates when you perform a web search
                  </p>
                </div>
              </div>
            )}
            
            <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-md mt-4">
              <h4 className="text-xs font-medium text-blue-700 mb-1">How the Web Search Works</h4>
              <p className="text-xs text-blue-600 mb-2">
                The web search uses Claude to analyze search results and extract entities and relationships.
                Each search is saved with a timestamp and can be viewed in the logs.
              </p>
              <p className="text-center text-xs text-blue-500">
                <a href="/logs" className="hover:underline">View complete logs →</a>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}