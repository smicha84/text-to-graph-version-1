import * as d3 from "d3";
import { Graph, Node, Edge } from "@/types/graph";

// Define extension types for D3 force simulation
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink {
  id: string;
  source: SimulationNode | string;
  target: SimulationNode | string;
  label: string;
  properties: Record<string, any>;
}

// Node colors based on node type
export const NODE_COLORS: Record<string, string> = {
  'Person': '#3B82F6',       // primary blue
  'Company': '#10B981',      // secondary green
  'Organization': '#10B981', // same as Company
  'Product': '#8B5CF6',      // accent purple
  'Location': '#F59E0B',     // amber
  'default': '#6B7280'       // gray
};

export class GraphVisualizer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private graph: Graph | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private onSelectElement: (element: Node | Edge | null) => void;

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
    
    // Setup zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        this.container.attr("transform", event.transform);
      });
    
    this.svg.call(this.zoom);
    
    // Create container for graph elements
    this.container = this.svg.append("g");
    
    // Handle background click to deselect
    this.svg.on("click", () => {
      this.onSelectElement(null);
    });
  }

  private simulation: d3.Simulation<SimulationNode, SimulationLink> | null = null;
  
  public render(graph: Graph): void {
    this.graph = graph;
    
    // Clear existing elements
    this.container.selectAll("*").remove();
    
    // Stop any existing simulation
    if (this.simulation) {
      this.simulation.stop();
    }
    
    // Prepare node and link data for force simulation
    const nodeData = graph.nodes.map(node => ({
      ...node,
      x: node.x || this.width / 2 + (Math.random() - 0.5) * 100,
      y: node.y || this.height / 2 + (Math.random() - 0.5) * 100
    })) as SimulationNode[];
    
    // Create link data with references to node objects
    const linkData = graph.edges.map(edge => {
      const source = nodeData.find(n => n.id === edge.source);
      const target = nodeData.find(n => n.id === edge.target);
      if (!source || !target) {
        console.error(`Could not find nodes for edge: ${edge.id}`);
        return null;
      }
      return { ...edge, source, target } as SimulationLink;
    }).filter(Boolean) as SimulationLink[];
    
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
    
    // Draw edge lines
    const edgeLines = links.append("line")
      .attr("stroke", "#9CA3AF") // gray-400
      .attr("stroke-width", 1.5);
    
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
      .on("click", (event: MouseEvent, d: SimulationNode) => {
        event.stopPropagation();
        this.onSelectElement(d as unknown as Node);
      })
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          if (!event.active && this.simulation) {
            this.simulation.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
          if (!event.active && this.simulation) {
            this.simulation.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        }));
    
    // Node circles
    nodes.append("circle")
      .attr("r", 20)
      .attr("fill", (d: SimulationNode) => NODE_COLORS[d.type] || NODE_COLORS.default);
    
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
    
    // Create force simulation
    this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>(nodeData)
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(linkData)
        .id((d: SimulationNode) => d.id)
        .distance(100)) // Distance between connected nodes
      .force("charge", d3.forceManyBody<SimulationNode>().strength(-300)) // Repulsion between nodes
      .force("center", d3.forceCenter<SimulationNode>(this.width / 2, this.height / 2)) // Center of the layout
      .force("collision", d3.forceCollide<SimulationNode>().radius(40)) // Prevent node overlap
      .on("tick", () => {
        // Update link positions
        edgeLines
          .attr("x1", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            return sourceNode.x || 0;
          })
          .attr("y1", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            return sourceNode.y || 0;
          })
          .attr("x2", (d: SimulationLink) => {
            const targetNode = d.target as SimulationNode;
            return targetNode.x || 0;
          })
          .attr("y2", (d: SimulationLink) => {
            const targetNode = d.target as SimulationNode;
            return targetNode.y || 0;
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
      this.width / graphWidth,
      this.height / graphHeight,
      2 // Max scale
    );
    
    // Calculate translation to center
    const translateX = this.width / 2 - ((minX + maxX) / 2) * scale;
    const translateY = this.height / 2 - ((minY + maxY) / 2) * scale;
    
    // Apply transform
    this.svg.transition().duration(300).call(
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
}
