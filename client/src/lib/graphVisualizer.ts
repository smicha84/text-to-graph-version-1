import * as d3 from "d3";
import { Graph, Node, Edge } from "@/types/graph";

import { NodeStyle, EdgeStyle } from "@/types/graph";

// Define extension types for D3 force simulation
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  subgraphIds?: string[]; // Array of subgraph IDs this node belongs to
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  // Rendering will check custom styles map instead of storing styles directly on the node
}

interface SimulationLink {
  id: string;
  source: SimulationNode | string;
  target: SimulationNode | string;
  label: string;
  properties: Record<string, any>;
  subgraphIds?: string[]; // Array of subgraph IDs this edge belongs to
  // Rendering will check custom styles map instead of storing styles directly on the edge
}

// Node colors based on node type
export const NODE_COLORS: Record<string, string> = {
  // Person types with different roles
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
  
  // Resource types
  'Resource': '#A78BFA',     // violet
  'Material': '#8B5CF6',     // violet dark
  
  // Default color for unknown types
  'default': '#6B7280'       // gray-500
};

export interface LayoutSettings {
  nodeRepulsion: number;
  linkDistance: number;
  centerStrength: number;
  collisionRadius: number;
}

export interface CenterPoint {
  x: number;
  y: number;
}

export class GraphVisualizer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private graph: Graph | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private onSelectElement: (element: Node | Edge | null) => void;
  private onWebSearch?: (nodeId: string, query: string) => void;
  private activeSubgraphId: string | null = null;
  private customNodeColors: Record<string, string> = {};
  private customCenterPoint: CenterPoint | null = null;
  private layoutSettings: LayoutSettings = {
    nodeRepulsion: 200,
    linkDistance: 100,
    centerStrength: 0.05,
    collisionRadius: 30
  };
  private nodeStyles: Map<string, NodeStyle> = new Map();
  private edgeStyles: Map<string, EdgeStyle> = new Map();
  private simulation: d3.Simulation<SimulationNode, SimulationLink> | null = null;
  private nodeTooltip: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;

  constructor(
    svgElement: SVGSVGElement,
    width: number,
    height: number,
    onSelectElement: (element: Node | Edge | null) => void,
    onWebSearch?: (nodeId: string, query: string) => void
  ) {
    this.onWebSearch = onWebSearch;
    this.svg = d3.select(svgElement);
    this.width = width;
    this.height = height;
    this.onSelectElement = onSelectElement;
    console.log(`INITIALIZED SVG with dimensions: Width=${width}, Height=${height}`);
    
    // Initialize node tooltip
    this.initNodeTooltip();
    
    // Create a clean SVG structure
    // Step 1: Add a rect that covers the entire SVG area
    // This rect will capture click events for deselection
    this.svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("class", "background")
      .style("cursor", "move");
      
    // Step 2: Add definitions
    const defs = this.svg.append("defs");
    
    // Create a grid pattern
    const gridPattern = defs.append("pattern")
      .attr("id", "grid")
      .attr("width", 50)
      .attr("height", 50)
      .attr("patternUnits", "userSpaceOnUse");
    
    // Add the grid lines to the pattern
    gridPattern.append("path")
      .attr("d", "M 50 0 L 0 0 0 50")
      .attr("fill", "none")
      .attr("stroke", "#EEEEEE")
      .attr("stroke-width", 1);
    
    // Add arrow marker definitions
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) 
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", "#9CA3AF")
      .attr("stroke", "none");
      
    // Add blue arrow marker for highlighted edges
    defs.append("marker")
      .attr("id", "arrowhead-highlighted")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", "#2563EB")
      .attr("stroke", "none");
      
    // Step 3: Add grid background with the pattern
    const gridGroup = this.svg.append("g")
      .attr("class", "grid-group");
      
    gridGroup.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#grid)");
    
    // Step 4: Add coordinate labels that show every 100px
    const gridLabelsGroup = this.svg.append("g")
      .attr("class", "grid-labels");
      
    // X-axis labels (every 100px)
    for (let x = 0; x <= width; x += 100) {
      gridLabelsGroup.append("text")
        .attr("x", x)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(x);
    }
    
    // Y-axis labels (every 100px)
    for (let y = 0; y <= height; y += 100) {
      gridLabelsGroup.append("text")
        .attr("x", 15)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(y);
    }
    
    // Step 5: Create a tooltip for coordinates
    const tooltip = this.svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
      
    tooltip.append("rect")
      .attr("width", 80)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 5);
      
    const tooltipText = tooltip.append("text")
      .attr("x", 5)
      .attr("y", 15)
      .attr("font-size", "10px")
      .attr("fill", "#333");
    
    // Step 6: Create container for graph elements - this will be transformed for zoom/pan
    this.container = this.svg.append("g")
      .attr("class", "graph-container");
    
    // Step 7: Setup the zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])  // Zoom limits 
      .on("zoom", (event) => {
        // Apply the zoom transform to the container
        this.container.attr("transform", event.transform);
      });
    
    // Apply zoom to the SVG element
    this.svg.call(this.zoom);
    
    // Add a click handler for the background that doesn't interfere with zoom
    this.svg.select(".background").on("click", (event) => {
      // Prevent propagation to avoid conflict with zoom
      event.stopPropagation();
      this.onSelectElement(null);
    });
    
    // Add mousemove handler to show coordinates
    this.svg.on("mousemove", (event) => {
      const [x, y] = d3.pointer(event);
      tooltip.style("display", "block")
        .attr("transform", `translate(${x + 10},${y - 30})`);
      
      tooltipText.text(`X: ${Math.round(x)}, Y: ${Math.round(y)}`);
    });
    
    // Hide tooltip when mouse leaves SVG
    this.svg.on("mouseleave", () => {
      tooltip.style("display", "none");
    });
  }
  
  // Initialize node tooltip
  private initNodeTooltip(): void {
    // Remove any existing tooltip
    if (this.nodeTooltip) {
      this.nodeTooltip.remove();
    }
    
    // Create tooltip div
    this.nodeTooltip = d3.select(document.body)
      .append("div")
      .attr("class", "node-tooltip")
      .style("opacity", 0)
      .style("display", "none");
  }
  
  // Show tooltip for a node
  private showNodeTooltip(event: MouseEvent, d: SimulationNode): void {
    if (!this.nodeTooltip || !this.graph) return;
    
    // Position the tooltip near the mouse but slightly offset
    const x = event.pageX + 10;
    const y = event.pageY - 10;
    
    // Get node name or label
    const nodeName = d.properties.name || d.label;
    const nodeType = d.type || '';
    
    // Create tooltip content - simplified without web search button
    this.nodeTooltip
      .html(`
        <h4>${nodeName}</h4>
        <div class="node-tooltip-content">
          ${nodeType ? `<div><strong>Type:</strong> ${nodeType}</div>` : ''}
        </div>
      `)
      .style("left", `${x}px`)
      .style("top", `${y}px`)
      .style("display", "block")
      .style("opacity", 0)
      .transition()
      .duration(200)
      .style("opacity", 1);
  }
  
  // Hide node tooltip
  private hideNodeTooltip(): void {
    if (!this.nodeTooltip) return;
    
    this.nodeTooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
      .on("end", () => {
        this.nodeTooltip!.style("display", "none");
      });
  }

  public render(graph: Graph): void {
    console.log("Rendering graph:", graph);
    
    // Get the current SVG dimensions from the element itself to ensure accuracy
    // This is critical for ensuring visualization works properly on all device sizes
    const svgElement = this.svg.node();
    if (svgElement) {
      if (svgElement.parentElement) {
        // Use the parent container's dimensions which is more reliable 
        // especially when dealing with flexbox layouts
        const containerRect = svgElement.parentElement.getBoundingClientRect();
        this.width = containerRect.width;
        this.height = containerRect.height;
      } else {
        // Fallback to SVG's dimensions if parent not available
        const svgRect = svgElement.getBoundingClientRect();
        this.width = svgRect.width || this.width;
        this.height = svgRect.height || this.height;
      }
      
      // Ensure SVG always fills its container
      this.svg
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet");
        
      console.log(`UPDATED SVG dimensions before rendering: Width=${this.width}, Height=${this.height}`);
    }
    
    this.graph = graph;
    
    // Clear all existing elements from the SVG
    this.svg.selectAll(".graph-container, .tooltip, .grid-labels, .grid-group").remove();
    
    // Stop any existing simulation
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }
    
    // Re-create the grid
    const gridGroup = this.svg.append("g")
      .attr("class", "grid-group");
      
    gridGroup.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "url(#grid)");
    
    // Re-create coordinate labels
    const gridLabelsGroup = this.svg.append("g")
      .attr("class", "grid-labels");
      
    // X-axis labels (every 100px)
    for (let x = 0; x <= this.width; x += 100) {
      gridLabelsGroup.append("text")
        .attr("x", x)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(x);
    }
    
    // Y-axis labels (every 100px)
    for (let y = 0; y <= this.height; y += 100) {
      gridLabelsGroup.append("text")
        .attr("x", 15)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(y);
    }
    
    // Re-create tooltip
    const tooltip = this.svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
      
    tooltip.append("rect")
      .attr("width", 80)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 5);
      
    const tooltipText = tooltip.append("text")
      .attr("x", 5)
      .attr("y", 15)
      .attr("font-size", "10px")
      .attr("fill", "#333");
    
    // Add mousemove handler to show coordinates
    this.svg.on("mousemove", (event) => {
      const [x, y] = d3.pointer(event);
      tooltip.style("display", "block")
        .attr("transform", `translate(${x + 10},${y - 30})`);
      
      tooltipText.text(`X: ${Math.round(x)}, Y: ${Math.round(y)}`);
    });
    
    // Hide tooltip when mouse leaves SVG
    this.svg.on("mouseleave", () => {
      tooltip.style("display", "none");
    });
    
    // Create container for graph elements
    this.container = this.svg.append("g")
      .attr("class", "graph-container");
    
    // Re-apply zoom handler
    this.zoom.on("zoom", (event) => {
      this.container.attr("transform", event.transform);
    });
    
    this.svg.call(this.zoom);
    
    // Validate graph data
    if (!graph || !graph.nodes || !graph.edges) {
      console.error("Invalid graph data:", graph);
      return;
    }
    
    console.log(`Processing ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    
    // Prepare node and link data for force simulation
    const nodeData = graph.nodes.map((node, index) => {
      // For the first node (typically a central entity), fix it at the center or custom center point
      if (index === 0) {
        // Use custom center point if available, otherwise use the SVG center
        const centerX = this.customCenterPoint ? this.customCenterPoint.x : this.width / 2;
        const centerY = this.customCenterPoint ? this.customCenterPoint.y : this.height / 2;
        console.log(`Anchoring first node at ${this.customCenterPoint ? 'custom' : 'default'} center: (${centerX}, ${centerY})`);
        return {
          ...node,
          x: centerX,
          y: centerY,
          fx: centerX,  // Fixed X position
          fy: centerY   // Fixed Y position
        };
      }
      
      // For other nodes, use random positions around center
      return {
        ...node,
        x: node.x || this.width / 2 + (Math.random() - 0.5) * 100,
        y: node.y || this.height / 2 + (Math.random() - 0.5) * 100
      };
    }) as SimulationNode[];
    
    // Create a map for faster node lookup
    const nodeMap = new Map<string, SimulationNode>();
    nodeData.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Create link data with references to node objects
    const linkData = graph.edges.map(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      
      if (!source || !target) {
        console.error(`Could not find nodes for edge: ${edge.id}, source: ${edge.source}, target: ${edge.target}`);
        return null;
      }
      
      return { ...edge, source, target } as SimulationLink;
    }).filter(Boolean) as SimulationLink[];
    
    console.log(`Processed ${nodeData.length} simulation nodes and ${linkData.length} simulation links`);
    
    // Draw edges first
    const links = this.container
      .selectAll<SVGGElement, SimulationLink>(".edge")
      .data(linkData)
      .enter()
      .append("g")
      .attr("class", "edge")
      .on("click", (event: MouseEvent, d: SimulationLink) => {
        // Prevent the click from propagating to the background
        event.stopPropagation();
        // Prevent the click from triggering the zoom behavior
        event.preventDefault(); 
        // Select this edge
        this.onSelectElement(d as unknown as Edge);
      });
    
    // Draw edge lines with directional arrows
    const edgeLines = links.append("line")
      .attr("stroke", "#9CA3AF") // gray-400
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");
    
    // Add edge labels
    const edgeLabels = links.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#4B5563") // gray-600
      .text((d: SimulationLink) => d?.label || "");
    
    // Draw nodes
    const nodes = this.container
      .selectAll<SVGGElement, SimulationNode>(".node")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("id", (d) => `node-${d.id}`) // Add ID for easier selection
      .on("mouseover", (event: MouseEvent, d: SimulationNode) => {
        // Always show tooltip, regardless of whether web search is enabled
        this.showNodeTooltip(event, d);
      })
      .on("mouseout", (event: MouseEvent) => {
        // Hide tooltip
        this.hideNodeTooltip();
      })
      .on("click", (event: MouseEvent, d: SimulationNode) => {
        // Prevent the click from propagating to the background
        event.stopPropagation();
        // Select this node
        this.onSelectElement(d as unknown as Node);
      })
      .call(d3.drag<SVGGElement, SimulationNode>()
        // Use subject parameter to prevent interference with panning
        .subject((event, d) => d)
        .on("start", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          // Prevent event from propagating to the zoom behavior
          if (event.sourceEvent) event.sourceEvent.stopPropagation();
          
          if (!event.active && this.simulation) {
            this.simulation.alphaTarget(0.3).restart();
          }
          // Set fixed position and show visual feedback
          d.fx = d.x;
          d.fy = d.y;
          // Change cursor to grabbing to indicate active drag
          d3.select(event.sourceEvent.target).style("cursor", "grabbing");
          // Highlight the node being dragged
          d3.select(event.subject.id ? `#node-${event.subject.id}` : event.sourceEvent.target.parentNode)
            .select("circle")
            .attr("stroke", "#2563EB")
            .attr("stroke-width", 3);
        })
        .on("drag", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          // Prevent event from propagating to the zoom behavior
          if (event.sourceEvent) event.sourceEvent.stopPropagation();
          
          // Update fixed position during drag
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          if (!event.active && this.simulation) {
            this.simulation.alphaTarget(0);
          }
          
          // Only release the fixed position for nodes other than the first node
          // For the first node (index 0), we keep it fixed at the center
          const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
          if (nodeIndex !== 0) {
            // Release fixed position for non-anchored nodes
            d.fx = null;
            d.fy = null;
          }
          
          // Reset cursor
          d3.select(event.sourceEvent.target).style("cursor", "grab");
          // Remove highlight
          d3.select(event.subject.id ? `#node-${event.subject.id}` : event.sourceEvent.target.parentNode)
            .select("circle")
            .attr("stroke", null)
            .attr("stroke-width", 0);
        }));
    
    // Node circles with cursor styling to indicate draggable
    nodes.append("circle")
      .attr("r", 20)
      .attr("fill", (d: SimulationNode) => {
        // Use custom color if available, otherwise fall back to default color map
        return this.customNodeColors[d.type] || NODE_COLORS[d.type] || NODE_COLORS.default;
      })
      .attr("stroke", (d: SimulationNode, i: number) => {
        // Add a border to the first node to indicate it's anchored
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "#000" : null;
      })
      .attr("stroke-width", (d: SimulationNode, i: number) => {
        // Add a border to the first node to indicate it's anchored
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? 2 : 0;
      })
      .attr("stroke-dasharray", (d: SimulationNode, i: number) => {
        // Add a dashed border to the first node to indicate it's anchored
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "3,3" : null;
      })
      .style("cursor", (d: SimulationNode, i: number) => {
        // The first node is fixed and cannot be freely dragged
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "default" : "grab";
      })
    
    // Node labels (inside circle)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text((d: SimulationNode) => d.label);
    
    // Node names (below circle)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "35px")
      .attr("fill", "#1F2937") // gray-800
      .attr("font-size", "11px")
      .text((d: SimulationNode) => d.properties.name || "");
    
    // Create force simulation with layout settings
    this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>(nodeData)
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(linkData)
        .id((d: SimulationNode) => d.id)
        .distance(this.layoutSettings.linkDistance)) // Distance between connected nodes
      .force("charge", d3.forceManyBody<SimulationNode>()
        .strength(-this.layoutSettings.nodeRepulsion) // Repulsion between nodes
        .distanceMax(300)) // Limit the effect distance to prevent runaway behavior
      .force("center", d3.forceCenter<SimulationNode>(
        this.customCenterPoint ? this.customCenterPoint.x : this.width / 2,
        this.customCenterPoint ? this.customCenterPoint.y : this.height / 2
      ).strength(this.layoutSettings.centerStrength * 2)) // Double strength to prevent drift
      .force("collision", d3.forceCollide<SimulationNode>().radius(this.layoutSettings.collisionRadius)) // Prevent node overlap
      .alphaDecay(0.05) // Increase decay rate to stabilize simulation faster
      .on("tick", () => {
        // Update link positions with adjustments for node radius
        edgeLines
          .attr("x1", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            const nodeRadius = 20; // Same as the circle radius
            
            // No adjustment needed for source
            return sourceNode.x || 0;
          })
          .attr("y1", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            return sourceNode.y || 0;
          })
          .attr("x2", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            
            // Calculate the direction vector
            const dx = (targetNode.x || 0) - (sourceNode.x || 0);
            const dy = (targetNode.y || 0) - (sourceNode.y || 0);
            
            // Calculate the length of the vector
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // If source and target are at the same position, return the target position
            if (length === 0) return targetNode.x || 0;
            
            // Calculate the normalized direction vector
            const normX = dx / length;
            
            // Calculate the position with an offset from the target node's edge
            const nodeRadius = 20; // Same as the circle radius
            return (targetNode.x || 0) - normX * nodeRadius;
          })
          .attr("y2", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            
            // Calculate the direction vector
            const dx = (targetNode.x || 0) - (sourceNode.x || 0);
            const dy = (targetNode.y || 0) - (sourceNode.y || 0);
            
            // Calculate the length of the vector
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // If source and target are at the same position, return the target position
            if (length === 0) return targetNode.y || 0;
            
            // Calculate the normalized direction vector
            const normY = dy / length;
            
            // Calculate the position with an offset from the target node's edge
            const nodeRadius = 20; // Same as the circle radius
            return (targetNode.y || 0) - normY * nodeRadius;
          });
        
        // Update edge label positions
        edgeLabels
          .attr("x", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            return ((sourceNode.x || 0) + (targetNode.x || 0)) / 2;
          })
          .attr("y", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            return ((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 6;
          });
        
        // Update node positions
        nodes
          .attr("transform", (d: SimulationNode) => `translate(${d.x || 0},${d.y || 0})`);
      });
  }

  public fitToView(): void {
    if (!this.graph || this.graph.nodes.length === 0) return;
    
    // Get the current SVG dimensions from the element itself to ensure accuracy
    // This is critical for ensuring visualization works properly on all device sizes
    const svgElement = this.svg.node();
    if (svgElement) {
      if (svgElement.parentElement) {
        // Use the parent container's dimensions which is more reliable 
        // especially when dealing with flexbox layouts
        const containerRect = svgElement.parentElement.getBoundingClientRect();
        this.width = containerRect.width;
        this.height = containerRect.height;
      } else {
        // Fallback to SVG's dimensions if parent not available
        const svgRect = svgElement.getBoundingClientRect();
        this.width = svgRect.width || this.width;
        this.height = svgRect.height || this.height;
      }
      console.log(`UPDATED SVG dimensions before fitToView: Width=${this.width}, Height=${this.height}`);
    }
    
    // Find bounds of graph
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    this.graph.nodes.forEach(node => {
      if (node.x !== undefined) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
      }
      if (node.y !== undefined) {
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }
    });
    
    // Default to center points if no valid positions found
    if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
      console.log("Using default center positioning - no valid node positions found");
      // Use the custom center point if available, otherwise use the SVG center
      const centerX = this.customCenterPoint ? this.customCenterPoint.x : this.width / 2;
      const centerY = this.customCenterPoint ? this.customCenterPoint.y : this.height / 2;
      
      minX = centerX - 100;
      maxX = centerX + 100;
      minY = centerY - 100;
      maxY = centerY + 100;
    }
    
    // Calculate padding as a percentage of the container size
    // This ensures proper scaling on different device sizes
    const paddingPercentX = 0.1; // 10% of width
    const paddingPercentY = 0.1; // 10% of height
    const paddingX = this.width * paddingPercentX;
    const paddingY = this.height * paddingPercentY;
    
    minX -= paddingX;
    minY -= paddingY;
    maxX += paddingX;
    maxY += paddingY;
    
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    if (graphWidth <= 0 || graphHeight <= 0) {
      console.log("Graph has zero or negative dimensions, using default sizing");
      // Use the custom center point if available, otherwise use the SVG center
      const centerX = this.customCenterPoint ? this.customCenterPoint.x : this.width / 2;
      const centerY = this.customCenterPoint ? this.customCenterPoint.y : this.height / 2;
      
      minX = centerX - this.width * 0.2; // 20% of width
      maxX = centerX + this.width * 0.2; // 20% of width
      minY = centerY - this.height * 0.2; // 20% of height
      maxY = centerY + this.height * 0.2; // 20% of height
    }
    
    // Calculate scale to fit, with a responsive max scale based on device dimensions
    // For smaller screens, we allow a bit more zoom out to ensure everything fits
    const maxScale = Math.max(0.5, Math.min(1.5, this.width / 800)); // Adaptive max scale
    
    const scale = Math.min(
      this.width / graphWidth,
      this.height / graphHeight,
      maxScale
    );
    
    // Calculate translation to center
    const translateX = this.width / 2 - ((minX + maxX) / 2) * scale;
    const translateY = this.height / 2 - ((minY + maxY) / 2) * scale;
    
    console.log(`Centering graph: translate(${translateX}, ${translateY}) scale(${scale})`);
    
    // Apply transform with a smooth transition that's appropriate for the device
    // Shorter duration on mobile devices to feel more responsive
    const transitionDuration = this.width < 768 ? 300 : 750;
    this.svg.transition().duration(transitionDuration).call( // Responsive transition
      this.zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  }

  public setZoom(scale: number): void {
    // Get current transform
    const transform = d3.zoomTransform(this.svg.node()!);
    
    // Apply new scale while preserving center
    this.svg.transition().duration(300).call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(transform.x, transform.y)
        .scale(scale)
    );
  }

  public getZoomInfo() {
    const transform = d3.zoomTransform(this.svg.node()!);
    return {
      scale: transform.k,
      translateX: transform.x,
      translateY: transform.y
    };
  }

  /**
   * Get the simulation to access or modify it directly
   */
  public getSimulation(): d3.Simulation<SimulationNode, SimulationLink> | null {
    return this.simulation;
  }
  
  /**
   * Set a custom center point for the graph
   * @param centerPoint The custom center coordinates, or null to use default center
   */
  /**
   * Update the dimensions of the visualizer (when container resizes)
   * @param width New width
   * @param height New height 
   */
  public updateDimensions(width: number, height: number): void {
    if (width === 0 || height === 0) return; // Skip invalid dimensions
    
    console.log(`Updating dimensions: ${width}x${height}`);
    
    // Update internal dimensions
    this.width = width;
    this.height = height;
    
    // Update SVG to ensure it fills its container completely
    this.svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", `0 0 ${width} ${height}`);
    
    // Update the background rect
    this.svg.select(".background")
      .attr("width", width)
      .attr("height", height);
      
    // Update the grid
    this.svg.select(".grid-group").select("rect")
      .attr("width", width)
      .attr("height", height);
      
    // Update coordinate labels
    // First remove existing labels
    this.svg.select(".grid-labels").selectAll("text").remove();
    
    const gridLabelsGroup = this.svg.select(".grid-labels");
    
    // X-axis labels (every 100px)
    for (let x = 0; x <= width; x += 100) {
      gridLabelsGroup.append("text")
        .attr("x", x)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(x);
    }
    
    // Y-axis labels (every 100px)
    for (let y = 0; y <= height; y += 100) {
      gridLabelsGroup.append("text")
        .attr("x", 15)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#999")
        .text(y);
    }
    
    // Update center force if simulation exists
    if (this.simulation) {
      const centerX = this.customCenterPoint ? this.customCenterPoint.x : width / 2;
      const centerY = this.customCenterPoint ? this.customCenterPoint.y : height / 2;
      
      console.log(`Updating simulation center to: (${centerX}, ${centerY})`);
      
      this.simulation.force("center", d3.forceCenter<SimulationNode>(centerX, centerY)
        .strength(this.layoutSettings.centerStrength * 2));
      
      // Restart simulation to apply changes
      this.simulation.alpha(0.3).restart();
    }
  }
  
  public setCustomCenterPoint(centerPoint: CenterPoint | null): void {
    console.log(`Setting custom center point: ${centerPoint ? `(${centerPoint.x}, ${centerPoint.y})` : 'None (using default)'}`);
    this.customCenterPoint = centerPoint;
    
    // If we already have a simulation running, update the center force
    if (this.simulation) {
      const centerX = centerPoint ? centerPoint.x : this.width / 2;
      const centerY = centerPoint ? centerPoint.y : this.height / 2;
      
      // Update the center force with the new coordinates
      this.simulation.force("center", d3.forceCenter<SimulationNode>(centerX, centerY)
        .strength(this.layoutSettings.centerStrength * 2));
      
      // If we have nodes, update the first node to be fixed at the new center
      if (this.graph && this.graph.nodes.length > 0) {
        const firstNode = this.graph.nodes[0];
        const nodeElement = this.container.select(`#node-${firstNode.id}`);
        
        if (nodeElement.size() > 0) {
          const nodeData = nodeElement.datum() as SimulationNode;
          nodeData.x = centerX;
          nodeData.y = centerY;
          nodeData.fx = centerX;
          nodeData.fy = centerY;
        }
      }
      
      // Restart the simulation to apply the changes
      this.simulation.alpha(0.3).restart();
    }
  }
  
  /**
   * Get the current custom center point or null if using default
   */
  public getCustomCenterPoint(): CenterPoint | null {
    return this.customCenterPoint;
  }
  
  /**
   * Set custom style for a specific node
   */
  public setNodeStyle(nodeId: string, style: NodeStyle): void {
    this.nodeStyles.set(nodeId, style);
    this.applyStyles();
  }
  
  /**
   * Get the current style for a node
   */
  public getNodeStyle(nodeId: string): NodeStyle | null {
    return this.nodeStyles.get(nodeId) || null;
  }
  
  /**
   * Set custom style for a specific edge
   */
  public setEdgeStyle(edgeId: string, style: EdgeStyle): void {
    this.edgeStyles.set(edgeId, style);
    this.applyStyles();
  }
  
  /**
   * Get the current style for an edge
   */
  public getEdgeStyle(edgeId: string): EdgeStyle | null {
    return this.edgeStyles.get(edgeId) || null;
  }
  
  /**
   * Apply all current styles to the graph elements
   */
  private applyStyles(): void {
    if (!this.container) return;
    
    // Apply node styles
    this.container.selectAll<SVGGElement, SimulationNode>(".node")
      .each((d, i, nodes) => {
        const nodeElement = d3.select(nodes[i]);
        const style = this.nodeStyles.get(d.id);
        
        if (style) {
          // Apply circle styles
          nodeElement.select("circle")
            .transition().duration(300)
            .attr("fill", style.color || null)
            .attr("r", style.size || 20)
            .attr("stroke", style.borderColor || null)
            .attr("stroke-width", style.borderWidth || 0);
          
          // Apply label styles
          nodeElement.select("text")
            .transition().duration(300)
            .attr("fill", style.labelColor || "white")
            .attr("font-size", `${style.labelSize || 12}px`);
        }
      });
    
    // Apply edge styles
    this.container.selectAll<SVGGElement, SimulationLink>(".edge")
      .each((d, i, edges) => {
        const edgeElement = d3.select(edges[i]);
        const style = this.edgeStyles.get(d.id);
        
        if (style) {
          // Apply line styles
          edgeElement.select("line")
            .transition().duration(300)
            .attr("stroke", style.color || "#9CA3AF")
            .attr("stroke-width", style.width || 1.5)
            .attr("stroke-dasharray", style.dashed ? "5,5" : null);
          
          // Apply label styles
          edgeElement.select("text")
            .transition().duration(300)
            .attr("fill", style.labelColor || "#4B5563")
            .attr("font-size", `${style.labelSize || 10}px`);
        }
      });
  }

  /**
   * Update the layout settings and apply them to the simulation
   */
  public updateLayoutSettings(settings: LayoutSettings): void {
    this.layoutSettings = settings;
    
    if (this.simulation) {
      // Update link distance
      const linkForce = this.simulation.force("link") as d3.ForceLink<SimulationNode, SimulationLink>;
      if (linkForce) {
        linkForce.distance(settings.linkDistance);
      }
      
      // Update node repulsion
      const chargeForce = this.simulation.force("charge") as d3.ForceManyBody<SimulationNode>;
      if (chargeForce) {
        chargeForce
          .strength(-settings.nodeRepulsion)
          .distanceMax(300); // Maintain distance limit
      }
      
      // Update center gravity
      const centerForce = this.simulation.force("center") as d3.ForceCenter<SimulationNode>;
      if (centerForce) {
        centerForce.strength(settings.centerStrength * 2); // Double strength to prevent drift
      }
      
      // Update collision radius
      const collisionForce = this.simulation.force("collision") as d3.ForceCollide<SimulationNode>;
      if (collisionForce) {
        collisionForce.radius(settings.collisionRadius);
      }
      
      // Restart simulation with a higher alpha to see the effect
      this.simulation.alpha(0.5).restart();
    }
  }
  
  /**
   * Restart the simulation with current settings
   */
  public restartSimulation(): void {
    if (this.simulation && this.graph) {
      this.simulation.alpha(1).restart();
    }
  }

  /**
   * Highlight a specific subgraph by ID, fading other elements
   * @param subgraphId The ID of the subgraph to highlight, or null to clear highlighting
   */
  public highlightSubgraph(subgraphId: string | null): void {
    this.activeSubgraphId = subgraphId;
    
    if (!this.graph) return;
    
    // If no subgraph is selected, reset all elements to normal appearance
    if (!subgraphId) {
      this.container.selectAll(".node circle")
        .transition().duration(300)
        .attr("opacity", 1.0)
        .attr("stroke-width", (d: any) => {
          // Preserve the stroke-width for the anchored node
          const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
          return nodeIndex === 0 ? 2 : 0;
        })
        .attr("stroke-dasharray", (d: any) => {
          // Preserve the dash array for the anchored node
          const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
          return nodeIndex === 0 ? "3,3" : null;
        })
        .attr("stroke", (d: any) => {
          // Preserve the stroke color for the anchored node
          const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
          return nodeIndex === 0 ? "#000" : null;
        });
        
      this.container.selectAll(".edge line")
        .transition().duration(300)
        .attr("opacity", 1.0)
        .attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)");
        
      this.container.selectAll(".edge text, .node text")
        .transition().duration(300)
        .attr("opacity", 1.0);
        
      return;
    }
    
    // Fade all elements first
    this.container.selectAll(".node circle")
      .transition().duration(300)
      .attr("opacity", 0.3)
      .attr("stroke-width", (d: any) => {
        // Preserve the stroke-width for the anchored node
        const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? 2 : 0;
      })
      .attr("stroke-dasharray", (d: any) => {
        // Preserve the dash array for the anchored node
        const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "3,3" : null;
      })
      .attr("stroke", (d: any) => {
        // Preserve the stroke color for the anchored node
        const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "#000" : null;
      });
      
    this.container.selectAll(".edge line")
      .transition().duration(300)
      .attr("opacity", 0.2)
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#arrowhead)");
      
    this.container.selectAll(".edge text, .node text")
      .transition().duration(300)
      .attr("opacity", 0.2);
    
    // Check if this is a web search subgraph by looking at the ID
    const isWebSearchSubgraph = subgraphId.startsWith('webSearch_');
    
    // For web search subgraphs, find and highlight the source node
    // (typically the node that initiated the web search)
    if (isWebSearchSubgraph) {
      // First, find nodes that have a property indicating they were the source of this web search
      // This is more reliable than trying to guess based on graph structure
      this.container.selectAll(".node")
        .filter((d: any) => {
          // Check for web search specific properties that would indicate this is a source node
          if (d.properties && d.properties.source_node_id) {
            return true;
          }
          
          // Also check for position in the graph (root nodes are typically first)
          const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
          return nodeIndex === 0; // First node is often the root/source
        })
        .selectAll("circle")
        .transition().duration(300)
        .attr("opacity", 1.0)
        .attr("stroke", "#EF4444") // red-500 for the source node
        .attr("stroke-width", 4);
        
      this.container.selectAll(".node")
        .filter((d: any) => {
          if (d.properties && d.properties.source_node_id) {
            return true;
          }
          const nodeIndex = this.graph?.nodes.findIndex(node => node.id === d.id);
          return nodeIndex === 0;
        })
        .selectAll("text")
        .transition().duration(300)
        .attr("opacity", 1.0);
    }
    
    // Then highlight all elements that belong to the selected subgraph
    this.container.selectAll(".node")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("circle")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke", "#2563EB") // blue-600
      .attr("stroke-width", 3);
      
    this.container.selectAll(".node")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("text")
      .transition().duration(300)
      .attr("opacity", 1.0);
      
    this.container.selectAll(".edge")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("line")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke-width", 2.5)
      .attr("stroke", "#2563EB") // blue-600
      .attr("marker-end", "url(#arrowhead-highlighted)");
      
    this.container.selectAll(".edge")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("text")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("fill", "#2563EB"); // blue-600
  }
  
  /**
   * Get list of all subgraph IDs in the current graph
   * @returns Array of unique subgraph IDs
   */
  public getSubgraphIds(): string[] {
    if (!this.graph) return [];
    
    const subgraphIds = new Set<string>();
    
    // Collect all unique subgraph IDs from nodes and edges
    this.graph.nodes.forEach(node => {
      if (node.subgraphIds) {
        node.subgraphIds.forEach(id => subgraphIds.add(id));
      }
    });
    
    this.graph.edges.forEach(edge => {
      if (edge.subgraphIds) {
        edge.subgraphIds.forEach(id => subgraphIds.add(id));
      }
    });
    
    return Array.from(subgraphIds).sort();
  }

  /**
   * Get the color for a specific node type
   * @param nodeType The node type to get the color for
   * @returns The color hex value
   */
  private getNodeColor(nodeType: string): string {
    // First check if we have a custom color for this type
    if (this.customNodeColors[nodeType]) {
      return this.customNodeColors[nodeType];
    }
    
    // Otherwise use the default colors
    return NODE_COLORS[nodeType] || NODE_COLORS.default;
  }

  /**
   * Update the color mapping for node types and refresh the graph colors
   * @param newColors Object mapping node types to colors
   */
  public updateNodeColors(newColors: Record<string, string>): void {
    // Update the custom colors
    this.customNodeColors = { ...newColors };
    
    // Update existing node colors in the visualization
    if (this.container) {
      this.container.selectAll(".node circle")
        .transition().duration(300)
        .attr("fill", (d: any) => this.customNodeColors[d.type] || NODE_COLORS[d.type] || NODE_COLORS.default);
    }
  }
}