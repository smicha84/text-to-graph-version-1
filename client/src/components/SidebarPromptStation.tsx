import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph } from "@/types/graph";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { Globe, Search, ArrowRight } from "lucide-react";

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
      setSearchPrompt("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  const handleSearch = () => {
    if (selectedNodeId && searchPrompt.trim()) {
      onWebSearch(selectedNodeId, searchPrompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-2 flex items-center">
        <Globe className="mr-2 h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Web Search</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">
          {selectedNodeId 
            ? "Search the web to expand your graph with new connections." 
            : "Select a node from the graph to enable web search."}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        {selectedNodeId ? (
          <>
            <div className="mb-4">
              <div className="relative">
                <Input
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter search query..."
                  className="pr-10"
                  disabled={isSearching}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleSearch}
                  disabled={isSearching || !searchPrompt.trim()}
                >
                  {isSearching ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {suggestedQueries.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Suggested Queries</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ul className="space-y-2">
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
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p>Select a node to get started with web search</p>
          </div>
        )}
      </div>
    </div>
  );
}