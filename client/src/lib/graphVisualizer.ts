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
  'Product': '#8B5CF6',      // purple
  'Project': '#6366F1',      // indigo
  'Document': '#A855F7',     // purple light
  'Event': '#D946EF',        // fuchsia
  'Technology': '#2563EB',   // blue
  'Initiative': '#7C3AED',   // violet
  
  // Default for any unmatched types
  'default': '#6B7280'       // gray
};

// Import layout settings interface
import { LayoutSettings } from "@/components/LayoutControls";

export class GraphVisualizer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private graph: Graph | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private onSelectElement: (element: Node | Edge | null) => void;
  private activeSubgraphId: string | null = null;
  private customNodeColors: Record<string, string> = {};
  private layoutSettings: LayoutSettings = {
    nodeRepulsion: 500,
    linkDistance: 150,
    centerStrength: 0.03,
    collisionRadius: 50
  };
  
  // Custom style maps for individual nodes and edges
  private nodeStyles: Map<string, NodeStyle> = new Map();
  private edgeStyles: Map<string, EdgeStyle> = new Map();
  
  // Expose simulation for cleanup
  public getSimulation(): d3.Simulation<SimulationNode, SimulationLink> | null {
    return this.simulation;
  };
  
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
    if (!this.graph) return;
    
    // Apply node styles
    this.container.selectAll<SVGGElement, SimulationNode>(".node").each((d, i, nodes) => {
      const nodeEl = d3.select(nodes[i]);
      const style = this.nodeStyles.get(d.id);
      
      if (style) {
        // Apply color
        if (style.color) {
          nodeEl.select("circle").attr("fill", style.color);
        }
        
        // Apply size
        if (style.size) {
          nodeEl.select("circle").attr("r", style.size);
        }
        
        // Apply border
        if (style.borderColor) {
          nodeEl.select("circle")
            .attr("stroke", style.borderColor)
            .attr("stroke-width", style.borderWidth || 1);
        }
        
        // Apply label color and size
        if (style.labelColor) {
          nodeEl.selectAll("text").attr("fill", style.labelColor);
        }
        
        if (style.labelSize) {
          nodeEl.select("text:first-of-type").attr("font-size", `${style.labelSize}px`);
          nodeEl.select("text:last-of-type").attr("font-size", `${style.labelSize * 0.9}px`);
        }
        
        // Apply pinned state
        if (style.pinned) {
          const node = d as SimulationNode;
          node.fx = node.x;
          node.fy = node.y;
        } else {
          const node = d as SimulationNode;
          if (node.fx !== undefined || node.fy !== undefined) {
            node.fx = null;
            node.fy = null;
            
            // Restart simulation to apply changes
            if (this.simulation) {
              this.simulation.alpha(0.3).restart();
            }
          }
        }
      }
    });
    
    // Apply edge styles
    this.container.selectAll<SVGGElement, SimulationLink>(".edge").each((d, i, edges) => {
      const edgeEl = d3.select(edges[i]);
      const style = this.edgeStyles.get(d.id);
      
      if (style) {
        // Apply color
        if (style.color) {
          edgeEl.select("line").attr("stroke", style.color);
        }
        
        // Apply width
        if (style.width) {
          edgeEl.select("line").attr("stroke-width", style.width);
        }
        
        // Apply dashed style
        if (style.dashed) {
          edgeEl.select("line").attr("stroke-dasharray", "5,5");
        } else {
          edgeEl.select("line").attr("stroke-dasharray", null);
        }
        
        // Apply label color and size
        if (style.labelColor) {
          edgeEl.select("text").attr("fill", style.labelColor);
        }
        
        if (style.labelSize) {
          edgeEl.select("text").attr("font-size", `${style.labelSize}px`);
        }
      }
    });
  }

  constructor(
    svgElement: SVGSVGElement,
    width: number,
    height: number,
    onSelectElement: (element: Node | Edge | null) => void
  ) {
    this.svg = d3.select(svgElement);
    this.width = width;
    this.height = height;
    this.onSelectElement = onSelectElement;
    
    // Setup zoom behavior with panning explicitly enabled
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        this.container.attr("transform", event.transform);
      });
    
    // Apply zoom and enable panning directly to SVG element
    this.svg.call(this.zoom);
    
    // Create a background rectangle to capture pan events
    // This needs to be added before the container to ensure it's behind everything
    this.svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "transparent")
      .style("cursor", "move")
      .attr("class", "background-rect");
    
    // Create container for graph elements
    this.container = this.svg.append("g").attr("class", "graph-container");
    
    // Add definitions for markers (arrows)
    const defs = this.svg.append("defs");
    
    // Define arrow marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) // Position the arrow away from the end of the line
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", "#9CA3AF") // Match the edge color
      .attr("stroke", "none");
    
    // Handle background click to deselect - use click event to avoid interfering with panning
    this.svg.on("click", (event) => {
      // Only deselect on direct SVG background click, not on nodes or edges
      if (event.target === this.svg.node()) {
        this.onSelectElement(null);
      }
    });
  }

  private simulation: d3.Simulation<SimulationNode, SimulationLink> | null = null;
  
  public render(graph: Graph): void {
    console.log("Rendering graph:", graph);
    this.graph = graph;
    
    // Clear all existing elements from the SVG
    this.svg.selectAll("*").remove();
    
    // Stop any existing simulation
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }
    
    // Create a background rectangle to capture pan events
    // This needs to be added before the container to ensure it's behind everything
    this.svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "transparent")
      .style("cursor", "move")
      .attr("class", "background-rect");
      
    // Re-add definitions for markers
    const defs = this.svg.append("defs");
    
    // Define default gray arrow marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) // Position the arrow away from the end of the line
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", "#9CA3AF") // Gray color (match the edge color)
      .attr("stroke", "none");
      
    // Define blue arrow marker for highlighted edges
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
      .attr("fill", "#2563EB") // Blue color for highlighted edges
      .attr("stroke", "none");
    
    // Recreate the container for graph elements
    this.container = this.svg.append("g");
    
    // Re-setup the zoom behavior with panning explicitly enabled
    this.zoom
      .filter((event) => {
        // Always return true to enable all zoom/pan behaviors
        return true;
      });
      
    this.svg.call(this.zoom);
    
    // Re-apply cursor style for panning
    this.svg.style("cursor", "move");
    
    // Setup click handler using click instead of mousedown to avoid interfering with panning
    this.svg.on("click", (event) => {
      // Only deselect on direct SVG background click, not on nodes or edges
      if (event.target === this.svg.node()) {
        this.onSelectElement(null);
      }
    });
    
    // Validate graph data
    if (!graph || !graph.nodes || !graph.edges) {
      console.error("Invalid graph data:", graph);
      return;
    }
    
    console.log(`Processing ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    
    // Prepare node and link data for force simulation
    const nodeData = graph.nodes.map(node => ({
      ...node,
      x: node.x || this.width / 2 + (Math.random() - 0.5) * 100,
      y: node.y || this.height / 2 + (Math.random() - 0.5) * 100
    })) as SimulationNode[];
    
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
        event.stopPropagation();
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
      .on("click", (event: MouseEvent, d: SimulationNode) => {
        event.stopPropagation();
        this.onSelectElement(d as unknown as Node);
      })
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
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
          // Update fixed position during drag
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          if (!event.active && this.simulation) {
            this.simulation.alphaTarget(0);
          }
          // Release fixed position and restore visual state
          d.fx = null;
          d.fy = null;
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
      .style("cursor", "grab") // Change cursor to indicate draggable
    
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
      .force("charge", d3.forceManyBody<SimulationNode>().strength(-this.layoutSettings.nodeRepulsion)) // Repulsion between nodes
      .force("center", d3.forceCenter<SimulationNode>(this.width / 2, this.height / 2).strength(this.layoutSettings.centerStrength)) // Center of the layout
      .force("collision", d3.forceCollide<SimulationNode>().radius(this.layoutSettings.collisionRadius)) // Prevent node overlap
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
      minX = this.width / 2 - 100;
      maxX = this.width / 2 + 100;
      minY = this.height / 2 - 100;
      maxY = this.height / 2 + 100;
    }
    
    // Add padding
    const padding = 80; // Increased padding for better visuals
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    if (graphWidth === 0 || graphHeight === 0) {
      console.log("Graph has zero width or height, using default sizing");
      // Default to reasonable values if graph has zero dimensions
      minX = this.width / 2 - 100;
      maxX = this.width / 2 + 100;
      minY = this.height / 2 - 100;
      maxY = this.height / 2 + 100;
    }
    
    // Calculate scale to fit
    const scale = Math.min(
      this.width / graphWidth,
      this.height / graphHeight,
      1.5 // Reduced max scale for better overall view
    );
    
    // Calculate translation to center
    const translateX = this.width / 2 - ((minX + maxX) / 2) * scale;
    const translateY = this.height / 2 - ((minY + maxY) / 2) * scale;
    
    console.log(`Centering graph: translate(${translateX}, ${translateY}) scale(${scale})`);
    
    // Apply transform
    this.svg.transition().duration(500).call( // Increased duration for smoother transition
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
        chargeForce.strength(-settings.nodeRepulsion);
      }
      
      // Update center gravity
      const centerForce = this.simulation.force("center") as d3.ForceCenter<SimulationNode>;
      if (centerForce) {
        centerForce.strength(settings.centerStrength);
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
        .attr("stroke-width", 0);
        
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
      .attr("stroke-width", 0);
      
    this.container.selectAll(".edge line")
      .transition().duration(300)
      .attr("opacity", 0.2)
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#arrowhead)");
      
    this.container.selectAll(".edge text, .node text")
      .transition().duration(300)
      .attr("opacity", 0.2);
    
    // Then highlight the elements that belong to the selected subgraph
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
