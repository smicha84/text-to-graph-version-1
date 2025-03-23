import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GraphGenerationOptions } from "@/types/graph";
import { Input } from "@/components/ui/input";
import { ApiLab } from "@/components/apilab";
import { ApiTemplate, ApiCall } from "@shared/schema";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Share2Icon, 
  XIcon, 
  RotateCwIcon,
  Beaker,
  Code,
  Brain,
  Settings,
  Info
} from "lucide-react";

interface InputPanelProps {
  onGenerateGraph: (text: string, options: GraphGenerationOptions) => void;
  isLoading: boolean;
  hasExistingGraph: boolean; // Whether there's already a graph to append to
}

// Sample examples to populate the textarea
const EXAMPLES = [
  "John Doe works for Acme Corp since 2018 in New York. Jane Smith also works for Acme Corp since 2020. Acme Corp produces Widget X. John knows Jane since 2019.",
  "Apple Inc was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Tim Cook is the current CEO of Apple Inc. Apple Inc is based in Cupertino and produces iPhone, iPad, and Mac products.",
  "The movie Inception was directed by Christopher Nolan and stars Leonardo DiCaprio. Christopher Nolan also directed The Dark Knight which stars Christian Bale as Batman."
];

export default function InputPanel({ onGenerateGraph, isLoading, hasExistingGraph }: InputPanelProps) {
  const [text, setText] = useState(EXAMPLES[0]);
  const [expanded, setExpanded] = useState(false);
  const [showApiLab, setShowApiLab] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: "claude", // Only Claude model is supported
    appendMode: false,
    // Advanced options with default values
    saveApiCall: true, // Track API calls in history
    thinkingEnabled: true, // Enable thinking mode for debugging
    thinkingBudget: 2000, // Default token budget for thinking
    temperature: "1.0", // Default temperature
    systemPrompt: "You are an expert in natural language processing and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph.", // Default system prompt
    customExtractionPrompt: "", // Custom extraction prompt (empty = use default)
    apiTemplateId: null, // Selected API template ID
  });

  const handleOptionChange = (option: keyof GraphGenerationOptions, value: boolean | string | number | null) => {
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

  // Handle template selection from API Lab
  const handleSelectTemplate = (template: ApiTemplate) => {
    setOptions(prev => ({
      ...prev,
      systemPrompt: template.systemPrompt,
      customExtractionPrompt: template.extractionPrompt,
      temperature: template.temperature,
      thinkingEnabled: template.thinkingEnabled,
      thinkingBudget: template.thinkingBudget,
      apiTemplateId: template.id
    }));
    
    // Close the API Lab dialog
    setShowApiLab(false);
  };

  // Handle reusing an API call configuration
  const handleSelectApiCall = (apiCall: ApiCall) => {
    // Set the text from the API call
    setText(apiCall.text);
    
    // Set the options from the API call
    const callOptions = apiCall.options || {};
    setOptions(prev => ({
      ...prev,
      extractEntities: callOptions.extractEntities ?? true,
      extractRelations: callOptions.extractRelations ?? true,
      inferProperties: callOptions.inferProperties ?? true,
      mergeEntities: callOptions.mergeEntities ?? true,
      appendMode: callOptions.appendMode ?? false,
      systemPrompt: apiCall.systemPrompt || prev.systemPrompt,
      customExtractionPrompt: apiCall.extractionPrompt || prev.customExtractionPrompt,
      temperature: callOptions.temperature || prev.temperature,
      thinkingEnabled: callOptions.thinkingEnabled ?? prev.thinkingEnabled,
      thinkingBudget: callOptions.thinkingBudget ?? prev.thinkingBudget,
      apiTemplateId: callOptions.apiTemplateId ?? null
    }));
    
    // Close the API Lab dialog
    setShowApiLab(false);
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
            <button 
              onClick={() => setShowApiLab(true)}
              className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center"
            >
              <Beaker className="h-3 w-3 mr-1" />
              API Lab
            </button>
          </div>
        )}
      </div>
      
      {expanded ? (
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <Textarea
              id="textInput"
              className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter your text here to generate a property graph..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="mt-4">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <Label className="block text-sm font-medium text-gray-700">Graph Extraction Options</Label>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="h-7 text-xs flex items-center gap-1 text-gray-600"
                  >
                    <Settings className="h-3 w-3" />
                    {showAdvancedOptions ? 'Hide Advanced' : 'Advanced Options'}
                  </Button>
                </div>
                
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
                
                {/* Advanced Claude API Options */}
                {showAdvancedOptions && (
                  <div className="mt-4 p-3 border border-gray-200 rounded">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1 text-gray-700">
                      <Brain className="h-4 w-4" />
                      Claude API Configuration
                      {options.apiTemplateId && (
                        <Badge className="ml-1" variant="outline">Template ID: {options.apiTemplateId}</Badge>
                      )}
                    </h4>
                    
                    <div className="space-y-3 text-sm">
                      {/* Temperature Setting */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <Label htmlFor="temperature" className="text-gray-700">
                          Temperature:
                        </Label>
                        <Input 
                          id="temperature" 
                          type="text" 
                          value={options.temperature} 
                          onChange={(e) => handleOptionChange("temperature", e.target.value)}
                          className="h-7 text-sm"
                          pattern="^(0(\.\d{1,2})?|1(\.0{1,2})?)$"
                          title="Value between 0 and 1 with up to 2 decimal places"
                        />
                      </div>
                      
                      {/* Thinking Mode Toggle */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <Label htmlFor="thinkingEnabled" className="text-gray-700">
                          Thinking Mode:
                        </Label>
                        <div className="flex items-center">
                          <Switch 
                            id="thinkingEnabled" 
                            checked={options.thinkingEnabled === true}
                            onCheckedChange={(checked) => 
                              handleOptionChange("thinkingEnabled", checked)
                            }
                          />
                          <span className="ml-2 text-xs text-gray-500">
                            {options.thinkingEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Thinking Budget (only when thinking is enabled) */}
                      {options.thinkingEnabled && (
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <Label htmlFor="thinkingBudget" className="text-gray-700">
                            Thinking Budget:
                          </Label>
                          <Input 
                            id="thinkingBudget" 
                            type="number" 
                            min="500" 
                            max="10000" 
                            step="100" 
                            value={options.thinkingBudget} 
                            onChange={(e) => handleOptionChange("thinkingBudget", parseInt(e.target.value))}
                            className="h-7 text-sm"
                          />
                        </div>
                      )}
                      
                      {/* Save API Call Toggle */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <Label htmlFor="saveApiCall" className="text-gray-700">
                          Save to History:
                        </Label>
                        <div className="flex items-center">
                          <Switch 
                            id="saveApiCall" 
                            checked={options.saveApiCall === true}
                            onCheckedChange={(checked) => 
                              handleOptionChange("saveApiCall", checked)
                            }
                          />
                          <span className="ml-2 text-xs text-gray-500">
                            {options.saveApiCall ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      
                      {/* System Prompt */}
                      <div className="pt-2">
                        <Label htmlFor="systemPrompt" className="text-gray-700 block mb-1">
                          System Prompt:
                        </Label>
                        <Textarea 
                          id="systemPrompt" 
                          value={options.systemPrompt} 
                          onChange={(e) => handleOptionChange("systemPrompt", e.target.value)}
                          className="h-20 text-xs font-mono"
                          placeholder="Instructions for Claude on how to approach the task..."
                        />
                      </div>
                      
                      {/* Custom Extraction Prompt */}
                      <div>
                        <Label htmlFor="customExtractionPrompt" className="text-gray-700 block mb-1">
                          Custom Extraction Prompt:
                        </Label>
                        <Textarea 
                          id="customExtractionPrompt" 
                          value={options.customExtractionPrompt} 
                          onChange={(e) => handleOptionChange("customExtractionPrompt", e.target.value)}
                          className="h-20 text-xs font-mono"
                          placeholder="Leave empty to use the default prompt..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          <Info className="h-3 w-3 inline mr-1" />
                          Leave empty to use the default extraction prompt
                        </p>
                      </div>
                      
                      <div className="text-right pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowApiLab(true)}
                          className="text-xs gap-1"
                        >
                          <Beaker className="h-3 w-3" />
                          Open API Lab
                        </Button>
                      </div>
                    </div>
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
        </div>
      ) : (
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
      )}
      
      {/* API Lab Dialog */}
      <Dialog open={showApiLab} onOpenChange={setShowApiLab}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              API Lab
            </DialogTitle>
            <DialogDescription>
              Create and manage custom API templates and view call history
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ApiLab
              onSelectTemplate={handleSelectTemplate}
              onSelectApiCall={handleSelectApiCall}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
