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
  hasExistingGraph: boolean; // Whether there's already a graph to append to
}

// Sample text to populate the textarea
const DEFAULT_TEXT = `John Carter, a seasoned software engineer at Acme Corp, has been leading groundbreaking projects since joining the company in 2019. At Acme Corp, he collaborates closely with Maria Rodriguez, a machine learning expert, and Luis Gomez, a cybersecurity specialist. In a major initiative, Acme Corp partnered with TechNet Inc to develop a state-of-the-art AI system headquartered in San Francisco. The project received support from a local government grant and also involved international collaboration with InnovateNow, a Berlin-based startup founded by Eva Müller. Eva, who is passionate about renewable energy, frequently connects with industry leaders such as James Thompson, an investor from London, and presents at global tech conferences.

On March 10, 2023, Acme Corp hosted a launch event at the San Francisco Innovation Hub where Maria showcased recent breakthroughs in artificial intelligence. The event brought together experts from various fields; Kevin O'Neill, a renowned data scientist from Dublin, delivered a keynote on cybersecurity in modern digital ecosystems, while Nina Patel, a tech journalist, documented the unfolding innovations. Their collective efforts spurred additional projects, including a creative campaign in collaboration with Creative Minds, a design agency based in New York, and a sustainability initiative with GreenFuture, a non-profit dedicated to environmental conservation.

Spanning cities such as San Francisco, Berlin, London, Dublin, and New York, this narrative weaves a complex network of individuals, companies, events, and locations. Each entity carries its own set of properties—roles, dates, affiliations, and geographic details—that together form a rich test case for generating a compelling labeled property graph.`;

// Sample examples to load for the example button
const EXAMPLES = [
  "John Doe works for Acme Corp since 2018 in New York. Jane Smith also works for Acme Corp since 2020. Acme Corp produces Widget X. John knows Jane since 2019.",
  "Apple Inc was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Tim Cook is the current CEO of Apple Inc. Apple Inc is based in Cupertino and produces iPhone, iPad, and Mac products.",
  "The movie Inception was directed by Christopher Nolan and stars Leonardo DiCaprio. Christopher Nolan also directed The Dark Knight which stars Christian Bale as Batman."
];

export default function InputPanel({ onGenerateGraph, isLoading, hasExistingGraph }: InputPanelProps) {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    model: "claude", // Only using Claude model
    appendMode: false
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
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>{options.appendMode ? 'Appending...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <i className={`${options.appendMode ? 'fas fa-plus-circle' : 'fas fa-project-diagram'} mr-2`}></i>
                <span>{options.appendMode ? 'Append to Graph' : 'Generate Graph'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
