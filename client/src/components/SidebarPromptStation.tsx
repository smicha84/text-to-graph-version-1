import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GlobeIcon, SearchIcon, RefreshCwIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { Graph, Node } from "@/types/graph";
import { useToast } from "@/hooks/use-toast";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();
  
  // Auto-generate search prompt and suggestions when a node is selected
  useEffect(() => {
    if (selectedNodeId && graph) {
      refreshSuggestions();
    } else {
      // Clear when no node is selected
      setSearchPrompt("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  // Function to generate contextual search suggestions based on node type
  const generateSuggestions = () => {
    if (!selectedNodeId || !graph) return [];
    
    const node = graph.nodes.find(n => n.id === selectedNodeId);
    if (!node) return [];
    
    const suggestions: string[] = [];
    
    // Get node name or label for search
    const nodeName = node.properties.name || node.label;
    
    // Add Wikipedia category suggestion first
    suggestions.push(`${nodeName} Wikipedia categories and classification`);
    
    // Generate type-specific suggestions
    if (node.type.toLowerCase().includes('person')) {
      suggestions.push(`${nodeName} biography and background`);
      suggestions.push(`${nodeName} career achievements and timeline`);
      suggestions.push(`${nodeName} related people and connections`);
    } 
    else if (node.type.toLowerCase().includes('organization') || node.type.toLowerCase().includes('company')) {
      suggestions.push(`${nodeName} company history and founding`);
      suggestions.push(`${nodeName} products and services`);
      suggestions.push(`${nodeName} industry relationships and competitors`);
    } 
    else if (node.type.toLowerCase().includes('location') || node.type.toLowerCase().includes('place')) {
      suggestions.push(`${nodeName} geographic information and coordinates`);
      suggestions.push(`${nodeName} historical significance and events`);
      suggestions.push(`${nodeName} related locations and nearby places`);
    }
    else if (node.type.toLowerCase().includes('event')) {
      suggestions.push(`${nodeName} event details and timeline`);
      suggestions.push(`${nodeName} participants and people involved`);
      suggestions.push(`${nodeName} historical significance and impact`);
    }
    else if (node.type.toLowerCase().includes('product')) {
      suggestions.push(`${nodeName} product specifications and features`);
      suggestions.push(`${nodeName} manufacturer and development history`);
      suggestions.push(`${nodeName} related products and alternatives`);
    }
    else {
      // Generic suggestions for other node types
      suggestions.push(`${nodeName} detailed information and characteristics`);
      suggestions.push(`${nodeName} related concepts and categories`);
      suggestions.push(`${nodeName} historical context and development`);
    }
    
    // Add a targeted search using node context
    try {
      const contextualQuery = generateWebSearchQuery(graph, selectedNodeId);
      suggestions.push(contextualQuery);
    } catch (error) {
      // Skip if there's an error
    }

    return suggestions;
  };

  // Function to prepare the web search prompt using webSearchUtils
  const refreshSuggestions = () => {
    if (!selectedNodeId || !graph) return;
    
    try {
      // Generate a better search query based on the node and its connections
      const searchQuery = generateWebSearchQuery(graph, selectedNodeId);
      setSearchPrompt(searchQuery);
    } catch (error) {
      // Fallback if there's an error with the utility
      const node = graph.nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const nodeName = node.properties.name || node.label;
        setSearchPrompt(`Find detailed information about ${nodeName} (${node.type})`);
      } else {
        setSearchPrompt("Enter search query...");
      }
    }
    
    // Refresh contextual suggestions
    setSuggestedQueries(generateSuggestions());
  };
  
  // Function to use a suggested query
  const useSuggestedQuery = (query: string) => {
    setSearchPrompt(query);
  };

  // Function to execute the web search
  const executeSearch = () => {
    if (selectedNodeId && searchPrompt.trim()) {
      onWebSearch(selectedNodeId, searchPrompt);
    }
  };

  // Always display, even if no node selected
  const selectedNode = selectedNodeId && graph ? 
    graph.nodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GlobeIcon className="mr-2 h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-sm text-gray-700">Web Search Prompt Station</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Node identifier - only show when node is selected */}
        {selectedNode && (
          <div className="mt-2 flex items-center">
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300">
              {selectedNode.type}
            </Badge>
            <span className="ml-2 text-sm font-medium text-gray-600 truncate">
              {selectedNode.properties.name || selectedNode.label}
            </span>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <Textarea
            value={searchPrompt}
            onChange={(e) => setSearchPrompt(e.target.value)}
            placeholder="Enter search query..."
            className="w-full text-sm resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
          
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSuggestions}
              disabled={isSearching}
              className="text-xs"
            >
              <RefreshCwIcon className="mr-1 h-3 w-3" />
              Refresh
            </Button>
            
            <Button
              onClick={executeSearch}
              disabled={isSearching || !searchPrompt.trim()}
              size="sm"
              className="text-xs"
            >
              {isSearching ? (
                <>
                  <RefreshCwIcon className="mr-1 h-3 w-3 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-1 h-3 w-3" />
                  Search Web
                </>
              )}
            </Button>
          </div>
          
          {suggestedQueries.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">Suggested Queries:</h4>
              </div>
              <ScrollArea className="h-32 border rounded bg-white">
                <div className="p-2 space-y-1">
                  {suggestedQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => useSuggestedQuery(query)}
                      className="w-full justify-start text-left text-xs font-normal hover:bg-gray-100 h-auto py-2"
                    >
                      <SearchIcon className="mr-2 h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-2 text-xs">{query}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}