import { useState } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import GraphPanel from "@/components/GraphPanel";
import PropertyPanel from "@/components/PropertyPanel";
import ExportModal from "@/components/ExportModal";
import SidebarPromptStation from "@/components/SidebarPromptStation";
import NodeAnatomyChart from "@/components/NodeAnatomyChart";
import { Graph, Node, Edge, GraphGenerationOptions, ExportOptions, WebSearchOptions } from "@/types/graph";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedElement, setSelectedElement] = useState<(Node | Edge) | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  // Generate graph mutation
  const generateMutation = useMutation({
    mutationFn: async ({ text, options }: { text: string, options: GraphGenerationOptions }) => {
      // If we're in append mode, we need to send the existing graph to merge with
      const payload = {
        text,
        options,
        ...(options.appendMode && graph ? { existingGraph: graph, appendMode: true } : {})
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

  const handleGenerateGraph = (text: string, options: GraphGenerationOptions) => {
    generateMutation.mutate({ text, options });
  };

  const handleElementSelect = (element: Node | Edge | null) => {
    setSelectedElement(element);
    setShowPropertyPanel(!!element);
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

  return (
    <div className="bg-gray-100 font-sans text-gray-800 h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with always-visible prompt station - fixed width, non-resizable */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
          <SidebarPromptStation 
            onWebSearch={handleWebSearch}
            isSearching={webSearchMutation.isPending}
            selectedNodeId={selectedElement && 'type' in selectedElement ? selectedElement.id : undefined}
            graph={graph}
          />
        </div>
        
        {/* Input panel with fixed width - no dynamic resizing for proper layout */}
        <div className="w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
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
          
          <GraphPanel 
            graph={graph}
            isLoading={generateMutation.isPending || webSearchMutation.isPending}
            onElementSelect={handleElementSelect}
            onShowExportModal={() => setShowExportModal(true)}
            onWebSearch={handleWebSearch}
          />
          
          {/* Property panel appears over the graph as a floating panel */}
          {showPropertyPanel && selectedElement && (
            <div className="absolute top-4 right-4 bg-white shadow-lg border border-gray-200 rounded-lg w-72 z-10 max-h-[80%] overflow-auto">
              <PropertyPanel 
                element={selectedElement}
                onClose={() => setShowPropertyPanel(false)}
                onWebSearch={handleWebSearch}
                graph={graph}
              />
            </div>
          )}
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
