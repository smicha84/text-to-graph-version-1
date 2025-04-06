import { useRef, useEffect, useState } from "react";
import { Graph, Node, Edge } from "../types/graph";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, ExpandIcon } from "lucide-react";
import * as d3 from "d3";

interface EditInfo {
  userId: number;
  username: string;
  elementId: string;
  elementType: 'node' | 'edge';
  isEditing: boolean;
}

interface MultiplayerGraphPanelProps {
  graph: Graph;
  onGraphChange: (graph: Graph) => void;
  onNodeEditStart?: (id: string) => void;
  onNodeEditEnd?: (id: string) => void;
  onEdgeEditStart?: (id: string) => void;
  onEdgeEditEnd?: (id: string) => void;
  getEditingInfo?: (id: string) => EditInfo | undefined;
}

export default function MultiplayerGraphPanel({
  graph,
  onGraphChange,
  onNodeEditStart,
  onNodeEditEnd,
  onEdgeEditStart,
  onEdgeEditEnd,
  getEditingInfo
}: MultiplayerGraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  
  // D3 selections and simulation
  const svg = d3.select(svgRef.current);
  let simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null;
  
  // Node colors by type
  const nodeColors: Record<string, string> = {
    "Person": "#4299E1",
    "Organization": "#F6AD55",
    "Location": "#68D391",
    "Event": "#FC8181",
    "Concept": "#B794F4",
    "Default": "#A0AEC0"
  };
  
  // Setup visualization
  useEffect(() => {
    if (!svgRef.current || !graph) return;
    
    // Clear previous elements
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svgElement = svgRef.current;
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;
    
    // Create SVG groups
    const g = d3.select(svgElement)
      .append("g")
      .attr("class", "graph-container");
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setScale(event.transform.k);
        setTranslateX(event.transform.x);
        setTranslateY(event.transform.y);
      });
    
    d3.select(svgElement).call(zoom as any);
    
    // Create links
    const links = g.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(graph.edges)
      .enter()
      .append("g")
      .attr("class", "link-group");
    
    links.append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("id", d => `edge-${d.id}`);
    
    links.append("text")
      .attr("class", "link-label")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", "10px")
      .text(d => d.label)
      .each(function(d) {
        // Add edit event listeners
        d3.select(this).on("click", (event) => {
          event.stopPropagation();
          
          if (onEdgeEditStart && !getEditingInfo?.(d.id)) {
            // Start editing if not already being edited
            onEdgeEditStart(d.id);
            
            // Create an editable input at the current position
            const pos = getEdgeLabelPosition(d);
            createEditableLabel(d, "edge", pos.x, pos.y);
          }
        });
      });
    
    // Create nodes
    const nodes = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);
    
    nodes.append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .attr("fill", d => getNodeColor(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("id", d => `node-${d.id}`);
    
    nodes.append("text")
      .attr("class", "node-label")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-weight", "500")
      .attr("font-size", "12px")
      .text(d => d.label)
      .each(function(d) {
        // Add edit event listeners
        d3.select(this).on("click", (event) => {
          event.stopPropagation();
          
          if (onNodeEditStart && !getEditingInfo?.(d.id)) {
            // Start editing if not already being edited
            onNodeEditStart(d.id);
            
            // Create an editable input at the current position
            const circle = d3.select(`#node-${d.id}`);
            const cx = parseFloat(circle.attr("cx") || "0");
            const cy = parseFloat(circle.attr("cy") || "0");
            createEditableLabel(d, "node", cx, cy - 15);
          }
        });
      });
    
    // Initialize simulation
    simulation = d3.forceSimulation(graph.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(graph.edges)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))
      .on("tick", ticked);
    
    // Position nodes and links on tick
    function ticked() {
      links.select("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      links.select("text")
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
      
      nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
    
    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation?.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
      
      // Update the graph object with new node positions
      const updatedGraph = {...graph};
      const nodeIndex = updatedGraph.nodes.findIndex(n => n.id === d.id);
      if (nodeIndex !== -1) {
        updatedGraph.nodes[nodeIndex].x = event.x;
        updatedGraph.nodes[nodeIndex].y = event.y;
      }
      
      onGraphChange(updatedGraph);
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation?.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Highlight nodes/edges that are being edited by others
    updateEditingHighlights();
    
    // Center the graph initially
    fitGraphToView();
    
    // Cleanup when component unmounts
    return () => {
      simulation?.stop();
    };
  }, [graph, onNodeEditStart, onEdgeEditStart]);
  
  // Update editing highlights whenever editing info changes
  useEffect(() => {
    updateEditingHighlights();
  }, [getEditingInfo]);
  
  // Helper function to update visual indicators for elements being edited
  function updateEditingHighlights() {
    if (!getEditingInfo || !svgRef.current) return;
    
    // Remove existing highlight indicators
    d3.select(svgRef.current).selectAll(".editing-indicator").remove();
    
    // Add highlight for nodes being edited
    graph.nodes.forEach(node => {
      const editInfo = getEditingInfo(node.id);
      if (editInfo?.isEditing) {
        const nodeElement = d3.select(`#node-${node.id}`);
        if (!nodeElement.empty()) {
          const cx = parseFloat(nodeElement.attr("cx") || "0");
          const cy = parseFloat(nodeElement.attr("cy") || "0");
          
          // Add pulsing highlight circle
          d3.select(svgRef.current).select(".graph-container").append("circle")
            .attr("class", "editing-indicator")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 15)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.7)
            .style("animation", "pulse 1.5s infinite");
          
          // Add editor name label
          d3.select(svgRef.current).select(".graph-container").append("text")
            .attr("class", "editing-indicator")
            .attr("x", cx)
            .attr("y", cy + 25)
            .attr("text-anchor", "middle")
            .attr("fill", "red")
            .attr("font-size", "10px")
            .attr("font-style", "italic")
            .text(`Editing: ${editInfo.username}`);
        }
      }
    });
    
    // Add highlight for edges being edited
    graph.edges.forEach(edge => {
      const editInfo = getEditingInfo(edge.id);
      if (editInfo?.isEditing) {
        const edgeElement = d3.select(`#edge-${edge.id}`);
        if (!edgeElement.empty()) {
          const pos = getEdgeLabelPosition(edge);
          
          // Add pulsing highlight for edge
          edgeElement
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5");
          
          // Add editor name label
          d3.select(svgRef.current).select(".graph-container").append("text")
            .attr("class", "editing-indicator")
            .attr("x", pos.x)
            .attr("y", pos.y + 15)
            .attr("text-anchor", "middle")
            .attr("fill", "red")
            .attr("font-size", "10px")
            .attr("font-style", "italic")
            .text(`Editing: ${editInfo.username}`);
        }
      }
    });
  }
  
  // Helper to calculate edge label position
  function getEdgeLabelPosition(edge: Edge): { x: number, y: number } {
    const sourceNode = graph.nodes.find(n => n.id === edge.source);
    const targetNode = graph.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
      return { x: 0, y: 0 };
    }
    
    // Use node position if available, otherwise default to 0,0
    const sourceX = sourceNode.x || 0;
    const sourceY = sourceNode.y || 0;
    const targetX = targetNode.x || 0;
    const targetY = targetNode.y || 0;
    
    return {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    };
  }
  
  // Helper to create an editable label
  function createEditableLabel(element: Node | Edge, elementType: 'node' | 'edge', x: number, y: number) {
    // Remove any existing input
    d3.select("#editable-input-container").remove();
    
    // Create container div for the input
    const container = document.createElement("div");
    container.id = "editable-input-container";
    container.style.position = "absolute";
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.transform = "translate(-50%, -50%)";
    container.style.zIndex = "100";
    
    // Create input element
    const input = document.createElement("input");
    input.type = "text";
    input.value = element.label;
    input.style.padding = "4px 8px";
    input.style.border = "2px solid #3b82f6";
    input.style.borderRadius = "4px";
    input.style.fontSize = "12px";
    input.style.minWidth = "100px";
    input.style.textAlign = "center";
    
    // Add to container
    container.appendChild(input);
    
    // Add to DOM
    const graphContainer = svgRef.current?.parentElement;
    if (graphContainer) {
      graphContainer.appendChild(container);
      
      // Focus input
      input.focus();
      input.select();
      
      // Handle save on enter or blur
      const saveHandler = () => {
        const newLabel = input.value.trim();
        if (newLabel) {
          // Update the element label
          const updatedGraph = {...graph};
          
          if (elementType === 'node') {
            const nodeIndex = updatedGraph.nodes.findIndex(n => n.id === element.id);
            if (nodeIndex !== -1) {
              updatedGraph.nodes[nodeIndex].label = newLabel;
            }
          } else {
            const edgeIndex = updatedGraph.edges.findIndex(e => e.id === element.id);
            if (edgeIndex !== -1) {
              updatedGraph.edges[edgeIndex].label = newLabel;
            }
          }
          
          // Notify parent
          onGraphChange(updatedGraph);
          
          // Call the appropriate edit end handler
          if (elementType === 'node' && onNodeEditEnd) {
            onNodeEditEnd(element.id);
          } else if (elementType === 'edge' && onEdgeEditEnd) {
            onEdgeEditEnd(element.id);
          }
        }
        
        // Remove input
        if (container.parentNode === graphContainer) {
          graphContainer.removeChild(container);
        }
      };
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveHandler();
        } else if (e.key === 'Escape') {
          // Cancel edit
          if (elementType === 'node' && onNodeEditEnd) {
            onNodeEditEnd(element.id);
          } else if (elementType === 'edge' && onEdgeEditEnd) {
            onEdgeEditEnd(element.id);
          }
          
          // Remove input
          if (container.parentNode === graphContainer) {
            graphContainer.removeChild(container);
          }
        }
      });
      
      input.addEventListener('blur', saveHandler);
    }
  }
  
  // Helper to get node color based on type
  function getNodeColor(node: Node): string {
    return nodeColors[node.type] || nodeColors.Default;
  }
  
  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node() as Element);
    
    let newScale = currentZoom.k;
    if (direction === 'in') {
      newScale = currentZoom.k * 1.2;
    } else {
      newScale = currentZoom.k / 1.2;
    }
    
    svg.transition()
      .duration(300)
      .call(
        (d3.zoom() as any).transform,
        d3.zoomIdentity.translate(currentZoom.x, currentZoom.y).scale(newScale)
      );
    
    setScale(newScale);
  };
  
  // Center and fit graph to view
  const fitGraphToView = () => {
    if (!svgRef.current || !graph.nodes.length) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    
    // Calculate bounds
    const bounds = {
      minX: d3.min(graph.nodes, d => d.x || 0) || 0,
      minY: d3.min(graph.nodes, d => d.y || 0) || 0,
      maxX: d3.max(graph.nodes, d => d.x || 0) || 0,
      maxY: d3.max(graph.nodes, d => d.y || 0) || 0
    };
    
    const dx = bounds.maxX - bounds.minX;
    const dy = bounds.maxY - bounds.minY;
    const x = (bounds.minX + bounds.maxX) / 2;
    const y = (bounds.minY + bounds.maxY) / 2;
    
    // Add padding
    const padding = 40;
    const scale = Math.min(
      0.9 / Math.max(dx / width, dy / height),
      2
    );
    
    // Apply transform
    svg.transition()
      .duration(500)
      .call(
        (d3.zoom() as any).transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      );
    
    setScale(scale);
  };
  
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white/90 rounded-md shadow-md p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom('out')}
          className="h-8 w-8 p-0"
        >
          <MinusIcon size={16} />
        </Button>
        <span className="text-sm font-medium">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoom('in')}
          className="h-8 w-8 p-0"
        >
          <PlusIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fitGraphToView}
          className="h-8 w-8 p-0"
        >
          <ExpandIcon size={16} />
        </Button>
      </div>
      
      <svg
        ref={svgRef}
        className="w-full h-full bg-white"
        style={{ overflow: 'visible' }}
      ></svg>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 0.3; }
            100% { opacity: 0.7; }
          }
        `
      }} />
    </div>
  );
}