import { useRef, useEffect, useState } from "react";
import { Graph, Node, Edge, ZoomPanInfo } from "@/types/graph";
import { Button } from "@/components/ui/button";
import * as d3 from "d3";

interface GraphPanelProps {
  graph: Graph | null;
  isLoading: boolean;
  onElementSelect: (element: Node | Edge | null) => void;
  onShowExportModal: () => void;
}

// Colors for different node types
const NODE_COLORS: Record<string, string> = {
  'Person': '#3B82F6',       // primary blue
  'Company': '#10B981',      // secondary green
  'Organization': '#10B981', // same as Company
  'Product': '#8B5CF6',      // accent purple
  'Location': '#F59E0B',     // amber
  'default': '#6B7280'       // gray
};

export default function GraphPanel({ 
  graph, 
  isLoading, 
  onElementSelect,
  onShowExportModal 
}: GraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomInfo, setZoomInfo] = useState<ZoomPanInfo>({ scale: 1, translateX: 0, translateY: 0 });

  // Setup D3 visualization
  useEffect(() => {
    if (!graph || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear existing elements
    svg.selectAll("*").remove();
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomInfo({
          scale: event.transform.k,
          translateX: event.transform.x,
          translateY: event.transform.y
        });
      });
    
    svg.call(zoom);
    
    // Create container group for zoom/pan
    const container = svg.append("g");
    
    // Draw edges first (so they're under nodes)
    const edges = container
      .selectAll(".edge")
      .data(graph.edges)
      .enter()
      .append("g")
      .attr("class", "edge")
      .on("click", (event, d) => {
        event.stopPropagation();
        onElementSelect(d);
      });
    
    edges.append("line")
      .attr("x1", (d) => {
        const source = graph.nodes.find(n => n.id === d.source);
        return source?.x || 0;
      })
      .attr("y1", (d) => {
        const source = graph.nodes.find(n => n.id === d.source);
        return source?.y || 0;
      })
      .attr("x2", (d) => {
        const target = graph.nodes.find(n => n.id === d.target);
        return target?.x || 0;
      })
      .attr("y2", (d) => {
        const target = graph.nodes.find(n => n.id === d.target);
        return target?.y || 0;
      })
      .attr("stroke", "#9CA3AF") // gray-400
      .attr("stroke-width", 1.5);
    
    // Add edge labels
    edges.append("text")
      .attr("x", (d) => {
        const source = graph.nodes.find(n => n.id === d.source);
        const target = graph.nodes.find(n => n.id === d.target);
        return ((source?.x || 0) + (target?.x || 0)) / 2;
      })
      .attr("y", (d) => {
        const source = graph.nodes.find(n => n.id === d.source);
        const target = graph.nodes.find(n => n.id === d.target);
        return ((source?.y || 0) + (target?.y || 0)) / 2 - 6;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#4B5563") // gray-600
      .text(d => d.label);
    
    // Draw nodes
    const nodes = container
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        onElementSelect(d);
      });
    
    // Node circles
    nodes.append("circle")
      .attr("r", 20)
      .attr("fill", d => NODE_COLORS[d.type] || NODE_COLORS.default);
    
    // Node labels (inside circle)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text(d => d.label);
    
    // Node names (below circle)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "35px")
      .attr("fill", "#1F2937") // gray-800
      .attr("font-size", "11px")
      .text(d => d.properties.name || "");
    
    // Background click to deselect
    svg.on("click", () => {
      onElementSelect(null);
    });
    
    // Initial fit to view
    fitGraph();
    
  }, [graph, onElementSelect]);

  // Fit graph to view
  const fitGraph = () => {
    if (!graph || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const svgElement = svgRef.current;
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    
    // Find bounds of graph
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    graph.nodes.forEach(node => {
      if (node.x !== undefined) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
      }
      if (node.y !== undefined) {
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }
    });
    
    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    if (graphWidth === 0 || graphHeight === 0) return;
    
    // Calculate scale to fit
    const scale = Math.min(
      width / graphWidth,
      height / graphHeight,
      2 // Max scale
    );
    
    // Calculate translation to center
    const translateX = width / 2 - ((minX + maxX) / 2) * scale;
    const translateY = height / 2 - ((minY + maxY) / 2) * scale;
    
    // Apply transform
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale));
    
    // Update zoom info
    setZoomInfo({ scale, translateX, translateY });
  };

  // Apply zoom in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    
    const newScale = direction === 'in' 
      ? zoomInfo.scale * 1.2 
      : zoomInfo.scale / 1.2;
    
    // Apply transform preserving the center point
    svg.transition().duration(300).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(zoomInfo.translateX, zoomInfo.translateY)
        .scale(newScale)
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Graph Visualization</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
            >
              <span>Layout</span>
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </Button>
          </div>
          
          <div className="flex border border-gray-300 rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('out')}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              <i className="fas fa-minus"></i>
            </Button>
            <span className="border-l border-r border-gray-300 px-3 py-1 text-sm">
              {Math.round(zoomInfo.scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('in')}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fitGraph}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <i className="fas fa-expand mr-1"></i> Fit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowExportModal}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <i className="fas fa-download mr-1"></i> Export
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 relative">
        {/* Empty State */}
        {!graph && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
            <i className="fas fa-project-diagram text-6xl mb-4 opacity-40"></i>
            <p className="text-lg font-medium">No graph to display</p>
            <p className="text-sm mt-2">Enter text and generate a graph to see visualization</p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center flex-col">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Generating graph...</p>
            <p className="text-sm text-gray-500 mt-1">Processing with O1 Pro model</p>
          </div>
        )}
        
        {/* Graph Canvas */}
        <svg 
          ref={svgRef}
          className={`w-full h-full ${!graph || isLoading ? 'hidden' : ''}`}
        ></svg>
      </div>
    </div>
  );
}
