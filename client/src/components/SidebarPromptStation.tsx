import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Graph, Node } from "@/types/graph";
import { Globe, Search, PlusCircle, Sparkles, AlertTriangle, History, Loader2 } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [promptContext, setPromptContext] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Update the prompt context whenever the selected node changes
  useEffect(() => {
    if (selectedNodeId && graph) {
      const node = graph.nodes.find(n => n.id === selectedNodeId);
      if (node) {
        setSelectedNode(node);
        // Build a context string based on the node properties
        const nodeName = node.properties.name || node.label;
        const nodeType = node.labelDetail || node.type;
        
        // Get a list of connected nodes to provide richer context
        const connectedNodes = graph.edges
          .filter(e => e.source === node.id || e.target === node.id)
          .map(e => {
            const connectedId = e.source === node.id ? e.target : e.source;
            const connectedNode = graph.nodes.find(n => n.id === connectedId);
            const relationLabel = e.label;
            if (connectedNode) {
              const connectedName = connectedNode.properties.name || connectedNode.label;
              const connectedType = connectedNode.labelDetail || connectedNode.type;
              return `${nodeName} ${relationLabel} ${connectedName} (${connectedType})`;
            }
            return null;
          })
          .filter(Boolean)
          .join("\n");
        
        // Build a rich context string
        let context = `Node: ${nodeName} (${nodeType})\n`;
        if (Object.keys(node.properties).length > 0) {
          context += "Properties:\n";
          Object.entries(node.properties).forEach(([key, value]) => {
            if (key !== 'name') { // Skip name as it's already in the title
              context += `- ${key}: ${value}\n`;
            }
          });
        }
        
        if (connectedNodes) {
          context += "\nConnections:\n" + connectedNodes;
        }
        
        setPromptContext(context);
        
        // Generate suggested queries based on node type
        generateSuggestedQueries(node);
      } else {
        setSelectedNode(null);
        setPromptContext("");
        setSuggestedQueries([]);
      }
    } else {
      setSelectedNode(null);
      setPromptContext("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  // Generate suggested queries based on the node type
  const generateSuggestedQueries = (node: Node) => {
    const nodeName = node.properties.name || node.label;
    const nodeType = node.labelDetail || node.type;
    
    const suggestions: string[] = [];
    
    // Common queries for all node types
    suggestions.push(`Tell me more about ${nodeName}`);
    
    // Type-specific query suggestions
    switch(nodeType.toLowerCase()) {
      case 'person':
        suggestions.push(`${nodeName}'s biography`);
        suggestions.push(`${nodeName}'s career highlights`);
        suggestions.push(`${nodeName}'s education background`);
        break;
      case 'company':
      case 'organization':
        suggestions.push(`${nodeName} business overview`);
        suggestions.push(`${nodeName} key products and services`);
        suggestions.push(`${nodeName} leadership team`);
        break;
      case 'technology':
      case 'software':
      case 'hardware':
        suggestions.push(`${nodeName} technical specifications`);
        suggestions.push(`How does ${nodeName} work`);
        suggestions.push(`${nodeName} compared to alternatives`);
        break;
      case 'location':
      case 'city':
      case 'country':
        suggestions.push(`${nodeName} key facts and information`);
        suggestions.push(`${nodeName} history and background`);
        suggestions.push(`${nodeName} important landmarks`);
        break;
      case 'event':
        suggestions.push(`What happened at ${nodeName}`);
        suggestions.push(`${nodeName} important dates`);
        suggestions.push(`${nodeName} key participants`);
        break;
      default:
        suggestions.push(`Details about ${nodeName}`);
        suggestions.push(`${nodeName} in context of ${nodeType}`);
        suggestions.push(`${nodeName} history and development`);
    }
    
    setSuggestedQueries(suggestions);
  };

  const handleSearch = () => {
    if (selectedNodeId && searchQuery.trim()) {
      onWebSearch(selectedNodeId, searchQuery.trim());
    }
  };

  const handleSuggestionSelect = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-1">
          <Globe className="mr-2 h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Web Search</h2>
        </div>
        <p className="text-xs text-gray-500">
          Search the web to expand your graph with new connected entities
        </p>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {!selectedNodeId && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <p className="text-sm text-gray-600">
                  Select a node from the graph to perform a web search
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {selectedNodeId && selectedNode && (
          <>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" 
                       style={{ backgroundColor: selectedNode ? (NODE_COLORS[selectedNode.type] || NODE_COLORS.default) : '#777' }} />
                  Selected Node
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{selectedNode.properties.name || selectedNode.label}</div>
                  <Badge variant="outline">{selectedNode.labelDetail || selectedNode.type}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Query</label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type your search query..."
                    disabled={isSearching}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()} 
                    size="sm"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {suggestedQueries.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                    Suggested Queries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((query, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSuggestionSelect(query)}
                      >
                        {query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center">
                  <PlusCircle className="h-4 w-4 mr-1 text-blue-500" />
                  Context for Web Search
                </label>
                <Textarea 
                  value={promptContext} 
                  readOnly 
                  className="h-48 text-xs opacity-75 resize-none bg-gray-50"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Node colors based on node type
const NODE_COLORS: Record<string, string> = {
  // Person types
  'Person': '#3B82F6',       // primary blue
  'Employee': '#4F46E5',     // indigo
  'Entrepreneur': '#8B5CF6', // purple
  'Investor': '#EC4899',     // pink
  'Expert': '#0EA5E9',       // sky blue
  
  // Organization types
  'Company': '#10B981',      // emerald
  'Organization': '#059669', // green
  'Institute': '#14B8A6',    // teal
  'Agency': '#0D9488',       // teal dark
  
  // Location types
  'Location': '#F59E0B',     // amber
  'City': '#F97316',         // orange
  'Country': '#EA580C',      // orange dark
  
  // Content types
  'Document': '#EF4444',     // red
  'Article': '#DC2626',      // red dark
  'Product': '#F43F5E',      // rose
  'Service': '#E11D48',      // rose dark
  
  // Event types
  'Event': '#6366F1',        // indigo
  'Conference': '#4F46E5',   // indigo dark
  
  // Technology types
  'Technology': '#06B6D4',   // cyan
  'Software': '#0891B2',     // cyan dark
  'Hardware': '#0891B2',     // cyan dark
  
  // Resource types
  'Resource': '#A78BFA',     // violet
  'Material': '#8B5CF6',     // violet dark
  
  // Default color for unknown types
  'default': '#6B7280'       // gray-500
};