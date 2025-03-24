import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Graph, GraphGenerationOptions } from "@/types/graph";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2 } from "lucide-react";

export default function GraphV2() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Graph | null>(null);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: "claude"
  });
  const { toast } = useToast();

  // Mutation for graph generation
  const generateMutation = useMutation({
    mutationFn: async ({ text, options }: { text: string, options: GraphGenerationOptions }) => {
      const response = await apiRequest('POST', '/api/generate-graph-v2', {
        text,
        options
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to generate graph");
      }
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setResult(data);
      toast({
        title: "Graph generated successfully",
        description: `Created ${data.nodes.length} nodes and ${data.edges.length} edges.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating graph",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateGraph = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a graph",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ text, options });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Graph Generation V2</h1>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Experimental
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Input Text</CardTitle>
                <CardDescription>
                  Enter the text you want to convert into a graph structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter text to analyze..."
                  className="min-h-[300px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  {text.length} characters
                </div>
                <Button 
                  onClick={handleGenerateGraph} 
                  disabled={generateMutation.isPending || !text.trim()}
                >
                  {generateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Graph
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
                <CardDescription>
                  Customize how the graph is generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="extract-entities">Extract Entities</Label>
                  <Switch
                    id="extract-entities"
                    checked={options.extractEntities}
                    onCheckedChange={(checked) => 
                      setOptions({...options, extractEntities: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="extract-relations">Extract Relations</Label>
                  <Switch
                    id="extract-relations"
                    checked={options.extractRelations}
                    onCheckedChange={(checked) => 
                      setOptions({...options, extractRelations: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="infer-properties">Infer Properties</Label>
                  <Switch
                    id="infer-properties"
                    checked={options.inferProperties}
                    onCheckedChange={(checked) => 
                      setOptions({...options, inferProperties: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="merge-entities">Merge Similar Entities</Label>
                  <Switch
                    id="merge-entities"
                    checked={options.mergeEntities}
                    onCheckedChange={(checked) => 
                      setOptions({...options, mergeEntities: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {result && (
          <div className="mt-8">
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle>Graph Result</CardTitle>
                <CardDescription>
                  Generated {result.nodes.length} nodes and {result.edges.length} edges
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="nodes">
                  <TabsList>
                    <TabsTrigger value="nodes">Nodes ({result.nodes.length})</TabsTrigger>
                    <TabsTrigger value="edges">Edges ({result.edges.length})</TabsTrigger>
                    <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="nodes" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.nodes.map(node => (
                        <Card key={node.id} className="border border-gray-200 shadow-sm">
                          <CardHeader className="p-3 pb-1 bg-gray-50">
                            <CardTitle className="text-md">{node.label}</CardTitle>
                            <CardDescription className="text-xs">Type: {node.type}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-2">
                            <div className="text-sm">
                              <strong>Properties:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {Object.entries(node.properties).map(([key, value]) => (
                                  <li key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="edges" className="mt-4">
                    <div className="space-y-2">
                      {result.edges.map(edge => (
                        <div key={edge.id} className="flex items-center p-3 border rounded-md">
                          <div className="w-1/3 font-medium truncate">
                            {result.nodes.find(n => n.id === edge.source)?.label || edge.source}
                          </div>
                          <div className="flex-1 flex justify-center items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                              {edge.label}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="w-1/3 text-right font-medium truncate">
                            {result.nodes.find(n => n.id === edge.target)?.label || edge.target}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="json" className="mt-4">
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}