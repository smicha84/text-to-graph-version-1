import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaintBucketIcon, RefreshCwIcon } from "lucide-react";
import { NODE_COLORS } from "@/lib/graphVisualizer";

interface NodeColorMap {
  [key: string]: string;
}

interface ColorEditorProps {
  graph: any;
  onColorChange: (newColors: NodeColorMap) => void;
}

export default function ColorEditor({ graph, onColorChange }: ColorEditorProps) {
  const [nodeTypeColors, setNodeTypeColors] = useState<NodeColorMap>({});
  const [activeNodeTypes, setActiveNodeTypes] = useState<string[]>([]);

  // Initialize colors when the graph changes
  useEffect(() => {
    if (!graph) return;
    
    // Get unique node types from current graph
    const types = new Set<string>();
    graph.nodes.forEach((node: any) => {
      if (node.type) {
        types.add(node.type);
      }
    });
    
    // Create a map of node types to colors based on existing NODE_COLORS
    const typesArray = Array.from(types);
    setActiveNodeTypes(typesArray);
    
    const colorMap: NodeColorMap = {};
    typesArray.forEach(type => {
      colorMap[type] = NODE_COLORS[type] || NODE_COLORS.default;
    });
    
    setNodeTypeColors(colorMap);
  }, [graph]);

  // Update color for a specific node type
  const handleColorChange = (type: string, color: string) => {
    const newColors = { ...nodeTypeColors, [type]: color };
    setNodeTypeColors(newColors);
    onColorChange(newColors);
  };

  // Reset colors to defaults
  const handleReset = () => {
    const defaultColors: NodeColorMap = {};
    activeNodeTypes.forEach(type => {
      defaultColors[type] = NODE_COLORS[type] || NODE_COLORS.default;
    });
    
    setNodeTypeColors(defaultColors);
    onColorChange(defaultColors);
  };

  // No node types available
  if (activeNodeTypes.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <PaintBucketIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No nodes to customize</p>
        <p className="text-sm mt-1">Generate a graph to customize node colors</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-2 font-semibold text-gray-700">
          <PaintBucketIcon size={16} className="text-gray-500" />
          Node Colors
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="h-8 text-xs flex items-center gap-1"
        >
          <RefreshCwIcon size={12} />
          Reset
        </Button>
      </div>
      
      <div className="space-y-3">
        {activeNodeTypes.map(type => (
          <div key={type} className="grid grid-cols-[1fr,80px] gap-2 items-center">
            <Label className="truncate" title={type}>
              {type}
            </Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: nodeTypeColors[type] || '#6B7280' }}
              />
              <Input
                type="color"
                value={nodeTypeColors[type] || '#6B7280'}
                onChange={(e) => handleColorChange(type, e.target.value)}
                className="w-14 h-7 p-0 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}