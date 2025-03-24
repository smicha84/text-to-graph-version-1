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
    <Card className="w-full mt-4">
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Text-to-Graph Activity Monitor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="space-y-3">
          {/* LLM vs Algorithm Toggles */}
          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-2">Entity Processing Mode Selection</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center flex-1 mr-2">
                  <Checkbox
                    id="useEntityMergingLLM"
                    checked={options.useEntityMergingLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useEntityMergingLLM", checked === true)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                  />
                  <Label htmlFor="useEntityMergingLLM" className="ml-2 text-sm truncate">
                    Entity Deduplication/Merging
                  </Label>
                </div>
                <Badge 
                  variant={options.useEntityMergingLLM ? "default" : "outline"} 
                  className="whitespace-nowrap text-xs px-2"
                >
                  {options.useEntityMergingLLM ? "Using Claude AI" : "Using Algorithm"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center flex-1 mr-2">
                  <Checkbox
                    id="useEntityTypeLLM"
                    checked={options.useEntityTypeLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useEntityTypeLLM", checked === true)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                  />
                  <Label htmlFor="useEntityTypeLLM" className="ml-2 text-sm truncate">
                    Entity Type Detection
                  </Label>
                </div>
                <Badge 
                  variant={options.useEntityTypeLLM ? "default" : "outline"} 
                  className="whitespace-nowrap text-xs px-2"
                >
                  {options.useEntityTypeLLM ? "Using Claude AI" : "Using Algorithm"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center flex-1 mr-2">
                  <Checkbox
                    id="useRelationInferenceLLM"
                    checked={options.useRelationInferenceLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useRelationInferenceLLM", checked === true)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                  />
                  <Label htmlFor="useRelationInferenceLLM" className="ml-2 text-sm truncate">
                    Relationship Inference
                  </Label>
                </div>
                <Badge 
                  variant={options.useRelationInferenceLLM ? "default" : "outline"} 
                  className="whitespace-nowrap text-xs px-2"
                >
                  {options.useRelationInferenceLLM ? "Using Claude AI" : "Using Algorithm"}
                </Badge>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 px-1">
              Note: By default, all processing uses Claude AI. Toggle off to use algorithmic approaches.
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Activity Tracking */}
          <div>
            <h3 className="text-sm font-medium flex items-center text-green-600 mb-2">
              <Network className="h-4 w-4 mr-1" />
              Current Processing Status
              {isProcessing && <RotateCw className="h-4 w-4 ml-2 animate-spin" />}
            </h3>
            
            <div className="bg-gray-50 p-2 rounded">
              {completedSteps.map((step, index) => (
                <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                  <span className="flex items-center text-sm overflow-hidden mr-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-50 text-green-600 border border-green-200 mr-2 flex-shrink-0">
                      ✓
                    </span>
                    <span className="truncate">{step}</span>
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {!isProcessing && completedSteps.length === 0 && (
                <div className="text-gray-500 italic p-2 text-sm">
                  No recent activity. Generate a graph to see the process.
                </div>
              )}
            </div>
          </div>
          
          {status !== 'idle' && (
            <>
              <Separator className="my-2" />
              
              {/* LLM Stats */}
              <div>
                <h3 className="text-sm font-medium flex items-center text-blue-600 mb-2">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Claude API Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Model:</span>
                    <span className="text-sm font-medium truncate ml-2">
                      {metrics.model || "claude-3-sonnet"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Status:</span>
                    <Badge 
                      variant={
                        status === 'idle' ? 'outline' :
                        status === 'loading' ? 'default' :
                        status === 'complete' ? 'secondary' : 'destructive'
                      }
                      className="whitespace-nowrap ml-2"
                    >
                      {status === 'idle' ? 'Idle' :
                       status === 'loading' ? 'Processing' :
                       status === 'complete' ? 'Complete' : 'Error'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Tokens:</span>
                    <span className="text-sm font-medium ml-2">
                      {metrics.totalTokens || 0} total
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Processing:</span>
                    <span className="text-sm font-medium ml-2">
                      {metrics.processingTimeMs || 0}ms
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}