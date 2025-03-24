import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph } from "@/types/graph";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { Globe, Search, ArrowRight, History, InfoIcon, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  
  // Sample current prompt info (would be updated in real-time from LLM API)
  const [currentPromptInfo, setCurrentPromptInfo] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    status: "idle" | "loading" | "complete" | "error";
  }>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    model: "claude-3-opus-20240229",
    status: "idle"
  });

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
      
      // Simulate prompt info update
      setCurrentPromptInfo({
        ...currentPromptInfo,
        status: "loading",
        promptTokens: Math.floor(searchPrompt.length / 4) // Rough approximation
      });
      
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

  // Update the status when search completes or starts
  useEffect(() => {
    if (isSearching) {
      setCurrentPromptInfo(prev => ({
        ...prev,
        status: "loading"
      }));
    } else if (currentPromptInfo.status === "loading") {
      // This means we were searching and now we're done
      setCurrentPromptInfo(prev => ({
        ...prev,
        status: "complete",
        completionTokens: Math.floor(Math.random() * 1000) + 500, // Simulate completion tokens
        totalTokens: prev.promptTokens + Math.floor(Math.random() * 1000) + 500
      }));
    }
  }, [isSearching]);

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
          <TabsTrigger value="live">Live View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col p-4 pt-2">
          <div className="mb-4">
            <div className="relative">
              <Input
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedNodeId ? "Enter search query..." : "Select a node first"}
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
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>Select a node to get started with web search</p>
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
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <BrainCircuit className="h-4 w-4 mr-2" />
                Current AI Operation
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium">
                    {currentPromptInfo.status === "idle" && "Idle"}
                    {currentPromptInfo.status === "loading" && (
                      <span className="flex items-center">
                        Processing
                        <div className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      </span>
                    )}
                    {currentPromptInfo.status === "complete" && "Complete"}
                    {currentPromptInfo.status === "error" && "Error"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Model:</span>
                  <span className="text-sm font-medium">{currentPromptInfo.model}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-sm">Prompt Tokens:</span>
                  <span className="text-sm font-medium">{currentPromptInfo.promptTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion Tokens:</span>
                  <span className="text-sm font-medium">{currentPromptInfo.completionTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Tokens:</span>
                  <span className="text-sm font-medium">{currentPromptInfo.totalTokens}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-xs text-gray-500 p-2">
            <p className="mb-2">Recent API Activity:</p>
            <div className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2">
              <p className="font-mono text-xs">
                {isSearching ? (
                  <span className="text-blue-600">⟳ Currently processing web search query...</span>
                ) : searchHistory.length > 0 ? (
                  <span className="text-green-600">✓ Last query completed successfully</span>
                ) : (
                  <span className="text-gray-600">No recent API activity</span>
                )}
              </p>
              <p className="font-mono text-xs mt-1 text-gray-500">
                View the Logs page for complete history
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}