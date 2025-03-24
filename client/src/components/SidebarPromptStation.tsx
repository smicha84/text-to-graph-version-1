import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph } from "@/types/graph";
import { Globe, AlertTriangle } from "lucide-react";

interface SidebarPromptStationProps {
  onWebSearch: (nodeId: string, query: string) => void;
  isSearching: boolean;
  selectedNodeId?: string;
  graph: Graph | null;
}

/**
 * SidebarPromptStation component - Web search functionality has been removed
 * This is a placeholder component showing that the feature is not available
 */
export default function SidebarPromptStation({
  onWebSearch,
  isSearching,
  selectedNodeId,
  graph
}: SidebarPromptStationProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-1">
          <Globe className="mr-2 h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Web Search</h2>
        </div>
        <p className="text-xs text-gray-500">
          Web search functionality has been removed
        </p>
      </div>
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Feature Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Web search functionality has been removed from this application. 
              You can still use the text-to-graph functionality to generate graph 
              visualizations from your text input.
            </p>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Future versions may reintroduce enhanced web 
                search capabilities. Please check the documentation for updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}