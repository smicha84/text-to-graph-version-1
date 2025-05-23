import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GraphGenerationOptions, Graph } from "@/types/graph";
import { 
  FileTextIcon, 
  Share2Icon, 
  RotateCwIcon,
  SettingsIcon,
  InfoIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  LayersIcon
} from "lucide-react";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import { getNodeDisplayLabel } from "@/lib/displayUtils";
import ActivityTracker from "@/components/ActivityTracker";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MultiSubgraphInput, { TextSegment } from "@/components/MultiSubgraphInput";

interface InputPanelProps {
  onGenerateGraph: (text: string, options: GraphGenerationOptions, segments?: TextSegment[]) => void;
  onWebSearch?: (nodeId: string, query: string) => void;
  isLoading: boolean;
  isSearching?: boolean;
  hasExistingGraph: boolean;
  selectedNodeId?: string;
  graph?: Graph | null;
}

// Sample examples to populate the textarea
const EXAMPLES = [
  "John Doe works for Acme Corp since 2018 in New York. Jane Smith also works for Acme Corp since 2020. Acme Corp produces Widget X. John knows Jane since 2019.",
  "Apple Inc was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Tim Cook is the current CEO of Apple Inc. Apple Inc is based in Cupertino and produces iPhone, iPad, and Mac products.",
  "The movie Inception was directed by Christopher Nolan and stars Leonardo DiCaprio. Christopher Nolan also directed The Dark Knight which stars Christian Bale as Batman."
];

