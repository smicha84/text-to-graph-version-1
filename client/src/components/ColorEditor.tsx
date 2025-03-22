import { useState, useMemo, useEffect } from 'react';
import { Graph, Node } from '@/types/graph';
import { NODE_COLORS } from '@/lib/graphVisualizer';

interface NodeColorMap {
  [key: string]: string;
}

interface ColorEditorProps {
  graph: Graph;
  onColorChange: (newColors: NodeColorMap) => void;
}

const DEFAULT_COLORS = [
  "#4f46e5", // indigo-600
  "#0891b2", // cyan-600
  "#0d9488", // teal-600
  "#16a34a", // green-600
  "#ca8a04", // yellow-600
  "#ea580c", // orange-600
  "#dc2626", // red-600
  "#d946ef", // fuchsia-600
  "#c026d3", // purple-600
  "#7c3aed", // violet-600
  "#2563eb", // blue-600
  "#0284c7", // sky-600
  "#059669", // emerald-600
  "#65a30d", // lime-600
  "#e11d48", // rose-600
  "#9f1239", // rose-900
  "#0f766e", // teal-700
  "#b45309", // amber-700
  "#4338ca", // indigo-700
  "#7e22ce", // purple-700
];

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

  // Initialize colors on first load
  useEffect(() => {
    // Create the initial color map from existing NODE_COLORS
    const colorMap: NodeColorMap = {};
    
    // Use default NODE_COLORS as a starting point
    nodeTypes.forEach((type) => {
      colorMap[type] = NODE_COLORS[type] || NODE_COLORS.default;
    });
    
    setColors(colorMap);
    
    // Call onColorChange with initial colors
    onColorChange(colorMap);
  }, [nodeTypes, onColorChange]);
  
  // Handle color change for a specific node type
  const handleColorChange = (nodeType: string, newColor: string) => {
    const updatedColors = { ...colors, [nodeType]: newColor };
    setColors(updatedColors);
    onColorChange(updatedColors);
  };
  
  // If no node types, show a message
  if (nodeTypes.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No node types found in the current graph.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {nodeTypes.map((nodeType) => (
        <div key={nodeType} className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-700">{nodeType}</span>
            <div className="flex items-center">
              <div
                className="w-5 h-5 rounded-full mr-2"
                style={{ backgroundColor: colors[nodeType] || NODE_COLORS.default }}
              />
              <select
                value={colors[nodeType] || NODE_COLORS.default}
                onChange={(e) => handleColorChange(nodeType, e.target.value)}
                className="text-xs rounded border border-gray-300 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DEFAULT_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                className={`w-4 h-4 rounded-full ${
                  colors[nodeType] === color ? 'ring-2 ring-offset-1 ring-gray-600' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(nodeType, color)}
                title={color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}