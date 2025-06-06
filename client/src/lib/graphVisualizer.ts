import * as d3 from "d3";
import { Graph, Node, Edge } from "@/types/graph";
import { NodeStyle, EdgeStyle } from "@/types/graph";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { 
  getNodeDisplayLabel, 
  getEdgeDisplayLabel, 
  getNodeType2, 
  getNodeMainType 
} from "@/lib/displayUtils";

// Define extension types for D3 force simulation
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
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
    nodeRepulsion: 300, // Increased from 200 to 300
    linkDistance: 140, // Increased from 100 to 140
    centerStrength: 0.05,
    collisionRadius: 50 // Increased from 30 to 50
  };
  private nodeStyles: Map<string, NodeStyle> = new Map();
  private edgeStyles: Map<string, EdgeStyle> = new Map();
  private simulation: d3.Simulation<SimulationNode, SimulationLink> | null = null;
  private nodeTooltip: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;
  
  // Mode for interactive creation
  private interactionMode: 'select' | 'addNode' | 'addEdge' = 'select';
  private sourceNodeForEdge: SimulationNode | null = null;
  private tempEdge: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;
  private nodeCounter: number = 0;
  private edgeCounter: number = 0;

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
      .style("cursor", "move")
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        
        if (this.interactionMode === 'addNode') {
          // Create a new node at the clicked position
          const [x, y] = d3.pointer(event, this.container.node());
          this.createNewNode(x, y);
        } else if (this.interactionMode === 'addEdge') {
          // Cancel edge creation if in progress
          this.cancelEdgeCreation();
        } else {
          // Standard selection mode - deselect
          this.onSelectElement(null);
        }
      })
      .on("dblclick", (event) => {
        // Double-click on background always creates a new node
        const [x, y] = d3.pointer(event, this.container.node());
        this.createNewNode(x, y);
      });
      
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
    
    // Event handlers for click and double-click are already registered on the background rect above
    
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
      .style("display", "none")
      // Add mouseenter handler to prevent tooltip from disappearing when cursor moves to it
      .on("mouseenter", () => {
        // When mouse enters tooltip, keep it visible
        if (this.nodeTooltip) {
          this.nodeTooltip
            .transition()
            .duration(200)
            .style("opacity", 1);
        }
      })
      .on("mouseleave", () => {
        // Only hide tooltip when mouse leaves the tooltip itself
        this.hideNodeTooltip();
      });
  }
  
  // Show tooltip for a node
  private showNodeTooltip(event: MouseEvent, d: SimulationNode): void {
    if (!this.nodeTooltip || !this.graph) return;
    
    // Position the tooltip near the mouse but slightly offset
    const x = event.pageX + 10;
    const y = event.pageY - 10;
    
    // Get node display label using our utility function
    const nodeName = getNodeDisplayLabel(d);
    const nodeType = d.type || '';
    
    // Generate property list HTML
    let propertiesList = '';
    if (d.properties && Object.keys(d.properties).length > 0) {
      propertiesList = '<div class="properties-container" style="margin-top: 8px; max-height: 200px; overflow-y: auto;">';
      propertiesList += '<h5 style="margin: 5px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Properties</h5>';
      
      // Generate table-like view of properties
      propertiesList += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
      
      // Sort properties alphabetically for consistent display
      const sortedKeys = Object.keys(d.properties).sort();
      
      for (const key of sortedKeys) {
        // Skip special properties that might be used for internal purposes
        if (key === 'x' || key === 'y' || key === 'fx' || key === 'fy') continue;
        
        const value = d.properties[key];
        let displayValue = value;
        
        // Format value based on type
        if (value === null || value === undefined) {
          displayValue = '<em style="color: #888;">undefined</em>';
        } else if (typeof value === 'object') {
          try {
            displayValue = JSON.stringify(value);
          } catch (e) {
            displayValue = `[Object]`;
          }
        }
        
        propertiesList += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 3px; font-weight: 600; color: #555;">${key}</td>
            <td style="padding: 3px; word-break: break-word;">${displayValue}</td>
          </tr>
        `;
      }
      
      propertiesList += '</table></div>';
    }
    
    // Only add web search buttons for nodes, not edges
    const webSearchButtons = this.onWebSearch ? `
      <div style="margin-top: 10px;">
        <button class="web-search-btn" data-node-id="${d.id}" data-query-type="auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Smart Search
        </button>
        <button class="web-search-btn" style="margin-top: 4px;" data-node-id="${d.id}" data-query-type="simple">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          Basic Search
        </button>
        <button class="taxonomy-btn" style="margin-top: 4px;" data-node-id="${d.id}" data-node-type="${d.type}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 9V3H12"></path><path d="M13 13V8h5"></path><circle cx="7" cy="8" r="1"></circle><circle cx="11" cy="13" r="1"></circle><circle cx="7" cy="18" r="1"></circle></svg>
          Create Taxonomy
        </button>
      </div>
    ` : '';
    
    // Add node ID info
    const nodeIdSection = `<div style="font-size: 12px; color: #666; margin-top: 4px;">ID: ${d.id}</div>`;
    
    // Extract type2 information using our utility functions
    const mainType = getNodeMainType(d);
    const type2 = getNodeType2(d);
    
    // Create type section with both type and subtype if available
    let typeSection = '';
    if (nodeType) {
      typeSection = `<div style="font-size: 13px;"><strong>Type:</strong> ${mainType}</div>`;
      if (type2) {
        typeSection += `<div style="font-size: 13px;"><strong>Subtype:</strong> ${type2}</div>`;
      }
    }
    
    // Store type2 in properties if it's not already there, for use in search and display
    if (type2 && !d.properties.type2) {
      if (!d.properties) d.properties = {};
      d.properties.type2 = type2;
    }
    
    // Create tooltip content with web search buttons and properties
    this.nodeTooltip
      .html(`
        <div class="tooltip-header" style="border-bottom: 1px solid #ddd; margin-bottom: 6px; padding-bottom: 4px;">
          <h4 style="margin: 0; font-size: 16px;">${nodeName}</h4>
          ${typeSection}
          ${nodeIdSection}
        </div>
        <div class="node-tooltip-content">
          ${propertiesList}
          ${webSearchButtons}
        </div>
      `)
      .style("left", `${x}px`)
      .style("top", `${y}px`)
      .style("display", "block")
      .style("opacity", 0)
      .transition()
      .duration(200)
      .style("opacity", 1);
      
    // Add event listeners to web search buttons using D3's on method
    if (this.onWebSearch) {
      // Use D3 event handlers instead of native DOM methods to avoid TypeScript errors
      this.nodeTooltip.select('button[data-query-type="auto"]')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          try {
            // Use the graph context to generate a smart search query
            const autoQuery = this.graph 
              ? this.generateSearchQuery(d.id)
              : getNodeDisplayLabel(d) + " " + d.type;
            this.onWebSearch!(d.id, autoQuery);
            this.hideNodeTooltip(); // Hide tooltip after clicking
          } catch (error) {
            console.error("Error in auto web search:", error);
            // Fallback to simple search
            this.onWebSearch!(d.id, getNodeDisplayLabel(d) + " " + d.type);
            this.hideNodeTooltip();
          }
        });
      
      this.nodeTooltip.select('button[data-query-type="simple"]')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          this.onWebSearch!(d.id, getNodeDisplayLabel(d) + " " + d.type);
          this.hideNodeTooltip(); // Hide tooltip after clicking
        });
      
      // Add event listener for taxonomy button
      this.nodeTooltip.select('.taxonomy-btn')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          this.createTaxonomyForNode(d);
          this.hideNodeTooltip(); // Hide tooltip after clicking
        });
    }
  }
  
  // Helper method to generate search query
  private generateSearchQuery(nodeId: string): string {
    if (!this.graph) return "";
    try {
      // Use the imported utility function from webSearchUtils - imported at the top of file
      return generateWebSearchQuery(this.graph, nodeId);
    } catch (error) {
      console.error("Error generating search query:", error);
      // Get the node from the graph
      const node = this.graph.nodes.find(n => n.id === nodeId);
      return node ? `${getNodeDisplayLabel(node)} ${node.type}` : "";
    }
  }
  
  /**
   * Create a new node at the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   */
  private createNewNode(x: number, y: number): void {
    if (!this.graph) {
      // If there's no graph, create a new one
      this.graph = { nodes: [], edges: [], subgraphCounter: 1 };
    }
    
    // Generate a unique ID for the new node
    this.nodeCounter++;
    const nodeId = `n_${Date.now().toString(36)}_${this.nodeCounter}`;
    
    // Create a new node with default values
    const newNode: Node = {
      id: nodeId,
      type: "Custom", // Default type
      properties: {
        name: "New Node",
        description: "Double-click to edit properties",
        createdManually: true,
        creationDate: new Date().toISOString()
      },
      x: x,
      y: y,
      subgraphIds: ["sg_manual"]
    };
    
    // Add the node to the graph
    this.graph.nodes.push(newNode);
    
    // If we're in edge creation mode, connect this node to the source node
    if (this.interactionMode === 'addEdge' && this.sourceNodeForEdge) {
      this.createNewEdge(this.sourceNodeForEdge.id, nodeId);
      this.cancelEdgeCreation();
    }
    
    // Update the visualization with the new node
    this.render(this.graph);
    
    // Select the new node
    this.onSelectElement(newNode);
  }
  
  /**
   * Start the process of creating a new edge from a source node
   * @param sourceNodeId The ID of the source node
   */
  private startEdgeCreation(sourceNodeId: string): void {
    if (!this.graph) return;
    
    // Find the source node
    const sourceNode = this.graph.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;
    
    // Convert to a simulation node
    const simulationNode = {
      ...sourceNode,
      id: sourceNode.id,
      type: sourceNode.type,
      properties: sourceNode.properties,
      x: sourceNode.x,
      y: sourceNode.y
    } as SimulationNode;
    
    // Set as the source node for the edge
    this.sourceNodeForEdge = simulationNode;
    
    // Set the interaction mode
    this.interactionMode = 'addEdge';
    
    // Create a temporary line to visualize the edge being created
    this.tempEdge = this.container.append("line")
      .attr("class", "temp-edge")
      .attr("x1", sourceNode.x || 0)
      .attr("y1", sourceNode.y || 0)
      .attr("x2", sourceNode.x || 0)
      .attr("y2", sourceNode.y || 0)
      .attr("stroke", "#2563EB")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("marker-end", "url(#arrowhead-highlighted)");
    
    // Add a mousemove handler to update the temporary edge
    this.svg.on("mousemove.edgecreation", (event) => {
      if (!this.tempEdge) return;
      
      // Get the cursor position in the container coordinates
      const [x, y] = d3.pointer(event, this.container.node());
      
      // Update the end point of the temporary edge
      this.tempEdge
        .attr("x2", x)
        .attr("y2", y);
    });
  }
  
  /**
   * Create a new edge between two nodes
   * @param sourceNodeId The ID of the source node
   * @param targetNodeId The ID of the target node
   */
  private createNewEdge(sourceNodeId: string, targetNodeId: string): void {
    if (!this.graph) return;
    
    // Don't create self-loops
    if (sourceNodeId === targetNodeId) return;
    
    // Generate a unique ID for the new edge
    this.edgeCounter++;
    const edgeId = `e_${Date.now().toString(36)}_${this.edgeCounter}`;
    
    // Create a new edge with default values
    const newEdge: Edge = {
      id: edgeId,
      source: sourceNodeId,
      target: targetNodeId,
      label: "RELATED_TO", // Default label
      properties: {
        createdManually: true,
        creationDate: new Date().toISOString()
      },
      subgraphIds: ["sg_manual"]
    };
    
    // Add the edge to the graph
    this.graph.edges.push(newEdge);
    
    // Update the visualization with the new edge
    this.render(this.graph);
    
    // Select the new edge
    this.onSelectElement(newEdge);
  }
  
  /**
   * Cancel the edge creation process
   */
  private cancelEdgeCreation(): void {
    // Remove the temporary edge
    if (this.tempEdge) {
      this.tempEdge.remove();
      this.tempEdge = null;
    }
    
    // Clear the source node
    this.sourceNodeForEdge = null;
    
    // Remove the mousemove handler
    this.svg.on("mousemove.edgecreation", null);
    
    // Reset the interaction mode
    this.interactionMode = 'select';
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
    
    // Check for multiple edges between the same nodes
    // Create a map to track connections
    const connectionCounts: Record<string, number> = {};
    const edgeIndexes: Record<string, number> = {};
    
    // Count connections between each pair of nodes
    linkData.forEach((link: SimulationLink) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      // Create a unique key for this pair of nodes (both directions)
      const key = `${sourceId}-${targetId}`;
      const reverseKey = `${targetId}-${sourceId}`;
      
      // Increment count for this connection
      if (!connectionCounts[key]) {
        connectionCounts[key] = 0;
      }
      connectionCounts[key]++;
      
      // Set the index for this edge
      edgeIndexes[link.id] = connectionCounts[key];
    });
    
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
    
    // Draw edge paths instead of lines to support curves
    const edgeLines = links.append("path")
      .attr("fill", "none")
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
        // Check if mouse is moving to the tooltip
        if (this.nodeTooltip) {
          const tooltipElement = this.nodeTooltip.node();
          if (tooltipElement) {
            // Check where the mouse is going
            const relatedTarget = event.relatedTarget;
            
            // Don't hide the tooltip if the mouse is moving to the tooltip
            // Use a different approach to avoid TypeScript errors with Node type
            let isMovingToTooltip = false;
            
            // Check if related target is a child of tooltip
            if (relatedTarget instanceof Element) {
              // Check if relatedTarget is the tooltip or contained by it
              isMovingToTooltip = tooltipElement === relatedTarget || tooltipElement.contains(relatedTarget);
            }
            
            if (!isMovingToTooltip) {
              // Give a short delay to check if the mouse is actually over the tooltip
              // This helps with cases where the relatedTarget isn't working correctly
              setTimeout(() => {
                // Check if mouse is over the tooltip now
                const tooltipBounds = tooltipElement.getBoundingClientRect();
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                const isMouseOverTooltip = 
                  mouseX >= tooltipBounds.left && mouseX <= tooltipBounds.right &&
                  mouseY >= tooltipBounds.top && mouseY <= tooltipBounds.bottom;
                
                // Only hide if mouse is really not over tooltip
                if (!isMouseOverTooltip) {
                  this.hideNodeTooltip();
                }
              }, 50);
            }
          } else {
            this.hideNodeTooltip();
          }
        } else {
          this.hideNodeTooltip();
        }
      })
      .on("click", (event: MouseEvent, d: SimulationNode) => {
        // Prevent the click from propagating to the background
        event.stopPropagation();
        
        // Handle based on the current interaction mode
        if (this.interactionMode === 'addEdge') {
          // If we already have a source node, create an edge to this target node
          if (this.sourceNodeForEdge) {
            // Don't create self-loops
            if (this.sourceNodeForEdge.id !== d.id) {
              this.createNewEdge(this.sourceNodeForEdge.id, d.id);
            }
            // Reset the edge creation state
            this.cancelEdgeCreation();
          } else {
            // Start creating an edge from this node
            this.startEdgeCreation(d.id);
          }
        } else if (this.interactionMode === 'select') {
          // Standard selection mode - select this node
          this.onSelectElement(d as unknown as Node);
        }
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
      .attr("r", 40) // Increased from 30 to 40
      .attr("fill", (d: SimulationNode) => {
        // Use custom color if available, otherwise fall back to default color map
        return this.customNodeColors[d.type] || NODE_COLORS[d.type] || NODE_COLORS.default;
      })
      .attr("stroke", (d: SimulationNode) => {
        // If the node has a web search source, add a distinctive border
        if (d.properties.source === "web search result") {
          return "#2563EB"; // Blue border for web search results
        }
        
        // Otherwise, add a border to the first node to indicate it's anchored
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "#000" : null;
      })
      .attr("stroke-width", (d: SimulationNode) => {
        // Web search results and the anchor node get borders
        if (d.properties.source === "web search result") {
          return 3;
        }
        
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? 2 : 0;
      })
      .attr("stroke-dasharray", (d: SimulationNode) => {
        // Different dash patterns for different node types
        if (d.properties.source === "web search result") {
          return "5,2"; // Distinctive dash pattern for web search results
        }
        
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "3,3" : null;
      })
      .style("cursor", (d: SimulationNode) => {
        // The first node is fixed and cannot be freely dragged
        const nodeIndex = graph.nodes.findIndex(node => node.id === d.id);
        return nodeIndex === 0 ? "default" : "grab";
      })
    
    // Add web search indicator badge for search results
    nodes.append("circle")
      .attr("r", 6)
      .attr("cx", 18)
      .attr("cy", -18)
      .attr("fill", "#2563EB") // Blue badge for web search results
      .attr("stroke", "#FFF")
      .attr("stroke-width", 1.5)
      .style("display", (d: SimulationNode) => 
        d.properties.source === "web search result" ? "block" : "none"
      );
      
    // Add globe icon in the badge for web search results
    nodes.append("text")
      .attr("x", 18)
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "white")
      .attr("font-size", "6px")
      .attr("font-weight", "bold")
      .text((d: SimulationNode) => d.properties.source === "web search result" ? "W" : "")
      .style("display", (d: SimulationNode) => 
        d.properties.source === "web search result" ? "block" : "none"
      );
    
    // Node labels (name property inside circle)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-5")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .attr("font-size", "14px") // Increased from 12px to 14px
      .text((d: SimulationNode) => getNodeDisplayLabel(d));
      
    // Add type pill below the node label
    nodes.append("rect")
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("width", (d: SimulationNode) => {
        // Calculate width based on text length (approximate)
        return Math.max(d.type.length * 6 + 12, 40); // Increased width calculation
      })
      .attr("height", 18) // Increased from 16 to 18
      .attr("x", (d: SimulationNode) => {
        // Center the pill
        return -(Math.max(d.type.length * 6 + 12, 40)) / 2;
      })
      .attr("y", 10) // Increased from 5 to 10
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
      
    // Add type text in the pill
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 22) // Increased from 15 to 22
      .attr("fill", "#666")
      .attr("font-size", "11px") // Increased from 9px to 11px
      .text((d: SimulationNode) => d.type?.toLowerCase());
    
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
        // Update link positions with adjustments for node radius and curve for multiple edges
        edgeLines
          .attr("d", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            const nodeRadius = 40; // Same as the circle radius
            
            // Get source and target positions
            const sourceX = sourceNode.x || 0;
            const sourceY = sourceNode.y || 0;
            const targetX = targetNode.x || 0;
            const targetY = targetNode.y || 0;
            
            // Calculate the direction vector
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            
            // Calculate the length of the vector
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // If source and target are at the same position, return a small self-loop
            if (length === 0) {
              // Create a self-loop
              return `M ${sourceX},${sourceY} C ${sourceX+50},${sourceY-50} ${sourceX+50},${sourceY+50} ${sourceX},${sourceY}`;
            }
            
            // Calculate the normalized direction vector
            const normX = dx / length;
            const normY = dy / length;
            
            // Calculate the position with an offset from the target node's edge
            const endX = targetX - normX * nodeRadius;
            const endY = targetY - normY * nodeRadius;
            
            // Create a key to identify the edge pair
            const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
            const targetId = typeof d.target === 'string' ? d.target : d.target.id;
            const pairKey = `${sourceId}-${targetId}`;
            const reversePairKey = `${targetId}-${sourceId}`;
            
            // Check if this is a multiple edge
            const count = connectionCounts[pairKey] || connectionCounts[reversePairKey] || 1;
            const index = edgeIndexes[d.id] || 1;
            
            if (count > 1) {
              // For multiple edges, we'll create a curved path
              // The curvature increases based on the index of the edge
              // Tripled curveFactor for much more pronounced curves and better separation
              const curveFactor = 150 * (index / count); // Scale the curve based on index (increased from 50 to 150)
              
              // Calculate control point - perpendicular to the direction vector
              const cpX = (sourceX + endX) / 2 + normY * curveFactor;
              const cpY = (sourceY + endY) / 2 - normX * curveFactor;
              
              // Create a quadratic curve path
              return `M ${sourceX},${sourceY} Q ${cpX},${cpY} ${endX},${endY}`;
            } else {
              // For single edges, create a straight line path
              return `M ${sourceX},${sourceY} L ${endX},${endY}`;
            }
          });
        
        // Update edge label positions
        edgeLabels
          .attr("x", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            
            // Get source and target positions
            const sourceX = sourceNode.x || 0;
            const sourceY = sourceNode.y || 0;
            const targetX = targetNode.x || 0;
            const targetY = targetNode.y || 0;
            
            // Create a key to identify the edge pair
            const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
            const targetId = typeof d.target === 'string' ? d.target : d.target.id;
            const pairKey = `${sourceId}-${targetId}`;
            const reversePairKey = `${targetId}-${sourceId}`;
            
            // Check if this is a multiple edge
            const count = connectionCounts[pairKey] || connectionCounts[reversePairKey] || 1;
            const index = edgeIndexes[d.id] || 1;
            
            if (count > 1) {
              // For curved edges, we need to position the label along the curve
              const curveFactor = 150 * (index / count); // Tripled from 50 to 150 to match path curvature
              
              // Calculate the direction vector
              const dx = targetX - sourceX;
              const dy = targetY - sourceY;
              const length = Math.sqrt(dx * dx + dy * dy);
              
              // Calculate normalized direction
              const normX = dx / length;
              const normY = dy / length;
              
              // Position label at the midpoint of the curve
              // Adjust the label position to be along the curve
              const midX = (sourceX + targetX) / 2;
              const midY = (sourceY + targetY) / 2;
              
              // Add perpendicular offset for the label (similar to curve offset)
              return midX + normY * (curveFactor * 0.6); // Scale down the offset for label
            } else {
              // For straight edges, just use the middle
              return ((sourceX + targetX) / 2);
            }
          })
          .attr("y", (d: SimulationLink) => {
            const sourceNode = d.source as SimulationNode;
            const targetNode = d.target as SimulationNode;
            
            // Get source and target positions
            const sourceX = sourceNode.x || 0;
            const sourceY = sourceNode.y || 0;
            const targetX = targetNode.x || 0;
            const targetY = targetNode.y || 0;
            
            // Create a key to identify the edge pair
            const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
            const targetId = typeof d.target === 'string' ? d.target : d.target.id;
            const pairKey = `${sourceId}-${targetId}`;
            const reversePairKey = `${targetId}-${sourceId}`;
            
            // Check if this is a multiple edge
            const count = connectionCounts[pairKey] || connectionCounts[reversePairKey] || 1;
            const index = edgeIndexes[d.id] || 1;
            
            if (count > 1) {
              // For curved edges, we need to position the label along the curve
              const curveFactor = 150 * (index / count); // Tripled from 50 to 150 to match path curvature
              
              // Calculate the direction vector
              const dx = targetX - sourceX;
              const dy = targetY - sourceY;
              const length = Math.sqrt(dx * dx + dy * dy);
              
              // Calculate normalized direction
              const normX = dx / length;
              const normY = dy / length;
              
              // Position label at the midpoint of the curve
              // Adjust the label position to be along the curve
              const midX = (sourceX + targetX) / 2;
              const midY = (sourceY + targetY) / 2;
              
              // Add perpendicular offset for the label (similar to curve offset)
              return midY - normX * (curveFactor * 0.6) - 3; // Scale down the offset for label, slight up adjustment
            } else {
              // For straight edges, just use the middle with slight up adjustment
              return ((sourceY + targetY) / 2) - 6;
            }
          })
          // Set text-anchor to middle for all labels
          .attr("text-anchor", "middle");
        
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
   * Set the interaction mode for the graph visualizer
   * @param mode The interaction mode to set ('select', 'addNode', or 'addEdge')
   */
  public setInteractionMode(mode: 'select' | 'addNode' | 'addEdge'): void {
    // Cancel any in-progress edge creation
    if (this.interactionMode === 'addEdge') {
      this.cancelEdgeCreation();
    }
    
    // Set the new mode
    this.interactionMode = mode;
    
    // Update the cursor style based on the mode
    if (this.svg) {
      if (mode === 'addNode') {
        this.svg.style("cursor", "crosshair");
      } else if (mode === 'addEdge') {
        this.svg.style("cursor", "alias");
      } else {
        this.svg.style("cursor", "default");
      }
    }
  }
  
  /**
   * Get the current interaction mode
   * @returns The current interaction mode
   */
  public getInteractionMode(): 'select' | 'addNode' | 'addEdge' {
    return this.interactionMode;
  }
  
  /**
   * Start edge creation from a specific node
   * @param nodeId The ID of the source node to start the edge from
   */
  public startEdgeFromNode(nodeId: string): void {
    this.setInteractionMode('addEdge');
    this.startEdgeCreation(nodeId);
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
            .attr("fill", style.labelColor || "black")
            .attr("font-size", `${style.labelSize || 12}px`);
        }
      });
    
    // Apply edge styles
    this.container.selectAll<SVGGElement, SimulationLink>(".edge")
      .each((d, i, edges) => {
        const edgeElement = d3.select(edges[i]);
        const style = this.edgeStyles.get(d.id);
        
        if (style) {
          // Apply path styles - using path instead of line for curves
          edgeElement.select("path")
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
        
      this.container.selectAll(".edge path")
        .transition().duration(300)
        .attr("opacity", 1.0)
        .attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)");
        
      this.container.selectAll(".edge text, .node text")
        .transition().duration(300)
        .attr("opacity", 1.0);
        
      return;
    }
    
    // Create a set of node IDs that are in the selected subgraph for quick lookups
    const nodesInSubgraph = new Set<string>();
    if (this.graph && this.graph.nodes) {
      this.graph.nodes.forEach(node => {
        if (node.subgraphIds && node.subgraphIds.includes(subgraphId)) {
          nodesInSubgraph.add(node.id);
        }
      });
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
      
    this.container.selectAll(".edge path")
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
        
      // Add source nodes to the set of visible nodes
      this.graph?.nodes.forEach((node, index) => {
        if (index === 0 || (node.properties && node.properties.source_node_id)) {
          nodesInSubgraph.add(node.id);
        }
      });
    }
    
    // Highlight all nodes that belong to the selected subgraph
    // This includes nodes that are in multiple subgraphs
    this.container.selectAll(".node")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("circle")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke", "#2563EB") // blue-600
      .attr("stroke-width", 3);
      
    // Make their labels visible
    this.container.selectAll(".node")
      .filter((d: any) => d.subgraphIds && d.subgraphIds.includes(subgraphId))
      .selectAll("text")
      .transition().duration(300)
      .attr("opacity", 1.0);
      
    // Highlight edges in the active subgraph - but only if both source and target nodes are in the subgraph
    this.container.selectAll(".edge")
      .filter((d: any) => {
        // First check if the edge belongs to this subgraph
        if (!d.subgraphIds || !d.subgraphIds.includes(subgraphId)) {
          return false;
        }
        
        // Additional check: both source and target nodes must be visible in this subgraph
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        
        return nodesInSubgraph.has(sourceId) && nodesInSubgraph.has(targetId);
      })
      .selectAll("path")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke-width", 2.5)
      .attr("stroke", "#2563EB") // blue-600
      .attr("marker-end", "url(#arrowhead-highlighted)");
      
    this.container.selectAll(".edge")
      .filter((d: any) => {
        // First check if the edge belongs to this subgraph
        if (!d.subgraphIds || !d.subgraphIds.includes(subgraphId)) {
          return false;
        }
        
        // Additional check: both source and target nodes must be visible in this subgraph
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        
        return nodesInSubgraph.has(sourceId) && nodesInSubgraph.has(targetId);
      })
      .selectAll("text")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("fill", "#2563EB"); // blue-600
      
    // Final verification pass: double-check that all nodes included in edges are visible
    // This ensures no "dangling" edges pointing to invisible nodes
    if (this.graph && this.graph.edges) {
      // Find all highlighted edges
      const highlightedEdges = this.graph.edges.filter(edge => 
        edge.subgraphIds && 
        edge.subgraphIds.includes(subgraphId)
      );
      
      // Collect all node IDs referenced by these edges
      const edgeNodeIds = new Set<string>();
      highlightedEdges.forEach(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        edgeNodeIds.add(sourceId);
        edgeNodeIds.add(targetId);
      });
      
      // Make sure all these nodes are visible by adding them to the subgraph if needed
      edgeNodeIds.forEach(nodeId => {
        if (!nodesInSubgraph.has(nodeId)) {
          // Add this node to the active subgraph data
          const node = this.graph?.nodes.find(n => n.id === nodeId);
          if (node && node.subgraphIds) {
            // Update the node's subgraph membership
            if (!node.subgraphIds.includes(subgraphId)) {
              node.subgraphIds.push(subgraphId);
            }
            
            // Update visual appearance for this node
            this.container.selectAll(".node")
              .filter((d: any) => d.id === nodeId)
              .selectAll("circle")
              .transition().duration(300)
              .attr("opacity", 1.0)
              .attr("stroke", "#2563EB")
              .attr("stroke-width", 3);
              
            this.container.selectAll(".node")
              .filter((d: any) => d.id === nodeId)
              .selectAll("text")
              .transition().duration(300)
              .attr("opacity", 1.0);
          }
        }
      });
    }
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
  
  /**
   * Create a taxonomy hierarchy for a given node
   * @param node The node to create a taxonomy hierarchy for
   */
  private createTaxonomyForNode(node: SimulationNode): void {
    if (!this.graph || !node) return;
    
    // Get the node type to create a taxonomy for
    const nodeType = node.type;
    if (!nodeType) {
      console.error("Cannot create taxonomy for node with no type");
      return;
    }
    
    // Create a unique subgraph ID for this taxonomy
    const taxonomyId = `taxonomy_${nodeType}_${Date.now().toString(36)}`;
    
    // Define a hierarchy of taxonomic levels
    // This would typically come from an API call to a knowledge base like Wikipedia
    // For now, we'll use a simple predefined hierarchy based on the node type
    const taxonomyLevels = this.generateTaxonomyForType(nodeType);
    
    if (!taxonomyLevels || taxonomyLevels.length === 0) {
      console.error(`No taxonomy levels generated for type: ${nodeType}`);
      return;
    }
    
    console.log(`Creating taxonomy for ${nodeType} with ${taxonomyLevels.length} levels`);
    
    // Calculate the layout for the taxonomy nodes
    // Place them in a vertical arrangement above the source node
    const sourceX = node.x || 0;
    const sourceY = node.y || 0;
    const verticalSpacing = 80; // Space between levels
    
    // Create nodes for each level of the taxonomy
    const taxonomyNodes: Node[] = [];
    const taxonomyEdges: Edge[] = [];
    
    // Track the previous node ID to connect the levels
    let previousNodeId = node.id;
    
    // Helper to find matching taxonomy nodes to avoid duplicates
    const findExistingTaxonomyNode = (taxonomyLevel: string, taxonomyName: string): Node | null => {
      if (!this.graph) return null;
      
      return this.graph.nodes.find(n => 
        n.type === "Taxonomy" && 
        n.properties.taxonomyLevel === taxonomyLevel &&
        n.properties.name === taxonomyName
      ) || null;
    };
    
    // Create nodes from most specific to most general (bottom up)
    taxonomyLevels.forEach((level, index) => {
      // Check if a matching taxonomy node already exists
      const existingNode = findExistingTaxonomyNode(level.type, level.name);
      
      let nodeId: string;
      
      // If a matching node exists, use it; otherwise create a new one
      if (existingNode) {
        console.log(`Reusing existing taxonomy node: ${existingNode.id} (${level.name})`);
        nodeId = existingNode.id;
        
        // Add this taxonomy subgraph to the existing node's subgraphs
        if (!existingNode.subgraphIds) {
          existingNode.subgraphIds = [];
        }
        if (!existingNode.subgraphIds.includes(taxonomyId)) {
          existingNode.subgraphIds.push(taxonomyId);
        }
      } else {
        // Generate a unique ID for this taxonomy node
        this.nodeCounter++;
        nodeId = `tax_${nodeType}_${level.type}_${Date.now().toString(36)}_${this.nodeCounter}`;
        
        // Create the taxonomy node
        const taxonomyNode: Node = {
          id: nodeId,
          type: "Taxonomy",
          properties: {
            name: level.name,
            description: level.description || `Taxonomic classification for ${nodeType}`,
            taxonomyLevel: level.type,
            source: "taxonomy"
          },
          x: sourceX + (index * 30) - 60, // Offset horizontally to create a diagonal arrangement
          y: sourceY - ((index + 1) * verticalSpacing), // Place each level above the previous one
          subgraphIds: [taxonomyId]
        };
        
        // Add the node to our collection
        taxonomyNodes.push(taxonomyNode);
      }
      
      // Create an edge from this node to the previous node
      this.edgeCounter++;
      const edgeId = `tax_edge_${Date.now().toString(36)}_${this.edgeCounter}`;
      
      // Check if an edge already exists between these nodes
      const existingEdge = this.graph?.edges.find(e => 
        e.source === nodeId && e.target === previousNodeId && (e.label === "IS_PARENT_TO" || e.label === "IS_PARENT_OF")
      );
      
      // Only create an edge if one doesn't already exist
      if (!existingEdge) {
        const edge: Edge = {
          id: edgeId,
          source: nodeId, // Parent
          target: previousNodeId, // Child
          label: "IS_PARENT_OF",
          properties: {
            taxonomyRelation: true,
            creationDate: new Date().toISOString()
          },
          subgraphIds: [taxonomyId]
        };
        
        // Add the edge to our collection
        taxonomyEdges.push(edge);
      } else {
        console.log(`Reusing existing edge from ${nodeId} to ${previousNodeId}`);
        
        // Add this taxonomy subgraph to the existing edge's subgraphs
        if (!existingEdge.subgraphIds) {
          existingEdge.subgraphIds = [];
        }
        if (!existingEdge.subgraphIds.includes(taxonomyId)) {
          existingEdge.subgraphIds.push(taxonomyId);
        }
      }
      
      // Update the previous node ID for the next iteration
      previousNodeId = nodeId;
    });
    
    // Add the new taxonomy nodes and edges to the graph
    this.graph.nodes.push(...taxonomyNodes);
    this.graph.edges.push(...taxonomyEdges);
    
    // Add the taxonomy subgraph ID to the original node
    if (!node.subgraphIds) {
      node.subgraphIds = [];
    }
    node.subgraphIds.push(taxonomyId);
    
    // Update the visualization
    this.render(this.graph);
    
    // Highlight the taxonomy subgraph
    this.highlightSubgraph(taxonomyId);
  }
  
  /**
   * Generate a taxonomy hierarchy for a given node type
   * @param nodeType The type of node to generate a taxonomy for
   * @returns An array of taxonomy levels from specific to general
   */
  private generateTaxonomyForType(nodeType: string): Array<{type: string, name: string, description?: string}> {
    // In a real implementation, this would call a knowledge base API
    // For now, use predefined taxonomies based on common types
    
    // Define some common taxonomies
    const taxonomies: Record<string, Array<{type: string, name: string, description?: string}>> = {
      // Person taxonomy
      Person: [
        { type: "species", name: "Homo Sapiens", description: "Modern humans" },
        { type: "genus", name: "Homo", description: "The genus that includes modern humans" },
        { type: "family", name: "Hominidae", description: "Great apes" },
        { type: "order", name: "Primates", description: "Order of mammals including monkeys, apes, and humans" },
        { type: "class", name: "Mammalia", description: "Class of vertebrate animals" }
      ],
      
      // Organization taxonomy
      Organization: [
        { type: "organization_type", name: "Company", description: "A business organization" },
        { type: "legal_entity", name: "Corporation", description: "A legal entity separate from its owners" },
        { type: "institution", name: "Business Institution", description: "An established organization in society" },
        { type: "social_structure", name: "Social Structure", description: "A pattern of social arrangements" }
      ],
      
      // Location taxonomy
      Location: [
        { type: "site", name: "Geographical Site", description: "A specific place or position" },
        { type: "area", name: "Geographical Area", description: "A region or part of the Earth's surface" },
        { type: "feature", name: "Geographical Feature", description: "A component of the Earth's surface" },
        { type: "concept", name: "Spatial Concept", description: "An abstract idea relating to space" }
      ],
      
      // Product taxonomy
      Product: [
        { type: "product", name: "Commercial Product", description: "An item offered for sale" },
        { type: "artifact", name: "Human Artifact", description: "Something made by humans" },
        { type: "object", name: "Physical Object", description: "A material thing" },
        { type: "entity", name: "Entity", description: "Something that exists independently" }
      ],
      
      // Event taxonomy
      Event: [
        { type: "occurrence", name: "Temporal Occurrence", description: "Something that happens at a particular time" },
        { type: "phenomenon", name: "Temporal Phenomenon", description: "An observable event" },
        { type: "concept", name: "Temporal Concept", description: "An abstract idea relating to time" }
      ],
      
      // Concept taxonomy
      Concept: [
        { type: "concept", name: "Abstract Concept", description: "An abstract idea or notion" },
        { type: "mental_construct", name: "Mental Construct", description: "A concept formed in the mind" },
        { type: "abstraction", name: "Abstraction", description: "The process of forming abstract concepts" },
        { type: "knowledge", name: "Knowledge Unit", description: "A unit of understanding" }
      ],
      
      // Technology taxonomy
      Technology: [
        { type: "application", name: "Technological Application", description: "Practical use of scientific knowledge" },
        { type: "system", name: "Technological System", description: "An integrated set of techniques and knowledge" },
        { type: "domain", name: "Knowledge Domain", description: "A field of specialized knowledge" },
        { type: "practice", name: "Human Practice", description: "An established way of doing something" }
      ],
      
      // Document taxonomy
      Document: [
        { type: "record", name: "Written Record", description: "A recorded piece of information" },
        { type: "artifact", name: "Informational Artifact", description: "A human-created information container" },
        { type: "object", name: "Physical Object", description: "A material thing" }
      ]
    };
    
    // Try to match the node type to a taxonomy
    // First try an exact match
    if (taxonomies[nodeType]) {
      return taxonomies[nodeType];
    }
    
    // Then try to match with any of the known types (case insensitive)
    const lowerType = nodeType.toLowerCase();
    for (const [key, value] of Object.entries(taxonomies)) {
      if (lowerType.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(lowerType)) {
        return value;
      }
    }
    
    // If no matching taxonomy is found, use a generic taxonomy
    return [
      { type: "entity", name: nodeType, description: `A specific ${nodeType}` },
      { type: "class", name: "Class", description: "A category or classification" },
      { type: "concept", name: "Abstract Concept", description: "An abstract idea or notion" },
      { type: "entity", name: "Entity", description: "Something that exists independently" }
    ];
  }
}