export default function InputPanel({ 
  onGenerateGraph, 
  onWebSearch, 
  isLoading, 
  isSearching = false, 
  hasExistingGraph, 
  selectedNodeId,
  graph = null
}: InputPanelProps) {
  const [text, setText] = useState(EXAMPLES[0]);
  const [activeTab, setActiveTab] = useState<string>("input");
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [textSegments, setTextSegments] = useState<TextSegment[]>([]);
  
  // Default options
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    generateOntology: true, // Enable ontology generation by default
    generateTaxonomies: true, // Enable entity taxonomy generation by default
    model: "claude",
    appendMode: false,
    useEntityMergingLLM: true,
    useEntityTypeLLM: true, 
    useRelationInferenceLLM: true
  });
  
  // When process starts, switch to activity tab
  useEffect(() => {
    if (isLoading) {
      setActiveTab("activity");
    }
  }, [isLoading]);
  
  // Clear text segments after graph generation is completed
  // This fixes the issue of segments persisting after they're added to the graph
  useEffect(() => {
    // When isLoading transitions from true to false, it means the graph generation has completed
    if (!isLoading && hasExistingGraph && textSegments.length > 0) {
      // Check if this is the state after a successful graph generation
      // Note: We don't clear segments just because isLoading becomes false
      // We only want to clear them after they've been submitted for processing
      if (submittedForProcessing.current) {
        // Reset the flag and clear the segments
        submittedForProcessing.current = false;
        setTextSegments([]);
        
        // If text was processed in append mode, keep that mode active
        // Otherwise reset it to avoid unexpected behavior on the next generation
        if (!options.appendMode) {
          handleOptionChange("appendMode", false);
        }
      }
    }
  }, [isLoading, hasExistingGraph, textSegments.length, options.appendMode]);
  
  // Ref to track if segments have been submitted for processing
  const submittedForProcessing = useRef(false);
  
  // Auto-generate search prompt and suggestions when a node is selected
  useEffect(() => {
    if (selectedNodeId && graph) {
      try {
        const searchQuery = generateWebSearchQuery(graph, selectedNodeId);
        setSearchPrompt(searchQuery);
      } catch (error) {
        const node = graph.nodes.find(n => n.id === selectedNodeId);
        const nodeName = node ? getNodeDisplayLabel(node) : "this entity";
        setSearchPrompt(`Find more information about ${nodeName} and its relationships`);
      }
      
      // Generate contextual suggestions
      setSuggestedQueries(generateSuggestions());
    } else {
      setSearchPrompt("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  const handleOptionChange = (option: keyof GraphGenerationOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleGenerateClick = () => {
    // If we have segments, we can proceed even with empty main text
    // If no segments and no text, we can't proceed (button should be disabled)
    if (!text.trim() && textSegments.length === 0) return;
    
    // Set the flag to indicate that we're submitting for processing
    // This will allow the useEffect to clear segments only after they've been processed
    if (textSegments.length > 0) {
      submittedForProcessing.current = true;
    }
    
    // Pass text segments if available, otherwise just generate from the full text
    onGenerateGraph(text, options, textSegments.length > 0 ? textSegments : undefined);
  };

  const handleClearClick = () => {
    setText("");
    setTextSegments([]);
    // Reset the appendMode option when clearing text
    if (options.appendMode) {
      handleOptionChange("appendMode", false);
    }
  };

  const handleExampleClick = () => {
    // Select a random example
    const randomExample = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    setText(randomExample);
    setTextSegments([]); // Clear any text segments when loading an example
    // Reset appendMode when loading an example
    if (options.appendMode) {
      handleOptionChange("appendMode", false);
    }
  };

  // Function to generate contextual search suggestions based on node type
  const generateSuggestions = () => {
    if (selectedNodeId && graph) {
      const node = graph.nodes.find(n => n.id === selectedNodeId);
      if (!node) return [];
      
      const suggestions: string[] = [];
      const displayLabel = getNodeDisplayLabel(node);
      
      // Always suggest the node label with Wikipedia
      suggestions.push(`${displayLabel} Wikipedia categories`);
      
      // Generate type-specific suggestions
      if (node.type === 'Person') {
        suggestions.push(`${displayLabel} biography`);
        suggestions.push(`${displayLabel} career highlights`);
      } else if (node.type === 'Organization' || node.type === 'Company') {
        suggestions.push(`${displayLabel} industry information`);
        suggestions.push(`${displayLabel} history and background`);
      } else if (node.type === 'Event') {
        suggestions.push(`${displayLabel} details and significance`);
        suggestions.push(`${displayLabel} timeline`);
      } else if (node.type === 'Concept' || node.type === 'Method') {
        suggestions.push(`${displayLabel} explanation and applications`);
        suggestions.push(`${displayLabel} related theories`);
      } else {
        // Generic suggestions for other node types
        suggestions.push(`${displayLabel} detailed information`);
        suggestions.push(`${displayLabel} related concepts`);
      }
      
      return suggestions;
    }
    return [];
  };

  // Function to execute the web search
  const executeSearch = () => {
    if (selectedNodeId && onWebSearch && searchPrompt) {
      onWebSearch(selectedNodeId, searchPrompt);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-gray-200 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="px-4 pt-3 pb-0">
            <TabsList className="grid grid-cols-2 mb-1">
              <TabsTrigger value="input" className="text-sm">
                <FileTextIcon className="h-4 w-4 mr-2" />
                Input Text
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-sm">
                <RotateCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Activity
                {isLoading && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Input Text Tab */}
          <TabsContent 
            value="input" 
            className="mt-0 flex-1 flex flex-col overflow-auto p-0"
          >
            {/* Input panel header with utility buttons */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Generate Knowledge Graph</h3>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleClearClick}
                  size="sm" 
                  variant="outline"
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleExampleClick}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                >
                  Example
                </Button>
              </div>
            </div>
            
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-auto">
              {/* Text input area with segmentation */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="textInput" className="block text-sm font-medium text-gray-700">
                    Enter Text to Transform
                  </Label>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${textSegments.length > 0 ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-gray-50'}`}
                    >
                      {textSegments.length > 0 ? `${textSegments.length} Subgraphs` : "No Subgraphs"}
                    </Badge>
                  </div>
                </div>
                
                <MultiSubgraphInput 
                  text={text}
                  onChange={setText}
                  segments={textSegments}
                  onSegmentsChange={setTextSegments}
                  graph={graph}
                />
              </div>
              
              {/* Options section */}
              <div>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center">
                      <SettingsIcon className="h-4 w-4 mr-2 text-gray-500" />
                      Processing Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 pb-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id="extractEntities"
                          checked={options.extractEntities}
                          onCheckedChange={(checked) => 
                            handleOptionChange("extractEntities", checked === true)
                          }
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="extractEntities" className="ml-2 text-sm text-gray-700">
                          Extract Entities
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="extractRelations"
                          checked={options.extractRelations}
                          onCheckedChange={(checked) => 
                            handleOptionChange("extractRelations", checked === true)
                          }
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="extractRelations" className="ml-2 text-sm text-gray-700">
                          Extract Relations
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="inferProperties"
                          checked={options.inferProperties}
                          onCheckedChange={(checked) => 
                            handleOptionChange("inferProperties", checked === true)
                          }
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="inferProperties" className="ml-2 text-sm text-gray-700">
                          Infer Properties
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="mergeEntities"
                          checked={options.mergeEntities}
                          onCheckedChange={(checked) => 
                            handleOptionChange("mergeEntities", checked === true)
                          }
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="mergeEntities" className="ml-2 text-sm text-gray-700">
                          Merge Similar Entities
                        </Label>
                      </div>
                      <div className="flex items-center relative group">
                        <Checkbox
                          id="generateOntologyInput"
                          checked={options.generateOntology}
                          onCheckedChange={(checked) => 
                            handleOptionChange("generateOntology", checked === true)
                          }
                          className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                        />
                        <Label htmlFor="generateOntologyInput" className="ml-2 text-sm text-purple-800">
                          Generate Ontology
                        </Label>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-purple-50 border border-purple-200 p-2 rounded shadow-sm w-52 text-xs text-purple-800 z-10">
                          Creates a domain-specific ontology before extracting entities, resulting in more coherent and consistent graphs. Slightly increases processing time.
                        </div>
                      </div>
                      <div className="flex items-center relative group">
                        <Checkbox
                          id="generateTaxonomiesInput"
                          checked={options.generateTaxonomies}
                          onCheckedChange={(checked) => 
                            handleOptionChange("generateTaxonomies", checked === true)
                          }
                          className="h-4 w-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                        />
                        <Label htmlFor="generateTaxonomiesInput" className="ml-2 text-sm text-indigo-800">
                          Generate Taxonomies
                        </Label>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-indigo-50 border border-indigo-200 p-2 rounded shadow-sm w-52 text-xs text-indigo-800 z-10">
                          Creates hierarchical taxonomic relationships (IS_PARENT_OF) between entity types, providing enhanced categorical organization. Works best with ontology enabled.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Append mode - only when there's an existing graph */}
              {hasExistingGraph && (
                <div>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center mb-1">
                        <Checkbox
                          id="appendMode"
                          checked={options.appendMode === true}
                          disabled={!hasExistingGraph}
                          onCheckedChange={(checked) => 
                            handleOptionChange("appendMode", checked === true)
                          }
                          className={`h-4 w-4 border-blue-300 rounded focus:ring-blue-500 ${
                            hasExistingGraph 
                              ? 'text-blue-600 hover:bg-blue-50' 
                              : 'text-gray-300'
                          }`}
                        />
                        <Label 
                          htmlFor="appendMode" 
                          className={`ml-2 text-sm font-medium ${
                            hasExistingGraph ? 'text-blue-800' : 'text-gray-400'
                          }`}
                        >
                          Append to Existing Graph {!hasExistingGraph && "(Generate a graph first)"}
                        </Label>
                      </div>
                      <p className={`mt-1 text-xs ml-6 ${
                        hasExistingGraph ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        Add new nodes and connections to the current graph instead of replacing it
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Smart web search section - only shown when a node is selected */}
              {selectedNodeId && graph && (
                <div>
                  <Card className="border-green-200">
                    <CardHeader className="py-2.5">
                      <CardTitle className="text-sm flex items-center">
                        <InfoIcon className="h-4 w-4 mr-2 text-green-600" />
                        Web Search Available
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 pb-3">
                      <p className="text-xs text-gray-600 mb-2">
                        You can search the web for more information about the selected node. Use the sidebar to run a search and expand your graph.
                      </p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                        {(() => {
                          const selectedNode = graph.nodes.find(n => n.id === selectedNodeId);
                          return `Node Selected: ${selectedNode ? getNodeDisplayLabel(selectedNode) : ""}`;
                        })()}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Generate button at the bottom */}
              <div className="mt-auto pt-2">
                <Button
                  onClick={handleGenerateClick}
                  disabled={isLoading || (!text.trim() && textSegments.length === 0)}
                  className={`w-full ${options.appendMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-blue-600'} text-white font-medium py-2 rounded transition-colors flex items-center justify-center`}
                >
                  {isLoading ? (
                    <>
                      <RotateCwIcon size={16} className="mr-2 animate-spin" />
                      <span>
                        {textSegments.length > 0 
                          ? `Processing Subgraphs...` 
                          : options.appendMode ? 'Appending...' : 'Generating...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2Icon size={16} className="mr-2" />
                      <span>
                        {textSegments.length > 0 
                          ? `Generate From ${textSegments.length} Subgraph${textSegments.length > 1 ? 's' : ''}` 
                          : options.appendMode ? 'Append to Graph' : 'Generate Graph'}
                      </span>
                    </>
                  )}
                </Button>
                
                {/* Info about process */}
                <div className="mt-2 text-xs text-gray-500 flex items-start px-1">
                  <InfoIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span>
                    {textSegments.length > 0 ? (
                      <>
                        This will process your {textSegments.length} subgraph{textSegments.length > 1 ? 's' : ''} sequentially using Claude AI. 
                        Each subgraph will be processed individually and then merged into a cohesive visualization.
                        Total processing takes approximately {textSegments.length * 5}-{textSegments.length * 10} seconds.
                      </>
                    ) : (
                      <>
                        This will process your text using Claude AI to 
                        {options.generateOntology ? ' create a domain ontology, ' : ''}
                        {options.generateTaxonomies ? ' build taxonomic hierarchies, ' : ''}
                        extract entities and relationships, then visualize them as a graph. 
                        Processing takes {(options.generateOntology && options.generateTaxonomies) ? '10-20' : options.generateOntology ? '8-15' : '5-10'} seconds.
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Activity Monitor Tab */}
          <TabsContent 
            value="activity" 
            className="mt-0 flex-1 overflow-auto p-4"
          >
            <ActivityTracker 
              options={options} 
              onOptionsChange={setOptions} 
              isProcessing={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}