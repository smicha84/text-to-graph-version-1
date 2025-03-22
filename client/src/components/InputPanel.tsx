import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraphGenerationOptions } from "@/types/graph";

interface InputPanelProps {
  onGenerateGraph: (text: string, options: GraphGenerationOptions) => void;
  isLoading: boolean;
}

// Sample examples to populate the textarea
const EXAMPLES = [
  "John Doe works for Acme Corp since 2018 in New York. Jane Smith also works for Acme Corp since 2020. Acme Corp produces Widget X. John knows Jane since 2019.",
  "Apple Inc was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Tim Cook is the current CEO of Apple Inc. Apple Inc is based in Cupertino and produces iPhone, iPad, and Mac products.",
  "The movie Inception was directed by Christopher Nolan and stars Leonardo DiCaprio. Christopher Nolan also directed The Dark Knight which stars Christian Bale as Batman."
];

export default function InputPanel({ onGenerateGraph, isLoading }: InputPanelProps) {
  const [text, setText] = useState(EXAMPLES[0]);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: "claude"
  });

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

  return (
    <div className="w-2/5 bg-white shadow-md border-r border-gray-200 flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">Input Text</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleClearClick}
            className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={handleExampleClick}
            className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Examples
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <Textarea
            id="textInput"
            className="w-full h-80 p-3 border border-gray-300 rounded font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Enter your text here to generate a property graph..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="mt-4">
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1">Generation Options</Label>
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
            </div>
            
            <div>
              <Label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </Label>
              <Select
                value={options.model}
                onValueChange={(value) => handleOptionChange("model", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Recommended)</SelectItem>
                  <SelectItem value="fallback">Regex Fallback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            onClick={handleGenerateClick}
            disabled={isLoading || !text.trim()}
            className="w-full mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <i className="fas fa-project-diagram mr-2"></i>
                <span>Generate Graph</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
