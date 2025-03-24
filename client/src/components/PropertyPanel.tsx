import { Node, Edge } from "@/types/graph";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { XIcon, GlobeIcon, SearchIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { getNodeDisplayLabel } from "@/lib/displayUtils";
import { getEdgeDisplayLabel } from "@/lib/displayUtils";
import { Graph } from "@/types/graph";

export interface PropertyPanelProps {
  element: Node | Edge | null;
  onClose: () => void;
  onWebSearch?: (nodeId: string, query: string) => void;
  graph?: Graph | null; // Added graph prop to generate smart queries
}

export default function PropertyPanel({ element, onClose, onWebSearch, graph }: PropertyPanelProps) {
  if (!element) return null;
  
  const isNode = 'type' in element;
  const elementType = isNode ? 'Node' : 'Edge';
  const label = isNode 
    ? `${getNodeDisplayLabel(element as Node)} (${element.type})` 
    : `${getEdgeDisplayLabel(element as Edge)}`;
  
  const properties = element.properties || {};
  const propertyEntries = Object.entries(properties);
  
  // Function to handle custom web search button click
  const handleCustomWebSearch = () => {
    if (isNode && onWebSearch) {
      const nodeElement = element as Node;
      // This will trigger the prompt station in the sidebar with a simple query
      onWebSearch(nodeElement.id, getNodeDisplayLabel(nodeElement) + " " + nodeElement.type);
    }
  };
  
  // Function to handle auto-generated web search button click
  const handleAutoWebSearch = () => {
    if (isNode && onWebSearch && graph) {
      try {
        // Generate a sophisticated search query using node context
        const autoQuery = generateWebSearchQuery(graph, element.id);
        // Execute the search immediately
        onWebSearch(element.id, autoQuery);
      } catch (error) {
        console.error("Error generating auto search query:", error);
        // Fall back to simple search if generation fails
        const nodeElement = element as Node;
        onWebSearch(nodeElement.id, getNodeDisplayLabel(nodeElement) + " " + nodeElement.type);
      }
    }
  };
  
  return (
    <div className="bg-white border-t border-gray-200 overflow-auto h-64">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-800">Properties</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={16} />
          </button>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-sm text-gray-600">{elementType}</span>
          </div>
          
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Label:</span>
            <span className="ml-2 text-sm text-gray-600">{label}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">ID:</span>
            <span className="ml-2 text-sm text-gray-600">{element.id}</span>
          </div>
          
          {!isNode && (
            <>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-gray-700">Source:</span>
                <span className="ml-2 text-sm text-gray-600">{element.source}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-gray-700">Target:</span>
                <span className="ml-2 text-sm text-gray-600">{element.target}</span>
              </div>
            </>
          )}
          
          {/* Web Search Buttons - only for nodes, not edges */}
          {isNode && onWebSearch && (
            <div className="mt-3">
              <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-2">
                <h4 className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center">
                  <GlobeIcon size={12} className="mr-1" />
                  Web Search
                </h4>
                <div className="space-y-2">
                  {/* Auto Web Search Button */}
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={handleAutoWebSearch}
                  >
                    <ZapIcon size={12} />
                    Intelligent Search
                  </Button>
                  
                  {/* Custom Web Search Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={handleCustomWebSearch}
                  >
                    <SearchIcon size={12} />
                    Custom Search
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Search the web for more information about this entity and expand your knowledge graph.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <Separator className="my-3" />
        
        <h4 className="font-medium text-sm text-gray-700 mb-2">Custom Properties</h4>
        {propertyEntries.length > 0 ? (
          <ScrollArea className="h-28">
            <div className="space-y-2">
              {propertyEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-700">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-sm text-gray-500 italic">No custom properties</div>
        )}
      </div>
    </div>
  );
}
