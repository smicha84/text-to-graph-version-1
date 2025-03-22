import { useRef, useEffect, useState, useMemo } from "react";
import { Graph, Node, Edge, ZoomPanInfo } from "@/types/graph";
import { Button } from "@/components/ui/button";
import { GraphVisualizer } from "@/lib/graphVisualizer";
import LayoutControls, { LayoutSettings } from "@/components/LayoutControls";
import { MinusIcon, PlusIcon, ExpandIcon, DownloadIcon } from "lucide-react";

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

  // Setup D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create visualizer
    const newVisualizer = new GraphVisualizer(
      svgRef.current, 
      width, 
      height,
      onElementSelect
    );
    
    setVisualizer(newVisualizer);
    
    return () => {
      // Clean up if needed
    };
  }, [onElementSelect]);

  // Update visualization when graph changes
  useEffect(() => {
    if (!visualizer || !graph) return;
    
    setIsSimulating(true);
    visualizer.render(graph);
    
    // Fit graph to view after short delay to allow simulation to start
    setTimeout(() => {
      visualizer.fitToView();
      setIsSimulating(false);
    }, 100);
    
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
          
          {/* Graph Canvas */}
          <svg 
            ref={svgRef}
            className={`w-full h-full ${!graph || isLoading ? 'hidden' : ''}`}
          ></svg>
        </div>
        
        {/* Layout Controls Sidebar */}
        {graph && !isLoading && (
          <div className="w-72 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            <LayoutControls 
              onSettingsChange={handleLayoutSettingsChange}
              onRestart={handleRestartSimulation}
              isLoading={isSimulating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
