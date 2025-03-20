import { useState } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import GraphPanel from "@/components/GraphPanel";
import PropertyPanel from "@/components/PropertyPanel";
import ExportModal from "@/components/ExportModal";
import { Graph, Node, Edge, GraphGenerationOptions, ExportOptions } from "@/types/graph";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedElement, setSelectedElement] = useState<(Node | Edge) | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  // Generate graph mutation
  const generateMutation = useMutation({
    mutationFn: async ({ text, options }: { text: string, options: GraphGenerationOptions }) => {
      const response = await apiRequest('POST', '/api/generate-graph', { text, options });
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setGraph(data);
      toast({
        title: "Graph Generated",
        description: `Successfully created graph with ${data.nodes.length} nodes and ${data.edges.length} edges.`,
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

  return (
    <div className="bg-gray-100 font-sans text-gray-800 h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <InputPanel 
          onGenerateGraph={handleGenerateGraph}
          isLoading={generateMutation.isPending}
        />
        
        <div className="flex-1 flex flex-col h-full">
          <GraphPanel 
            graph={graph}
            isLoading={generateMutation.isPending}
            onElementSelect={handleElementSelect}
            onShowExportModal={() => setShowExportModal(true)}
          />
          
          {showPropertyPanel && (
            <PropertyPanel 
              element={selectedElement}
              onClose={() => setShowPropertyPanel(false)}
            />
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
