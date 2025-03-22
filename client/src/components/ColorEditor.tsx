import { useState, useMemo, useEffect } from 'react';
import { Graph } from '@/types/graph';
import { NODE_COLORS } from '@/lib/graphVisualizer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface NodeColorMap {
  [key: string]: string;
}

interface ColorEditorProps {
  graph: Graph;
  onColorChange: (newColors: NodeColorMap) => void;
}

export default function ColorEditor({ graph, onColorChange }: ColorEditorProps) {
  const [colors, setColors] = useState<NodeColorMap>({});
  
  // Extract all unique node types from the graph
  const nodeTypes = useMemo(() => {
    const types = new Set<string>();
    
    if (graph && graph.nodes) {
      graph.nodes.forEach((node) => {
        if (node.type) {
          types.add(node.type);
        }
      });
    }
    
    return Array.from(types).sort();
  }, [graph]);

  // Initialize colors on first load or when nodeTypes change
  useEffect(() => {
    if (Object.keys(colors).length === 0 && nodeTypes.length > 0) {
      // Create the initial color map from existing NODE_COLORS
      const colorMap: NodeColorMap = {};
      
      // Use default NODE_COLORS as a starting point
      nodeTypes.forEach((type) => {
        colorMap[type] = NODE_COLORS[type] || NODE_COLORS.default;
      });
      
      setColors(colorMap);
      
      // Call onColorChange with initial colors
      onColorChange(colorMap);
    }
  }, [nodeTypes, colors, onColorChange]);
  
  // Handle color change for a specific node type
  const handleColorChange = (nodeType: string, newColor: string) => {
    const updatedColors = { ...colors, [nodeType]: newColor };
    setColors(updatedColors);
    onColorChange(updatedColors);
  };
  
  // Reset colors to defaults
  const resetColors = () => {
    const defaultColors: NodeColorMap = {};
    nodeTypes.forEach((type) => {
      defaultColors[type] = NODE_COLORS[type] || NODE_COLORS.default;
    });
    
    setColors(defaultColors);
    onColorChange(defaultColors);
  };
  
  // If no node types, show a message
  if (nodeTypes.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic p-4">
        No node types found in the current graph.
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Node Color Customization</h3>
        <Button variant="ghost" size="sm" onClick={resetColors} title="Reset to defaults">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        Customize colors for different node types in the graph
      </p>
      
      <div className="space-y-3">
        {nodeTypes.map((nodeType) => (
          <div key={nodeType} className="flex items-center justify-between">
            <Label className="text-sm text-gray-700">{nodeType}</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: colors[nodeType] || NODE_COLORS.default }}
              />
              <Input
                type="color"
                value={colors[nodeType] || NODE_COLORS.default}
                onChange={(e) => handleColorChange(nodeType, e.target.value)}
                className="w-16 h-8"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}