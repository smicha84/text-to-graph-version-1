import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { GraphGenerationOptions, WebSearchOptions, Graph } from "@/types/graph";
import { 
  ChevronLeftIcon, ChevronRightIcon, Share2Icon, 
  XIcon, RotateCwIcon, GlobeIcon 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { generateWebSearchQuery } from "@/lib/webSearchUtils";
import SidebarPromptStation from "@/components/SidebarPromptStation";

interface InputPanelProps {
  onGenerateGraph: (text: string, options: GraphGenerationOptions) => void;
  onWebSearch?: (nodeId: string, query: string) => void; // Added for web search
  isLoading: boolean;
  isSearching?: boolean; // Added to show loading state for search
  hasExistingGraph: boolean; // Whether there's already a graph to append to
  selectedNodeId?: string; // ID of the selected node for web search
  graph?: Graph | null; // The current graph data (optional)
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
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: "claude", // Only using Claude model
    appendMode: false
  });

  // State for prompt station (web search) - always visible when node is selected
  const [searchPrompt, setSearchPrompt] = useState("");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);

  // Auto-generate search prompt and suggestions when a node is selected
  useEffect(() => {
    if (selectedNodeId && graph) {
      // Generate default search prompt when a node is selected
      try {
        const searchQuery = generateWebSearchQuery(graph, selectedNodeId);
        setSearchPrompt(searchQuery);
      } catch (error) {
        const node = graph.nodes.find(n => n.id === selectedNodeId);
        const nodeName = node ? (node.properties.name || node.label) : "this entity";
        setSearchPrompt(`Find more information about ${nodeName} and its relationships`);
      }
      
      // Generate contextual suggestions
      setSuggestedQueries(generateSuggestions());
    } else {
      // Clear when no node is selected
      setSearchPrompt("");
      setSuggestedQueries([]);
    }
  }, [selectedNodeId, graph]);

  const handleOptionChange = (option: keyof GraphGenerationOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleGenerateClick = () => {
    if (!text.trim()) return;
    onGenerateGraph(text, options);
  };

  const handleClearClick = () => {
    setText("");
  };

  const handleExampleClick = () => {
    // Select a random example
    const randomExample = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    setText(randomExample);
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Function to generate contextual search suggestions based on node type
  const generateSuggestions = () => {
    if (selectedNodeId && graph) {
      const node = graph.nodes.find(n => n.id === selectedNodeId);
      if (!node) return [];
      
      const suggestions: string[] = [];
      
      // Always suggest the node label with Wikipedia
      suggestions.push(`${node.label} ${node.properties.name || ''} Wikipedia categories`);
      
      // Generate type-specific suggestions
      if (node.type === 'Person') {
        suggestions.push(`${node.properties.name || node.label} biography`);
        suggestions.push(`${node.properties.name || node.label} career highlights`);
      } else if (node.type === 'Organization' || node.type === 'Company') {
        suggestions.push(`${node.properties.name || node.label} industry information`);
        suggestions.push(`${node.properties.name || node.label} history and background`);
      } else if (node.type === 'Event') {
        suggestions.push(`${node.properties.name || node.label} details and significance`);
        suggestions.push(`${node.properties.name || node.label} timeline`);
      } else if (node.type === 'Concept' || node.type === 'Method') {
        suggestions.push(`${node.properties.name || node.label} explanation and applications`);
        suggestions.push(`${node.properties.name || node.label} related theories`);
      } else {
        // Generic suggestions for other node types
        suggestions.push(`${node.properties.name || node.label} detailed information`);
        suggestions.push(`${node.properties.name || node.label} related concepts`);
      }
      
      // Try using webSearchUtils for a more comprehensive query
      try {
        const contextualQuery = generateWebSearchQuery(graph, selectedNodeId);
        suggestions.push(contextualQuery);
      } catch (error) {
        // Skip if there's an error
      }

      return suggestions;
    }
    return [];
  };

  // Function to prepare the web search prompt using webSearchUtils - refreshes the suggestions
  const prepareWebSearch = () => {
    if (selectedNodeId && graph) {
      try {
        // Generate a better search query based on the node and its connections
        const searchQuery = generateWebSearchQuery(graph, selectedNodeId);
        setSearchPrompt(searchQuery);
      } catch (error) {
        // Fallback if there's an error with the utility
        const node = graph.nodes.find(n => n.id === selectedNodeId);
        const nodeName = node ? (node.properties.name || node.label) : "this entity";
        setSearchPrompt(`Find more information about ${nodeName} and its relationships`);
      }
      
      // Refresh contextual suggestions
      setSuggestedQueries(generateSuggestions());
    }
  };
  
  // Function to use a suggested query
  const useSuggestedQuery = (query: string) => {
    setSearchPrompt(query);
  };

  // Function to execute the web search
  const executeSearch = () => {
    if (selectedNodeId && onWebSearch && searchPrompt) {
      onWebSearch(selectedNodeId, searchPrompt);
    }
  };

  return (
    <div className={`${expanded ? 'w-2/5' : 'w-[300px]'} transition-all duration-300 bg-white shadow-md border-r border-gray-200 flex flex-col h-full`}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700 flex items-center">
          Input Text
          <button 
            onClick={toggleExpanded}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {expanded ? <ChevronLeftIcon size={14} /> : <ChevronRightIcon size={14} />}
          </button>
        </h2>
        
        {expanded && (
          <div className="flex space-x-2">
            <button 
              onClick={handleClearClick}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={handleExampleClick}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Example
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="p-4 flex-grow">
            <Textarea
              id="textInput"
              className="w-full h-56 p-3 border border-gray-300 rounded font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter your text here to generate a property graph..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="mt-4">
              <div className="mb-3">
                <Label className="block text-sm font-medium text-gray-700 mb-1">Claude Processing Options</Label>
                <div className="grid grid-cols-2 gap-3">
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
                </div>
                
                {/* Append Mode Toggle - Only show when there's an existing graph */}
                {hasExistingGraph && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center">
                      <Checkbox
                        id="appendMode"
                        checked={options.appendMode === true}
                        onCheckedChange={(checked) => 
                          handleOptionChange("appendMode", checked === true)
                        }
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor="appendMode" className="ml-2 text-sm font-medium text-blue-800">
                        Append to Existing Graph
                      </Label>
                    </div>
                    <p className="mt-1 text-xs text-blue-600 ml-6">
                      Add new nodes and connections to the current graph instead of replacing it
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleGenerateClick}
              disabled={isLoading || !text.trim()}
              className={`w-full mt-4 ${options.appendMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-blue-600'} text-white font-medium py-2 rounded transition-colors flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <RotateCwIcon size={16} className="mr-2 animate-spin" />
                  <span>{options.appendMode ? 'Appending...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Share2Icon size={16} className="mr-2" />
                  <span>{options.appendMode ? 'Append to Graph' : 'Generate Graph'}</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Persistent Sidebar Prompt Station for Web Search - always visible */}
          <SidebarPromptStation
            onWebSearch={onWebSearch!}
            isSearching={isSearching}
            selectedNodeId={selectedNodeId}
            graph={graph}
          />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-3 flex flex-col space-y-3">
            <div className="text-xs text-gray-500 truncate max-w-full">
              {text ? text.substring(0, 80) + (text.length > 80 ? "..." : "") : "Enter text to generate a graph..."}
            </div>
            <Button
              onClick={handleGenerateClick}
              disabled={isLoading || !text.trim()}
              className={`w-full ${options.appendMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-blue-600'} text-white text-sm py-1 rounded transition-colors flex items-center justify-center`}
              size="sm"
            >
              {isLoading ? (
                <>
                  <RotateCwIcon size={12} className="mr-1 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Share2Icon size={12} className="mr-1" />
                  <span>Generate Graph</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Persistent Sidebar Prompt Station in collapsed view - always visible */}
          <div className="mt-auto">
            <SidebarPromptStation
              onWebSearch={onWebSearch!}
              isSearching={isSearching}
              selectedNodeId={selectedNodeId}
              graph={graph}
            />
          </div>
        </div>
      )}
    </div>
  );
}