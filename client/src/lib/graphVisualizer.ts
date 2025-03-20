import * as d3 from "d3";
import { Graph, Node, Edge } from "@/types/graph";

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

  public render(graph: Graph): void {
    this.graph = graph;
    
    // Clear existing elements
    this.container.selectAll("*").remove();
    
    // Draw edges first
    const edges = this.container
      .selectAll(".edge")
      .data(graph.edges)
      .enter()
      .append("g")
      .attr("class", "edge")
      .on("click", (event, d) => {
        event.stopPropagation();
        this.onSelectElement(d);
      });
    
    // Draw edge lines
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
    const nodes = this.container
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        this.onSelectElement(d);
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
