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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Text-to-Graph Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="space-y-4">
          {/* LLM vs Algorithm Toggles */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold">Processing Mode Selection</h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="useEntityMergingLLM"
                    checked={options.useEntityMergingLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useEntityMergingLLM", checked === true)
                    }
                    className="h-3 w-3 text-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="useEntityMergingLLM" className="ml-2 text-xs">
                    Entity Deduplication/Merging (LLM)
                  </Label>
                </div>
                <Badge variant={options.useEntityMergingLLM ? "default" : "outline"} className="text-[10px] h-4">
                  {options.useEntityMergingLLM ? "Claude" : "Algorithm"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="useEntityTypeLLM"
                    checked={options.useEntityTypeLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useEntityTypeLLM", checked === true)
                    }
                    className="h-3 w-3 text-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="useEntityTypeLLM" className="ml-2 text-xs">
                    Entity Type Detection (LLM)
                  </Label>
                </div>
                <Badge variant={options.useEntityTypeLLM ? "default" : "outline"} className="text-[10px] h-4">
                  {options.useEntityTypeLLM ? "Claude" : "Algorithm"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="useRelationInferenceLLM"
                    checked={options.useRelationInferenceLLM}
                    onCheckedChange={(checked) => 
                      handleOptionChange("useRelationInferenceLLM", checked === true)
                    }
                    className="h-3 w-3 text-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="useRelationInferenceLLM" className="ml-2 text-xs">
                    Relationship Inference (LLM)
                  </Label>
                </div>
                <Badge variant={options.useRelationInferenceLLM ? "default" : "outline"} className="text-[10px] h-4">
                  {options.useRelationInferenceLLM ? "Claude" : "Algorithm"}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Activity Tracking */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold flex items-center">
              <Network className="h-3 w-3 mr-1" />
              Current Processing Status
              {isProcessing && <RotateCw className="h-3 w-3 ml-2 animate-spin" />}
            </h3>
            
            <div className="space-y-1">
              {completedSteps.map((step, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="flex items-center">
                    <Badge variant="outline" className="h-4 mr-2 text-[10px] bg-green-50">
                      ✓
                    </Badge>
                    {step}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {!isProcessing && completedSteps.length === 0 && (
                <div className="text-xs text-gray-500 italic">
                  No recent activity. Generate a graph to see the process.
                </div>
              )}
            </div>
          </div>
          
          {status !== 'idle' && (
            <>
              <Separator className="my-2" />
              
              {/* LLM Stats */}
              <div className="space-y-1">
                <h3 className="text-xs font-semibold flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Claude API Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-medium">{metrics.model || "claude-3-sonnet"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge 
                      variant={
                        status === 'idle' ? 'outline' :
                        status === 'loading' ? 'default' :
                        status === 'complete' ? 'secondary' : 'destructive'
                      }
                      className="text-[10px] h-4"
                    >
                      {status === 'idle' && 'Idle'}
                      {status === 'loading' && 'Processing'}
                      {status === 'complete' && 'Complete'}
                      {status === 'error' && 'Error'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prompt Tokens:</span>
                    <span className="font-medium">{metrics.promptTokens || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completion Tokens:</span>
                    <span className="font-medium">{metrics.completionTokens || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Tokens:</span>
                    <span className="font-medium">{metrics.totalTokens || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Processing Time:</span>
                    <span className="font-medium">{metrics.processingTimeMs || 0}ms</span>
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