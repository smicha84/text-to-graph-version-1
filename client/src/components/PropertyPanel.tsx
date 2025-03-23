import { Node, Edge } from "@/types/graph";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";
import { useState } from "react";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";

interface PropertyPanelProps {
  element: Node | Edge | null;
  onClose: () => void;
  onWebSearch?: (nodeId: string, query: string) => void;
}

export default function PropertyPanel({ element, onClose, onWebSearch }: PropertyPanelProps) {
  if (!element) return null;
  
  const isNode = 'type' in element;
  const elementType = isNode ? 'Node' : 'Edge';
  const label = isNode 
    ? `${element.label} (${element.type})` 
    : `${element.label}`;
  
  const properties = element.properties || {};
  const propertyEntries = Object.entries(properties);
  
  // Function to handle web search button click
  const handleWebSearch = () => {
    if (isNode && onWebSearch) {
      // This function would normally get the full graph to generate the query
      // Since we don't have access to the full graph here, we'll just use the nodeId
      // and onWebSearch will use the full graph on the parent component
      onWebSearch(element.id, element.label + " " + element.type);
    }
  };
  
  return (
    <div className="bg-white border-t border-gray-200 h-64 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-800">Properties</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
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
          
          {/* Web Search Button - only for nodes, not edges */}
          {isNode && onWebSearch && (
            <div className="mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 text-sm"
                onClick={handleWebSearch}
              >
                <GlobeIcon size={14} />
                Web Search
              </Button>
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
