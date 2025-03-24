import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GraphGenerationOptions } from "@/types/graph";
import { useApiOperationStatus } from "@/hooks/use-api-logs";
import { MessageSquare, Brain, Network, RotateCw } from "lucide-react";

interface ActivityTrackerProps {
  options: GraphGenerationOptions;
  onOptionsChange: (options: GraphGenerationOptions) => void;
  isProcessing: boolean;
}

export default function ActivityTracker({ 
  options, 
  onOptionsChange,
  isProcessing
}: ActivityTrackerProps) {
  // Track processing steps
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Use the API logs hook to track processing status
  const { 
    status, 
    metrics, 
    lastActivity 
  } = useApiOperationStatus('generate_graph');
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Update option toggles
  const handleOptionChange = (option: keyof GraphGenerationOptions, value: boolean) => {
    onOptionsChange({
      ...options,
      [option]: value
    });
  };
  
  // Reset completed steps when processing starts
  useEffect(() => {
    if (isProcessing) {
      setCompletedSteps([]);
    }
  }, [isProcessing]);
  
  // Simulate step completion (in a real implementation, these would come from the backend)
  useEffect(() => {
    if (isProcessing) {
      const steps = [
        "Analyzing text content",
        "Extracting entities and relationships",
        "Processing entity types",
        "Inferring relationships",
        "Merging similar entities",
        "Creating graph structure"
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < steps.length) {
          setCompletedSteps(prev => [...prev, steps[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);
  
  return (
    <Card className="w-full mt-4 border-blue-200 shadow-sm">
      <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
        <CardTitle className="text-base flex items-center text-blue-700">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          Text-to-Graph Activity Monitor
          {isProcessing && <RotateCw className="h-4 w-4 ml-2 animate-spin text-blue-600" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-3 px-4">
        <div className="space-y-4">
          {/* Processing Mode Selection Section with gradient background */}
          <div className="rounded-lg border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-2">
              <h3 className="text-sm font-medium text-blue-700 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Entity Processing Mode Selection
              </h3>
            </div>
            
            <div className="p-3 bg-white">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id="useEntityMergingLLM"
                        checked={options.useEntityMergingLLM}
                        onCheckedChange={(checked) => 
                          handleOptionChange("useEntityMergingLLM", checked === true)
                        }
                        className="h-4 w-4 text-blue-600 border-blue-300 rounded flex-shrink-0"
                      />
                      <Label htmlFor="useEntityMergingLLM" className="text-sm font-medium text-blue-800 cursor-pointer">
                        Entity Deduplication/Merging
                      </Label>
                    </div>
                    <Badge 
                      variant={options.useEntityMergingLLM ? "default" : "outline"} 
                      className={`text-xs px-2 ${options.useEntityMergingLLM ? "bg-blue-600" : "border-blue-300 text-blue-600"}`}
                    >
                      {options.useEntityMergingLLM ? "Using Claude AI" : "Using Algorithm"}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id="useEntityTypeLLM"
                        checked={options.useEntityTypeLLM}
                        onCheckedChange={(checked) => 
                          handleOptionChange("useEntityTypeLLM", checked === true)
                        }
                        className="h-4 w-4 text-blue-600 border-blue-300 rounded flex-shrink-0"
                      />
                      <Label htmlFor="useEntityTypeLLM" className="text-sm font-medium text-blue-800 cursor-pointer">
                        Entity Type Detection
                      </Label>
                    </div>
                    <Badge 
                      variant={options.useEntityTypeLLM ? "default" : "outline"} 
                      className={`text-xs px-2 ${options.useEntityTypeLLM ? "bg-blue-600" : "border-blue-300 text-blue-600"}`}
                    >
                      {options.useEntityTypeLLM ? "Using Claude AI" : "Using Algorithm"}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id="useRelationInferenceLLM"
                        checked={options.useRelationInferenceLLM}
                        onCheckedChange={(checked) => 
                          handleOptionChange("useRelationInferenceLLM", checked === true)
                        }
                        className="h-4 w-4 text-blue-600 border-blue-300 rounded flex-shrink-0"
                      />
                      <Label htmlFor="useRelationInferenceLLM" className="text-sm font-medium text-blue-800 cursor-pointer">
                        Relationship Inference
                      </Label>
                    </div>
                    <Badge 
                      variant={options.useRelationInferenceLLM ? "default" : "outline"} 
                      className={`text-xs px-2 ${options.useRelationInferenceLLM ? "bg-blue-600" : "border-blue-300 text-blue-600"}`}
                    >
                      {options.useRelationInferenceLLM ? "Using Claude AI" : "Using Algorithm"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-600 px-1 bg-gray-50 p-2 rounded border border-gray-100">
                <span className="font-medium">Note:</span> By default, all processing uses Claude AI for best results. Toggle off to use algorithmic approaches.
              </div>
            </div>
          </div>
          
          {/* Activity Tracking Section */}
          <div className="rounded-lg border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-100 to-green-50 px-3 py-2">
              <h3 className="text-sm font-medium text-green-700 flex items-center">
                <Network className="h-4 w-4 mr-2" />
                Current Processing Status
                {isProcessing && <RotateCw className="h-4 w-4 ml-2 animate-spin" />}
              </h3>
            </div>
            
            <div className="p-3 bg-white">
              <div className="bg-green-50 border border-green-100 p-3 rounded-md">
                {completedSteps.map((step, index) => (
                  <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="flex items-center text-sm overflow-hidden mr-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-green-600 border border-green-200 mr-2 flex-shrink-0 shadow-sm">
                        ✓
                      </span>
                      <span className="truncate text-green-800 font-medium">{step}</span>
                    </span>
                    <span className="text-xs text-green-700 whitespace-nowrap">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                
                {isProcessing && completedSteps.length === 0 && (
                  <div className="text-blue-700 p-2 text-sm flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-blue-500 border border-blue-200 mr-2 flex-shrink-0 animate-pulse">
                      ⟳
                    </span>
                    Starting process...
                  </div>
                )}
                
                {!isProcessing && completedSteps.length === 0 && (
                  <div className="text-green-700 p-2 text-sm flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-gray-400 border border-green-200 mr-2 flex-shrink-0">
                      -
                    </span>
                    No recent activity. Generate a graph to see the process.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* API Stats Section */}
          {status !== 'idle' && (
            <div className="rounded-lg border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-2">
                <h3 className="text-sm font-medium text-blue-700 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Claude API Stats
                </h3>
              </div>
              
              <div className="p-3 bg-white">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24 flex-shrink-0">Model:</span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {metrics.model || "claude-3-sonnet"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24 flex-shrink-0">Status:</span>
                    <Badge 
                      variant={
                        status === 'idle' ? 'outline' :
                        status === 'loading' ? 'default' :
                        status === 'complete' ? 'secondary' : 'destructive'
                      }
                      className={`text-xs px-2 ${status === 'complete' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                      {status === 'idle' ? 'Idle' :
                       status === 'loading' ? 'Processing' :
                       status === 'complete' ? 'Complete' : 'Error'}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24 flex-shrink-0">Tokens:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.totalTokens || 0} total
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24 flex-shrink-0">Processing:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.processingTimeMs ? `${metrics.processingTimeMs}ms` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}