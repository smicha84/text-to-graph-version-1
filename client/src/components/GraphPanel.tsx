import { useRef, useEffect, useState, useMemo } from "react";
import { Graph, Node, Edge, ZoomPanInfo, NodeStyle, EdgeStyle } from "@/types/graph";
import { Button } from "@/components/ui/button";
import { GraphVisualizer, NODE_COLORS, CenterPoint } from "@/lib/graphVisualizer";
import LayoutControls, { LayoutSettings } from "@/components/LayoutControls";
import ColorEditor from "@/components/ColorEditor";
import StylePanel from "@/components/StylePanel";
import CenterControls from "@/components/CenterControls";
import { 
  MinusIcon, 
  PlusIcon, 
  ExpandIcon, 
  DownloadIcon, 
  LayersIcon, 
  XIcon,
  PaintBucketIcon,
  Layers2Icon,
  PenLineIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as d3 from "d3";

interface GraphPanelProps {
  graph: Graph | null;
  isLoading: boolean;
  onElementSelect: (element: Node | Edge | null) => void;
  onShowExportModal: () => void;
}

export default function GraphPanel({ 
  graph, 
  isLoading, 
  onElementSelect,
  onShowExportModal
}: GraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visualizer, setVisualizer] = useState<GraphVisualizer | null>(null);
  const [zoomInfo, setZoomInfo] = useState<ZoomPanInfo>({ scale: 1, translateX: 0, translateY: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [subgraphIds, setSubgraphIds] = useState<string[]>([]);
  const [activeSubgraphId, setActiveSubgraphId] = useState<string | null>(null);
  const [customNodeColors, setCustomNodeColors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'layout' | 'subgraph' | 'color' | 'style'>('layout');
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [elementStyle, setElementStyle] = useState<NodeStyle | EdgeStyle | null>(null);
  const [customCenterPoint, setCustomCenterPoint] = useState<CenterPoint | null>(null);

  // Setup D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    let visualizerInstance: GraphVisualizer | null = null;
    
    // Create a ResizeObserver to get accurate dimensions even when initially hidden
    // This is critical for ensuring responsive behavior across all devices
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      
      // Get dimensions dynamically from the container element
      // This ensures we adapt to any screen size - mobile, tablet, or desktop
      const container = svgRef.current?.parentElement;
      if (!container) return;
      
      // Get the actual dimensions from the DOM
      const containerRect = container.getBoundingClientRect();
      const width = Math.floor(containerRect.width);
      const height = Math.floor(containerRect.height);
      
      // Wait for non-zero dimensions
      if (width === 0 || height === 0) return;
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      console.log(`SVG dimensions updated: ${width}x${height}, Center: (${centerX}, ${centerY})`);
      
      // Debounce rapid resize events (especially important on mobile)
      const debounceResize = () => {
        if (visualizerInstance) {
          // Update dimensions of existing visualizer
          visualizerInstance.updateDimensions(width, height);
          
          // If we have a graph, fit it to the new dimensions
          if (graph) {
            setTimeout(() => {
              if (visualizerInstance) {
                visualizerInstance.fitToView();
              }
            }, 100);
          }
        } else if (svgRef.current) {
          // Clear any existing SVG content
          d3.select(svgRef.current).selectAll("*").remove();
          
          // Create new visualizer with the detected dimensions
          visualizerInstance = new GraphVisualizer(
            svgRef.current, 
            width, 
            height,
            handleElementSelect
          );
          
          // Store the natural center point for reference
          setCustomCenterPoint({ x: centerX, y: centerY });
          
          setVisualizer(visualizerInstance);
        }
      };
      
      // Use setTimeout directly with a proper typesafe approach
      setTimeout(debounceResize, 100); // 100ms debounce
    });
    
    // Start observing the SVG container for size changes
    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }
    
    return () => {
      // Stop observing on cleanup
      resizeObserver.disconnect();
      
      // Clean up by clearing the SVG content directly
      if (svgRef.current) {
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }
      }
    };
  }, []);

  // Update visualization when graph changes
  useEffect(() => {
    if (!visualizer || !graph) return;
    
    setIsSimulating(true);
    visualizer.render(graph);
    
    // Fit graph to view after short delay to allow simulation to position nodes
    setTimeout(() => {
      visualizer.fitToView();
      setIsSimulating(false);
      
      // Get available subgraph IDs from the graph
      const ids = visualizer.getSubgraphIds();
      setSubgraphIds(ids);
      
      // Clear active subgraph when loading a new graph
      setActiveSubgraphId(null);
    }, 500);  // Increased timeout to give nodes more time to position
    
    // Update zoom info periodically during simulation
    const interval = setInterval(() => {
      if (visualizer) {
        setZoomInfo(visualizer.getZoomInfo());
      }
    }, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, [graph, visualizer]);
  
  // Show a tooltip when the graph is first rendered to indicate draggable nodes
  useEffect(() => {
    if (visualizer && graph && graph.nodes.length > 0) {
      const tooltip = document.createElement('div');
      tooltip.className = 'drag-tooltip';
      tooltip.innerText = 'Nodes are draggable - click and drag to reposition';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '50px';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.backgroundColor = '#2563EB';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px 16px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.zIndex = '1000';
      tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      tooltip.style.fontWeight = '500';
      
      // Add to the graph container
      const graphContainer = svgRef.current?.parentElement;
      if (graphContainer) {
        graphContainer.appendChild(tooltip);
        
        // Remove the tooltip after 5 seconds
        setTimeout(() => {
          tooltip.style.opacity = '0';
          tooltip.style.transition = 'opacity 0.5s ease-out';
          
          // Remove from DOM after fade out
          setTimeout(() => {
            if (tooltip.parentNode === graphContainer) {
              graphContainer.removeChild(tooltip);
            }
          }, 500);
        }, 5000);
      }
    }
  }, [graph, visualizer]);

  // Fit graph to view
  const fitGraph = () => {
    if (visualizer) {
      visualizer.fitToView();
      setZoomInfo(visualizer.getZoomInfo());
    }
  };

  // Apply zoom in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (!visualizer) return;
    
    const newScale = direction === 'in' 
      ? zoomInfo.scale * 1.2 
      : zoomInfo.scale / 1.2;
    
    visualizer.setZoom(newScale);
    setZoomInfo(visualizer.getZoomInfo());
  };

  // Handle layout settings changes
  const handleLayoutSettingsChange = (settings: LayoutSettings) => {
    if (visualizer) {
      visualizer.updateLayoutSettings(settings);
      setZoomInfo(visualizer.getZoomInfo());
    }
  };

  // Restart simulation
  const handleRestartSimulation = () => {
    if (visualizer) {
      setIsSimulating(true);
      visualizer.restartSimulation();
      
      // Update zoom info and reset simulating flag after a delay
      setTimeout(() => {
        setZoomInfo(visualizer.getZoomInfo());
        setIsSimulating(false);
      }, 1000);
    }
  };
  
  // Handle subgraph selection
  const handleSubgraphSelect = (subgraphId: string | null) => {
    if (visualizer) {
      if (activeSubgraphId === subgraphId) {
        // If clicking the active subgraph, clear selection
        setActiveSubgraphId(null);
        visualizer.highlightSubgraph(null);
      } else {
        // Otherwise set new active subgraph
        setActiveSubgraphId(subgraphId);
        visualizer.highlightSubgraph(subgraphId);
      }
    }
  };
  
  // Handle color changes from the color editor
  const handleColorChange = (newColors: Record<string, string>) => {
    if (visualizer) {
      setCustomNodeColors(newColors);
      visualizer.updateNodeColors(newColors);
    }
  };
  
  // Handle element selection
  const handleElementSelect = (element: Node | Edge | null) => {
    setSelectedElement(element);
    
    // Switch to style tab when an element is selected
    if (element) {
      setActiveTab('style');
      const isNode = 'type' in element;
      
      // Check if the element already has a style
      let existingStyle: NodeStyle | EdgeStyle | null = null;
      
      if (isNode && visualizer) {
        existingStyle = visualizer.getNodeStyle(element.id);
      } else if (!isNode && visualizer) {
        existingStyle = visualizer.getEdgeStyle(element.id);
      }
      
      setElementStyle(existingStyle);
    }
    
    // Call the parent's element select callback
    onElementSelect(element);
  };
  
  // Handle style changes
  const handleStyleChange = (elementId: string, isNode: boolean, style: NodeStyle | EdgeStyle) => {
    if (!visualizer) return;
    
    if (isNode) {
      visualizer.setNodeStyle(elementId, style as NodeStyle);
    } else {
      visualizer.setEdgeStyle(elementId, style as EdgeStyle);
    }
    
    setElementStyle(style);
  };
  
  // Handle custom center point changes
  const handleCenterPointChange = (centerPoint: CenterPoint) => {
    if (!visualizer) return;
    
    // Update the custom center point
    setCustomCenterPoint(centerPoint);
    // Apply it to the visualizer
    visualizer.setCustomCenterPoint(centerPoint);
    
    // Reset simulation to apply the changes
    setIsSimulating(true);
    
    setTimeout(() => {
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Graph Visualization</h2>
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('out')}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              <MinusIcon size={14} />
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
              <PlusIcon size={14} />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fitGraph}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
          >
            <ExpandIcon size={14} /> Fit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowExportModal}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
          >
            <DownloadIcon size={14} /> Export
          </Button>
        </div>
      </div>
      
      <div className="flex h-full">
        <div className="flex-1 bg-gray-50 relative">
          {/* Empty State */}
          {!graph && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
              <svg viewBox="0 0 24 24" className="w-16 h-16 mb-4 opacity-40">
                <path
                  fill="currentColor"
                  d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M7,10L12,15L17,10H7Z"
                />
              </svg>
              <p className="text-lg font-medium">No graph to display</p>
              <p className="text-sm mt-2">Enter text and generate a graph to see visualization</p>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center flex-col">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Generating graph...</p>
              <p className="text-sm text-gray-500 mt-1">Processing with Claude AI</p>
            </div>
          )}
          
          {/* Graph Canvas Container with Flexbox - similar to empty state centering */}
          <div 
            className={`absolute inset-0 flex items-center justify-center ${!graph || isLoading ? 'hidden' : ''}`}
            style={{ touchAction: 'none' }} /* Disable browser touch handling for better mobile experience */
          >
            <svg 
              ref={svgRef}
              className="w-full h-full graph-svg"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                width: '100%', /* Ensure SVG fills the container */
                height: '100%', /* Ensure SVG fills the container */
                overflow: 'visible' /* Allow content to extend beyond SVG boundaries */
              }}
            ></svg>
          </div>
          
          {/* Panning instructions tooltip */}
          {graph && !isLoading && (
            <div 
              className="pan-tooltip"
              style={{ animation: 'fade-in 0.5s ease-out, fade-out 0.5s ease-in 5s forwards' }}
            >
              Click and drag the background to pan the graph
            </div>
          )}
        </div>
        
        {/* Controls Sidebar */}
        {graph && !isLoading && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium border-b-2",
                  activeTab === 'layout'
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setActiveTab('layout')}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 14a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5zM14 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
                  </svg>
                  Layout
                </div>
              </button>
              
              {subgraphIds.length > 0 && (
                <button
                  className={cn(
                    "flex-1 py-3 px-4 text-sm font-medium border-b-2",
                    activeTab === 'subgraph'
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab('subgraph')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Layers2Icon className="w-4 h-4" />
                    Subgraphs
                  </div>
                </button>
              )}
              
              <button
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium border-b-2",
                  activeTab === 'color'
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setActiveTab('color')}
              >
                <div className="flex items-center justify-center gap-2">
                  <PaintBucketIcon className="w-4 h-4" />
                  Colors
                </div>
              </button>
              
              {selectedElement && (
                <button
                  className={cn(
                    "flex-1 py-3 px-4 text-sm font-medium border-b-2",
                    activeTab === 'style'
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab('style')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <PenLineIcon className="w-4 h-4" />
                    Style
                  </div>
                </button>
              )}
            </div>
            
            {/* Tab Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Layout Controls Section */}
              {activeTab === 'layout' && (
                <div>
                  {/* Center Point Controls */}
                  <CenterControls 
                    defaultCenter={{
                      x: customCenterPoint?.x || (svgRef.current?.clientWidth || 0) / 2,
                      y: customCenterPoint?.y || (svgRef.current?.clientHeight || 0) / 2
                    }}
                    onCenterChange={handleCenterPointChange}
                  />
                  
                  {/* Layout Force Controls */}
                  <LayoutControls 
                    onSettingsChange={handleLayoutSettingsChange}
                    onRestart={handleRestartSimulation}
                    isLoading={isSimulating}
                  />
                </div>
              )}
              
              {/* Subgraph Controls Section */}
              {activeTab === 'subgraph' && subgraphIds.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <LayersIcon size={16} className="text-gray-500" />
                    Subgraph Highlighting
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select a subgraph to highlight portions of the graph that were added in different interactions
                  </p>
                  
                  {/* Clear selection option */}
                  <button
                    className={cn(
                      "flex items-center w-full p-2 rounded mb-2 text-left font-medium text-sm",
                      activeSubgraphId === null
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => handleSubgraphSelect(null)}
                  >
                    <XIcon size={14} className="mr-2" />
                    Show all / Clear selection
                  </button>
                  
                  {/* Subgraph list */}
                  <div className="space-y-1 mt-2">
                    {subgraphIds.map((id) => (
                      <button
                        key={id}
                        className={cn(
                          "flex items-center w-full p-2 rounded text-left font-medium text-sm",
                          activeSubgraphId === id
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => handleSubgraphSelect(id)}
                      >
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                        Subgraph {id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Color Editor Section */}
              {activeTab === 'color' && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <PaintBucketIcon size={16} className="text-gray-500" />
                    Node Color Customization
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Customize colors for different node types in the graph
                  </p>
                  
                  {graph && (
                    <ColorEditor 
                      graph={graph} 
                      onColorChange={handleColorChange} 
                    />
                  )}
                </div>
              )}
              
              {/* Style Panel Section */}
              {activeTab === 'style' && selectedElement && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <PenLineIcon size={16} className="text-gray-500" />
                    {'type' in selectedElement ? 'Node' : 'Edge'} Styling
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Customize the visual appearance of the selected element
                  </p>
                  
                  <StylePanel
                    element={selectedElement}
                    onStyleChange={handleStyleChange}
                    currentStyle={elementStyle}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
