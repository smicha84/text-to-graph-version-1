import { useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import GraphPanel from "@/components/GraphPanel";
import ExportModal from "@/components/ExportModal";
import SidebarPromptStation from "@/components/SidebarPromptStation";
import NodeAnatomyChart from "@/components/NodeAnatomyChart";
import SimpleStrategyPrompt from "@/components/SimpleStrategyPrompt";
import { TextSegment } from "@/components/MultiSubgraphInput";
import { Graph, Node, Edge, GraphGenerationOptions, ExportOptions, WebSearchOptions } from "@/types/graph";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

export default function Home() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedElement, setSelectedElement] = useState<(Node | Edge) | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Initialize UI preferences with default values
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('uiPrefs.sidebarCollapsed');
    return saved ? JSON.parse(saved) : true; // Default to collapsed
  });
  
  const [explorerCollapsed, setExplorerCollapsed] = useState(() => {
    const saved = localStorage.getItem('uiPrefs.explorerCollapsed');
    return saved ? JSON.parse(saved) : true; // Default to collapsed
  });
  
  const [inputPanelWidth, setInputPanelWidth] = useState(() => {
    const saved = localStorage.getItem('uiPrefs.inputPanelWidth');
    return saved ? parseInt(saved, 10) : 384; // Default width (w-96 = 24rem = 384px)
  });
  
  const { toast } = useToast();
  
  // Persist UI preference changes to localStorage
  useEffect(() => {
    localStorage.setItem('uiPrefs.sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);
  
  useEffect(() => {
    localStorage.setItem('uiPrefs.explorerCollapsed', JSON.stringify(explorerCollapsed));
  }, [explorerCollapsed]);
  
  useEffect(() => {
    localStorage.setItem('uiPrefs.inputPanelWidth', inputPanelWidth.toString());
  }, [inputPanelWidth]);

  // Generate graph mutation
  const generateMutation = useMutation({
    mutationFn: async ({ 
      text, 
      options, 
      segmentId, 
      segmentName, 
      segmentColor 
    }: { 
      text: string, 
      options: GraphGenerationOptions,
      segmentId?: string,
      segmentName?: string,
      segmentColor?: string
    }) => {
      // If we're in append mode, we need to send the existing graph to merge with
      const payload = {
        text,
        options,
        ...(options.appendMode && graph ? { existingGraph: graph, appendMode: true } : {}),
        ...(segmentId ? { segmentId } : {}),
        ...(segmentName ? { segmentName } : {}),
        ...(segmentColor ? { segmentColor } : {})
      };
      const response = await apiRequest('POST', '/api/generate-graph', payload);
      return response.json();
    },
    onSuccess: (data: Graph, variables) => {
      setGraph(data);
      const isAppendMode = variables.options.appendMode;
      toast({
        title: isAppendMode ? "Graph Updated" : "Graph Generated",
        description: `Successfully ${isAppendMode ? 'updated' : 'created'} graph with ${data.nodes.length} nodes and ${data.edges.length} edges.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate graph: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Export graph mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, includeProperties, includeStyles }: ExportOptions) => {
      if (!graph) throw new Error("No graph to export");
      
      // For PNG format, we handle it client-side
      if (format === 'png') {
        return { clientSide: true, format };
      }
      
      const response = await apiRequest('POST', '/api/export-graph', { 
        format, 
        graph, 
        includeProperties, 
        includeStyles 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSide) {
        // Client-side export is handled by the ExportModal component
        return;
      }
      
      // Create and download file
      const blob = new Blob([data.data], { type: data.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      toast({
        title: "Graph Exported",
        description: `Successfully exported graph as ${data.filename}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Error",
        description: `Failed to export graph: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerateGraph = (text: string, options: GraphGenerationOptions, segments?: TextSegment[]) => {
    if (segments && segments.length > 0) {
      // If we have segments, process each segment one by one
      setGraph(null); // Clear any existing graph first
      let currentIndex = 0;
      
      // Set up progress tracking for user feedback
      const totalSegments = segments.length;
      
      // Process segments sequentially using a helper function
      const processNextSegment = () => {
        if (currentIndex < totalSegments) {
          const segment = segments[currentIndex];
          const segmentOptions = { 
            ...options, 
            appendMode: currentIndex > 0, // Only append after the first segment
          };
          
          // Show progress toast
          toast({
            title: `Processing Subgraph ${currentIndex + 1}/${totalSegments}`,
            description: `Generating graph for: "${segment.name}" (${Math.round((currentIndex/totalSegments)*100)}% complete)`,
          });
          
          // Process this segment
          generateMutation.mutate(
            { 
              text: segment.text, 
              options: segmentOptions,
              segmentId: segment.id,
              segmentName: segment.name,
              segmentColor: segment.color
            },
            {
              onSuccess: (data) => {
                // Show progress after each segment is processed
                const progress = ((currentIndex + 1) / totalSegments) * 100;
                const nodeCount = data.nodes.length;
                const edgeCount = data.edges.length;
                
                toast({
                  title: `Subgraph ${currentIndex + 1}/${totalSegments} Complete`,
                  description: `Added ${nodeCount} nodes and ${edgeCount} edges. Progress: ${Math.round(progress)}%`,
                });
                
                // Move to the next segment
                currentIndex++;
                setTimeout(processNextSegment, 500); // Add small delay between segments
              },
              onError: (error) => {
                toast({
                  title: "Error Processing Segment",
                  description: `Failed to process segment ${currentIndex + 1}: ${error.message}`,
                  variant: "destructive"
                });
              }
            }
          );
        } else {
          toast({
            title: "All Subgraphs Processed",
            description: `Successfully generated complete graph from ${totalSegments} segments.`,
          });
        }
      };
      
      // Start processing the segments
      processNextSegment();
    } else {
      // No segments, just process the entire text
      generateMutation.mutate({ text, options });
    }
  };

  const handleElementSelect = (element: Node | Edge | null) => {
    setSelectedElement(element);
  };

  const handleExportGraph = (options: ExportOptions) => {
    exportMutation.mutate(options);
  };
  
  // Web search mutation
  const webSearchMutation = useMutation({
    mutationFn: async ({ nodeId, query }: WebSearchOptions) => {
      if (!graph) throw new Error("No graph to search with");
      
      const payload = {
        query,
        nodeId,
        graph
      };
      
      const response = await apiRequest('POST', '/api/web-search', payload);
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setGraph(data);
      toast({
        title: "Web Search Completed",
        description: `Successfully expanded graph with ${data.nodes.length - (graph?.nodes.length || 0)} new nodes from web search.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Web Search Error",
        description: `Failed to perform web search: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleWebSearch = (nodeId: string, query: string) => {
    toast({
      title: "Web Search Started",
      description: "Searching the web for relevant information...",
    });
    webSearchMutation.mutate({ nodeId, query });
  };
  
  // Handle the resizing of the input panel
  const handleInputPanelResize = (event: ReactMouseEvent<HTMLDivElement>) => {
    const initialX = event.clientX;
    const initialWidth = inputPanelWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      const newWidth = Math.max(280, Math.min(600, initialWidth + deltaX));
      setInputPanelWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="bg-gray-100 font-sans text-gray-800 h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with collapsible prompt station */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} bg-white border-r border-gray-200 flex-shrink-0 flex flex-col relative transition-all duration-300 ease-in-out`}>
          {/* Toggle button */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 z-20 bg-white p-1 rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} className="text-gray-600" />
            ) : (
              <ChevronLeft size={16} className="text-gray-600" />
            )}
          </button>
          
          {/* Show full sidebar or collapsed version based on state */}
          <div className={`${sidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} flex-1 transition-opacity duration-200 ease-in-out`}>
            <SidebarPromptStation 
              onWebSearch={handleWebSearch}
              isSearching={webSearchMutation.isPending}
              selectedNodeId={selectedElement && 'type' in selectedElement ? selectedElement.id : undefined}
              graph={graph}
            />
          </div>
          
          {/* Show icon only when collapsed */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center p-2 mt-10">
              <div className="p-2 mb-4 rounded-full bg-blue-50 text-blue-600">
                <ChevronRight size={20} />
              </div>
              <span className="writing-mode-vertical text-xs text-gray-500 font-medium tracking-wide mt-2 transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                PROMPT STATION
              </span>
            </div>
          )}
        </div>
        
        {/* Input panel with resizable width */}
        <div 
          style={{ width: `${inputPanelWidth}px` }} 
          className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden relative transition-all duration-100"
        >
          {/* Resize handle */}
          <div 
            className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-blue-400 cursor-ew-resize z-30 group"
            onMouseDown={handleInputPanelResize}
          >
            <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-100 rounded p-1 shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <span className="text-xs text-gray-700 whitespace-nowrap">{inputPanelWidth}px</span>
            </div>
          </div>
          
          <InputPanel 
            onGenerateGraph={handleGenerateGraph}
            onWebSearch={handleWebSearch}
            isLoading={generateMutation.isPending}
            isSearching={webSearchMutation.isPending}
            hasExistingGraph={!!graph && graph.nodes.length > 0}
            selectedNodeId={selectedElement && 'type' in selectedElement ? selectedElement.id : undefined}
            graph={graph}
          />
        </div>
        
        {/* Graph visualization area - flexible width */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Help button for Node Anatomy Chart */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-4 left-4 z-10 bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-lg shadow-md border border-gray-200 flex items-center space-x-1 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Node Anatomy Guide</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Understanding Node Visualization</DialogTitle>
                <DialogDescription>
                  This guide explains all the visual elements of nodes in the graph and what data they represent.
                </DialogDescription>
              </DialogHeader>
              <NodeAnatomyChart />
            </DialogContent>
          </Dialog>
          
          <div className="flex flex-col h-full">
            {/* Graph area that expands when explorer is collapsed */}
            <div className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${explorerCollapsed ? 'h-[calc(100%-60px)]' : 'h-[60vh]'}`}>
              <GraphPanel 
                graph={graph}
                isLoading={generateMutation.isPending || webSearchMutation.isPending}
                onElementSelect={handleElementSelect}
                onShowExportModal={() => setShowExportModal(true)}
                onWebSearch={handleWebSearch}
              />
            </div>
            
            {/* Explorer always at bottom */}
            <div className="bg-white border rounded-lg shadow-sm relative mt-auto">
              {/* Toggle button */}
              <button 
                onClick={() => setExplorerCollapsed(!explorerCollapsed)}
                className="absolute right-4 top-4 z-20 bg-gray-100 p-1 rounded-full border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors"
                aria-label={explorerCollapsed ? "Expand explorer" : "Collapse explorer"}
              >
                {explorerCollapsed ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (
                  <ChevronUp size={16} className="text-gray-600" />
                )}
              </button>
              
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Strategic Graph Explorer</h2>
                  <p className="text-sm text-gray-500">
                    Analyze your graph and discover strategic insights for exploration
                  </p>
                </div>
              </div>
              
              {/* Content that can be collapsed */}
              <div className={`${explorerCollapsed ? 'h-0 opacity-0 pointer-events-none' : 'h-auto opacity-100'} transition-all duration-300 ease-in-out overflow-hidden`}>
                <SimpleStrategyPrompt
                  graph={graph || {nodes: [], edges: []}}
                  selectedNodeId={selectedElement && 'type' in selectedElement ? selectedElement.id : undefined}
                  onWebSearch={handleWebSearch}
                  isSearching={webSearchMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showExportModal && (
        <ExportModal 
          graph={graph}
          onExport={handleExportGraph}
          onClose={() => setShowExportModal(false)}
          isExporting={exportMutation.isPending}
        />
      )}
    </div>
  );
}
