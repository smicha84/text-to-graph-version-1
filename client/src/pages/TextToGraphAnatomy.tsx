import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useRecentApiLogs } from "@/hooks/use-api-logs";

export default function TextToGraphAnatomy() {
  // Fetch the most recent graph generation logs
  const { data: logsResponse, isLoading } = useRecentApiLogs("generate_graph", 3, true);
  const recentApiLogs = logsResponse?.data || [];
  
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Text-to-Graph Process Anatomy</h1>
      <p className="text-lg mb-8">
        This page explains exactly how the text-to-graph process works, breaking down each step
        from user input to graph visualization.
      </p>
      
      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="step1">Text Input</TabsTrigger>
          <TabsTrigger value="step2">API Processing</TabsTrigger>
          <TabsTrigger value="step3">Graph Creation</TabsTrigger>
          <TabsTrigger value="step4">Visualization</TabsTrigger>
        </TabsList>
        
        {/* Overview of the entire process */}
        <TabsContent value="overview" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">The End-to-End Process</h2>
          
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-700">1. User Input</h3>
                <p className="text-sm mt-1">Text is entered and options are selected</p>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <h3 className="font-medium text-purple-700">2. Claude API</h3>
                <p className="text-sm mt-1">Text is processed by Claude with special prompt</p>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="font-medium text-green-700">3. Graph Display</h3>
                <p className="text-sm mt-1">JSON is converted to interactive visualization</p>
              </div>
            </div>
            
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Process Flow Diagram</h3>
              <div className="overflow-auto">
                <pre className="text-xs bg-black text-white p-4 rounded">
{`User Input (Text + Options) → Client/InputPanel → API Request → Server/routes.ts → 
  → generateGraphFromText() → anthropic.ts/generateGraphWithClaude() → Claude API → 
  → JSON response → processGraphData() → applyLayout() → Server response → 
  → Client receives graph → GraphVisualizer renders SVG → Interactive Graph}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h3 className="font-medium text-amber-700 mb-2">Key Components Involved</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><span className="font-medium">client/src/components/InputPanel.tsx</span> - Handles user text input and options</li>
                <li><span className="font-medium">client/src/pages/Home.tsx</span> - Manages API request and response state</li>
                <li><span className="font-medium">server/routes.ts</span> - Processes the API request and orchestrates graph creation</li>
                <li><span className="font-medium">server/anthropic.ts</span> - Contains the Claude API integration and prompt engineering</li>
                <li><span className="font-medium">client/src/lib/graphVisualizer.ts</span> - Renders the graph visualization</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 1: Text Input and Options */}
        <TabsContent value="step1" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 1: Text Input and Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">User Interface</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The process begins with the <code>InputPanel</code> component where the user:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Enters text to be converted into a graph</li>
                  <li>Configures options for graph generation</li>
                  <li>Clicks the "Generate Graph" button</li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Code Flow: Input Panel</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>User enters text in <code>textarea</code></li>
                    <li>Options are set through UI controls</li>
                    <li>On submit: <code>handleGenerateGraph(text, options)</code> is called</li>
                    <li>Data is passed to parent component (<code>Home.tsx</code>)</li>
                  </ol>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Processing Options</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  The graph generation options determine how the text will be processed:
                </p>
                <pre className="text-xs bg-black text-white p-3 rounded overflow-auto">
{`interface GraphGenerationOptions {
  extractEntities: boolean;     // Find entities in text
  extractRelations: boolean;    // Find relationships
  inferProperties: boolean;     // Infer additional properties
  mergeEntities: boolean;       // Merge duplicate entities
  generateOntology: boolean;    // Generate domain ontology
  model: 'claude';              // AI model to use
  appendMode?: boolean;         // Append to existing graph?
  
  // Processing mode toggles
  useEntityMergingLLM: boolean; // Use AI for merging
  useEntityTypeLLM: boolean;    // Use AI for typing
  useRelationInferenceLLM: boolean; // Use AI for relations
}`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">API Request Formation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The inputted text and options are transformed into an API request:
                </p>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Example Input Text:</h4>
                  <div className="mt-1 text-xs italic border-l-2 border-gray-300 pl-3">
                    "John Doe is an employee at Acme Corp based in New York. He works with Jane Smith, who joined in 2020. The company produces Widget X, a hardware product."
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">HTTP Request:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`POST /api/generate-graph
Content-Type: application/json

{
  "text": "John Doe is an employee at Acme Corp...",
  "options": {
    "extractEntities": true,
    "extractRelations": true,
    "inferProperties": true,
    "mergeEntities": true,
    "generateOntology": true,
    "model": "claude",
    "useEntityMergingLLM": true,
    "useEntityTypeLLM": true,
    "useRelationInferenceLLM": true
  }
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Key Functions:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><code>Home.tsx: generateGraphMutation.mutate(&#123;text, options&#125;)</code></li>
                    <li><code>queryClient.ts: apiRequest('/api/generate-graph', &#123;method: 'POST', body&#125;)</code></li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">API Request Flow</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">1</div>
                    <span className="text-sm">User submits text and options</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400 mx-auto">
                    <path d="M12 5v14"></path>
                    <path d="m19 12-7 7-7-7"></path>
                  </svg>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">2</div>
                    <span className="text-sm"><code>generateGraphMutation.mutate()</code> called</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400 mx-auto">
                    <path d="M12 5v14"></path>
                    <path d="m19 12-7 7-7-7"></path>
                  </svg>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">3</div>
                    <span className="text-sm">API request sent to server</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400 mx-auto">
                    <path d="M12 5v14"></path>
                    <path d="m19 12-7 7-7-7"></path>
                  </svg>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">4</div>
                    <span className="text-sm">Server receives request in <code>routes.ts</code></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 2: API Processing */}
        <TabsContent value="step2" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 2: API Processing with Claude</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Server-Side Processing</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  When the API request reaches the server, the following happens:
                </p>
                
                <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Server Code Flow:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li><code>routes.ts</code>: <code>app.post('/api/generate-graph')</code> handler receives request</li>
                    <li>Text and options are extracted and validated</li>
                    <li>Check if we're in append mode (existing graph)</li>
                    <li>Call <code>generateGraphFromText(text, options, existingGraph)</code></li>
                    <li>Log the API interaction with <code>logApiInteraction()</code></li>
                    <li>Return graph data as JSON response</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Key File: server/routes.ts</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`app.post('/api/generate-graph', async (req, res) => {
  try {
    const { text, options, existingGraph } = req.body;
    const appendMode = options?.appendMode || false;
    
    // Generate graph from text
    const graphData = await generateGraphFromText(
      text, options, existingGraph, appendMode
    );
    
    // Log the API interaction for monitoring
    await logApiInteraction({
      type: 'anthropic',
      operation: 'generate_graph',
      requestData: { text, options },
      responseData: { nodeCount: graphData.nodes.length },
    });
    
    // Return the graph data
    return res.json(graphData);
  } catch (error) {
    console.error('Error generating graph:', error);
    return res.status(500).json({ 
      error: 'Failed to generate graph' 
    });
  }
});`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Calling the Claude API</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The heart of the text-to-graph process is in <code>anthropic.ts</code>, which calls the Claude API:
                </p>
                
                <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Claude API Process:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li><code>generateGraphWithClaude(text, options)</code> is called</li>
                    <li>A structured prompt is built using <code>buildPrompt(text, options)</code></li>
                    <li>The prompt includes special instructions for Claude to extract entities and relations</li>
                    <li>API call made with model <code>claude-3-opus-20240229</code></li>
                    <li>Claude generates response with JSON graph structure</li>
                    <li>JSON is parsed and transformed into a Graph object</li>
                    <li><code>processGraphData()</code> enriches the graph with additional metadata</li>
                    <li><code>applyLayout()</code> adds x,y coordinates to nodes</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Prompt Structure (Simplified):</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`You are an expert at extracting a labeled property graph from text.
Convert the following text into a graph with nodes and edges.

[INPUT TEXT]

Instructions:
1. Extract entities as nodes with types and properties
2. Extract relationships as edges between nodes
3. Identify properties for each entity
4. Return as JSON with this structure:
{
  "nodes": [
    {"id": "n1", "label": "Person", "type": "Employee", "properties": {...}}
  ],
  "edges": [
    {"id": "e1", "source": "n1", "target": "n2", "label": "WORKS_AT", "properties": {...}}
  ]
}

[CONDITIONAL: First, generate a domain ontology.]
[CONDITIONAL: Connect to the existing graph where possible.]
`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">API Response Processing:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// Parse the response to extract the JSON graph
const responseText = await response.text();
let graphData: Graph = { nodes: [], edges: [] };

try {
  // Extract JSON from Claude response
  const jsonMatch = responseText.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/);
  if (jsonMatch && jsonMatch[1]) {
    graphData = JSON.parse(jsonMatch[1]);
  }
  
  // Process graph data to add metadata
  processGraphData(graphData, text);
  
  // Apply layout to position nodes
  applyLayout(graphData);
  
  return graphData;
} catch (error) {
  console.error("Error parsing graph data:", error);
  throw new Error("Failed to parse graph from Claude response");
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          {/* Claude API Example */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Claude API Request/Response Example</h3>
            <Accordion type="single" collapsible className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <AccordionItem value="request">
                <AccordionTrigger className="text-sm font-medium">
                  Claude API Request
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-black text-white p-3 rounded overflow-auto">
{`{
  "model": "claude-3-opus-20240229",
  "max_tokens": 8000,
  "temperature": 0.2,
  "system": "You are an expert at extracting labeled property graphs from text...",
  "messages": [
    {
      "role": "user",
      "content": "Extract a graph from the following text: 'John Doe is an employee at Acme Corp based in New York. He works with Jane Smith, who joined in 2020. The company produces Widget X, a hardware product.'..."
    }
  ]
}`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="response">
                <AccordionTrigger className="text-sm font-medium">
                  Claude API Response
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-black text-white p-3 rounded overflow-auto max-h-96">
{`{
  "id": "msg_01ABCxyz",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I've analyzed the text and extracted the labeled property graph. Here's the result:\n\n\`\`\`json\n{\n  \"nodes\": [\n    {\n      \"id\": \"n1\",\n      \"label\": \"Person\",\n      \"type\": \"Employee\",\n      \"properties\": {\n        \"name\": \"John Doe\",\n        \"employment_start_date\": 2018,\n        \"work_location\": \"New York\"\n      }\n    },\n    {\n      \"id\": \"n2\",\n      \"label\": \"Person\",\n      \"type\": \"Employee\",\n      \"properties\": {\n        \"name\": \"Jane Smith\",\n        \"employment_start_date\": 2020\n      }\n    },\n    {\n      \"id\": \"n3\",\n      \"label\": \"Organization\",\n      \"type\": \"Company\",\n      \"properties\": {\n        \"name\": \"Acme Corp\"\n      }\n    },\n    {\n      \"id\": \"n4\",\n      \"label\": \"Location\",\n      \"type\": \"City\",\n      \"properties\": {\n        \"name\": \"New York\"\n      }\n    },\n    {\n      \"id\": \"n5\",\n      \"label\": \"Technology\",\n      \"type\": \"Hardware\",\n      \"properties\": {\n        \"name\": \"Widget X\",\n        \"category\": \"Product\"\n      }\n    }\n  ],\n  \"edges\": [\n    {\n      \"id\": \"e1\",\n      \"source\": \"n1\",\n      \"target\": \"n3\",\n      \"label\": \"WORKS_AT\",\n      \"properties\": {}\n    },\n    {\n      \"id\": \"e2\",\n      \"source\": \"n1\",\n      \"target\": \"n2\",\n      \"label\": \"WORKS_WITH\",\n      \"properties\": {}\n    },\n    {\n      \"id\": \"e3\",\n      \"source\": \"n3\",\n      \"target\": \"n4\",\n      \"label\": \"LOCATED_IN\",\n      \"properties\": {}\n    },\n    {\n      \"id\": \"e4\",\n      \"source\": \"n3\",\n      \"target\": \"n5\",\n      \"label\": \"PRODUCES\",\n      \"properties\": {}\n    },\n    {\n      \"id\": \"e5\",\n      \"source\": \"n2\",\n      \"target\": \"n3\",\n      \"label\": \"WORKS_AT\",\n      \"properties\": {}\n    }\n  ]\n}\n\`\`\`\n\nThis graph represents the entities and relationships described in the text:\n\n1. Two employees: John Doe and Jane Smith\n2. One organization: Acme Corp\n3. One location: New York\n4. One product: Widget X (hardware)\n\nThe relationships show who works where, the company location, and what product they produce."
    }
  ],
  "model": "claude-3-opus-20240229",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 432,
    "output_tokens": 824
  }
}`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="graph">
                <AccordionTrigger className="text-sm font-medium">
                  Processed Graph Data
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-black text-white p-3 rounded overflow-auto max-h-96">
{`{
  "nodes": [
    {
      "id": "n1",
      "label": "Person",
      "type": "Employee",
      "properties": {
        "name": "John Doe",
        "employment_start_date": 2018,
        "work_location": "New York"
      },
      "labelDetail": "Employee",
      "x": 300.42,
      "y": 200.56,
      "subgraphIds": ["sg1"]
    },
    {
      "id": "n2",
      "label": "Person",
      "type": "Employee",
      "properties": {
        "name": "Jane Smith",
        "employment_start_date": 2020
      },
      "labelDetail": "Employee",
      "x": 450.38,
      "y": 150.72,
      "subgraphIds": ["sg1"]
    },
    /* Additional nodes omitted for brevity */
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n3",
      "label": "WORKS_AT",
      "properties": {},
      "subgraphIds": ["sg1"]
    },
    /* Additional edges omitted for brevity */
  ],
  "subgraphCounter": 1,
  "metadata": {
    "sourceText": "John Doe is an employee at Acme Corp...",
    "processingTime": 3241,
    "generationDate": "2025-03-24T09:32:15.000Z"
  }
}`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          {/* Recent API Logs */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Real API Logs</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading recent API logs...</p>
              ) : (
                <div>
                  <p className="text-sm mb-2">Recent graph generation logs from your application:</p>
                  <div className="overflow-auto">
                    {Array.isArray(recentApiLogs) && recentApiLogs.length > 0 ? (
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Time</th>
                            <th className="px-2 py-1 text-left">Operation</th>
                            <th className="px-2 py-1 text-left">Request</th>
                            <th className="px-2 py-1 text-left">Response</th>
                            <th className="px-2 py-1 text-right">Processing Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentApiLogs.map((log: any) => (
                            <tr key={log.id} className="border-t border-gray-200">
                              <td className="px-2 py-1">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="px-2 py-1">{log.operation}</td>
                              <td className="px-2 py-1 max-w-[200px] truncate">
                                {log.requestData?.text ? `"${log.requestData.text.substring(0, 30)}..."` : "N/A"}
                              </td>
                              <td className="px-2 py-1">
                                {log.responseData?.nodeCount ? `${log.responseData.nodeCount} nodes` : "N/A"}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {log.processingTimeMs ? `${log.processingTimeMs}ms` : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 italic">No recent logs found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Step 3: Graph Creation */}
        <TabsContent value="step3" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 3: Graph Creation &amp; Transformation</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Data Transformation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  The raw JSON graph from Claude undergoes several transformations:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Transformation Steps:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li><strong>Extract JSON:</strong> Parse Claude's response to extract JSON</li>
                    <li><strong>Enrich Metadata:</strong> Add creation timestamp, source info</li>
                    <li><strong>Process Types:</strong> Add labelDetail field based on node type</li>
                    <li><strong>Add Subgraph IDs:</strong> Add subgraphIds to track node/edge groups</li>
                    <li><strong>Apply Layout:</strong> Add x,y coordinate positions</li>
                    <li><strong>Entity Merging:</strong> If enabled, deduplicate similar entities</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">processGraphData() Function:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`function processGraphData(graphData: Graph, text: string): void {
  // Add creation time metadata
  if (!graphData.metadata) {
    graphData.metadata = {};
  }
  
  graphData.metadata.sourceText = text;
  graphData.metadata.generationDate = new Date().toISOString();
  
  // Ensure subgraph tracking
  if (!graphData.subgraphCounter) {
    graphData.subgraphCounter = 1;
  }
  
  // Process nodes - add subgraph IDs and extract detail
  graphData.nodes.forEach((node: Node) => {
    // Add to default subgraph if new
    if (!node.subgraphIds) {
      node.subgraphIds = ["sg1"];
    }
    
    // Extract label detail from type
    if (node.type && !node.labelDetail) {
      node.labelDetail = node.type;
    }
  });
  
  // Process edges - add subgraph IDs
  graphData.edges.forEach((edge: Edge) => {
    if (!edge.subgraphIds) {
      edge.subgraphIds = ["sg1"];
    }
  });
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Layout Algorithm</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  Nodes need positions before they can be visualized:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">applyLayout() Function:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Uses a basic force-directed layout algorithm</li>
                    <li>Sets initial positions at center with random offsets</li>
                    <li>Positions are later refined by D3.js in the frontend</li>
                    <li>Basic layout ensures graph is initially viewable</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Layout Implementation:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`function applyLayout(graph: Graph): void {
  const centerX = 400;
  const centerY = 300;
  const radius = 150;
  
  // Apply initial positions in circular layout
  graph.nodes.forEach((node: Node, i: number) => {
    // Only set position if not already set
    if (node.x === undefined || node.y === undefined) {
      // First node at center, others in circle
      if (i === 0) {
        node.x = centerX;
        node.y = centerY;
      } else {
        const angle = (i / graph.nodes.length) * 2 * Math.PI;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      }
    }
  });
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Node and Edge Structure</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The core data structures that represent the graph:
                </p>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Node Structure:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`export interface Node {
  id: string;            // Unique identifier (e.g., "n1")
  label: string;         // Primary label (e.g., "Person") 
  type: string;          // Entity type (e.g., "Employee")
  labelDetail?: string;  // Detail extracted from type
  properties: Record<string, any>; // Key-value properties
  x?: number;            // X coordinate for visualization
  y?: number;            // Y coordinate for visualization
  subgraphIds?: string[]; // Groups this node belongs to
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Edge Structure:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`export interface Edge {
  id: string;            // Unique identifier (e.g., "e1")
  source: string;        // ID of source node
  target: string;        // ID of target node
  label: string;         // Relationship type (e.g., "WORKS_AT")
  properties: Record<string, any>; // Key-value properties
  subgraphIds?: string[]; // Groups this edge belongs to
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Graph Structure:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`export interface Graph {
  nodes: Node[];         // Array of nodes
  edges: Edge[];         // Array of edges
  subgraphCounter?: number; // Tracks highest subgraph ID
  metadata?: Record<string, any>; // Additional info
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Special Fields Explained:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><strong>labelDetail:</strong> Used to store the specific type information</li>
                    <li><strong>subgraphIds:</strong> Track which nodes/edges were created together</li>
                    <li><strong>properties:</strong> Stores all entity attributes as key-value pairs</li>
                    <li><strong>metadata:</strong> Stores graph-level information like source text</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Merging with Existing Graphs</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  When appending to an existing graph:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">mergeGraphs() Function:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>First identify potentially duplicate nodes</li>
                    <li>Score similarity between existing and new nodes</li>
                    <li>Merge nodes that exceed similarity threshold</li>
                    <li>Add unique new nodes to the graph</li>
                    <li>Remap edges to point to correct nodes</li>
                    <li>Increment subgraph counter</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Entity Merging Process:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`function mergeGraphs(existingGraph: any, newGraph: any): any {
  const result = { ...existingGraph };
  const newSubgraphId = \`sg\${existingGraph.subgraphCounter || 1}\`;
  
  // Map to track which new nodes map to existing nodes
  const nodeMapping = new Map();
  
  // Process each new node
  newGraph.nodes.forEach(newNode => {
    // Check for similar existing nodes
    const similarNode = findSimilarNode(result.nodes, newNode);
    
    if (similarNode) {
      // Merge properties
      similarNode.properties = {
        ...similarNode.properties,
        ...newNode.properties
      };
      
      // Add to subgraph
      if (!similarNode.subgraphIds.includes(newSubgraphId)) {
        similarNode.subgraphIds.push(newSubgraphId);
      }
      
      // Add to mapping
      nodeMapping.set(newNode.id, similarNode.id);
    } else {
      // Add as new node with the new subgraph ID
      newNode.subgraphIds = [newSubgraphId];
      result.nodes.push(newNode);
    }
  });
  
  // Process edges with remapped IDs
  newGraph.edges.forEach(newEdge => {
    const sourceId = nodeMapping.get(newEdge.source) || newEdge.source;
    const targetId = nodeMapping.get(newEdge.target) || newEdge.target;
    
    newEdge.source = sourceId;
    newEdge.target = targetId;
    newEdge.subgraphIds = [newSubgraphId];
    
    result.edges.push(newEdge);
  });
  
  // Increment subgraph counter
  result.subgraphCounter = (existingGraph.subgraphCounter || 1) + 1;
  
  return result;
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Graph Transformation Flow</h3>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h4 className="font-medium text-amber-700 mb-2">Complete Data Flow</h4>
              <div className="overflow-auto">
                <pre className="text-xs bg-black text-white p-4 rounded">
{`Input Text → Prompt Engineering → Claude API → Raw JSON → Extract Graph JSON →
  → Process Graph (metadata, node types) → Apply Layout (positions) →
  → [If append mode] Merge with existing graph → Return complete Graph object`}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">Input</h5>
                  <div className="text-xs">Text + options from user</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">Processing</h5>
                  <div className="text-xs">AI extract, format, layout, merge</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">Output</h5>
                  <div className="text-xs">Complete structured graph JSON</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 4: Visualization */}
        <TabsContent value="step4" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 4: Graph Visualization</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Client-Side Processing</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  After the server returns the graph data, the client:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Client Flow:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Receives graph data via <code>mutationFn</code> in <code>Home.tsx</code></li>
                    <li>Sets graph data via <code>setGraph(data)</code></li>
                    <li>Graph is passed to <code>GraphPanel</code> component</li>
                    <li>GraphPanel initializes <code>GraphVisualizer</code> with SVG element</li>
                    <li>GraphPanel calls <code>visualizer.render(graph)</code></li>
                    <li>GraphVisualizer renders interactive D3.js visualization</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Home.tsx onSuccess Handler:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`const generateGraphMutation = useMutation({
  mutationFn: async ({ text, options }: { text: string, options: GraphGenerationOptions }) => {
    // Fetch existing graph if append mode
    const payload = {
      text,
      options,
      existingGraph: options.appendMode ? graph : undefined
    };
    
    // Make API request
    return apiRequest('/api/generate-graph', {
      method: 'POST',
      body: payload,
    });
  },
  onSuccess: (data: Graph, variables) => {
    // Update app state with new graph data
    setGraph(data);
    setIsLoading(false);
  },
  onError: (error: Error) => {
    console.error('Error generating graph:', error);
    setIsLoading(false);
    toast({
      title: 'Error generating graph',
      description: error.message,
      variant: 'destructive',
    });
  },
});`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">GraphVisualizer Class</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  The core visualization logic is in <code>graphVisualizer.ts</code>:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Key Methods:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><code>constructor()</code>: Initialize SVG and event handlers</li>
                    <li><code>render(graph)</code>: Create visualization from graph data</li>
                    <li><code>fitToView()</code>: Scale and center the graph</li>
                    <li><code>updateDimensions()</code>: Handle resize</li>
                    <li><code>restartSimulation()</code>: Refresh force layout</li>
                    <li><code>highlightSubgraph()</code>: Show specific part of graph</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">render() Method:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`public render(graph: Graph): void {
  this.graph = graph;
  
  // Clear previous graph
  this.container.selectAll("*").remove();
  
  // Setup data for D3 simulation
  const nodeData = graph.nodes as SimulationNode[];
  const linkData = graph.edges as SimulationLink[];
  
  console.log("Processing", nodeData.length, "nodes and", linkData.length, "edges");
  
  // Create edges
  const edgeGroup = this.container.append("g").attr("class", "edges");
  const edgeElements = edgeGroup
    .selectAll(".edge")
    .data(linkData)
    .enter()
    .append("g")
    .attr("class", "edge")
    .attr("id", d => \`edge-\${d.id}\`);
  
  // Create edge lines
  const edgeLines = edgeElements
    .append("line")
    .attr("stroke", "#9CA3AF")
    .attr("stroke-width", 1.5)
    .attr("marker-end", "url(#arrowhead)");
  
  // Create edge labels
  const edgeLabels = edgeElements
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#4B5563")
    .attr("font-size", "10px")
    .attr("dy", "-5")
    .on("click", (event: MouseEvent, d: SimulationLink) => {
      this.onSelectElement(d as unknown as Edge);
      event.stopPropagation();
    })
    .text((d: SimulationLink) => d?.label || "");
  
  // Create nodes
  const nodeGroup = this.container.append("g").attr("class", "nodes");
  const nodes = nodeGroup
    .selectAll(".node")
    .data(nodeData)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", d => \`node-\${d.id}\`);
  
  // Add event handlers and visual elements to nodes...
  
  // Create force simulation with layout settings
  this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>(nodeData)
    .force("link", d3.forceLink<SimulationNode, SimulationLink>(linkData)
      .id((d: SimulationNode) => d.id)
      .distance(this.layoutSettings.linkDistance))
    .force("charge", d3.forceManyBody<SimulationNode>()
      .strength(-this.layoutSettings.nodeRepulsion)
      .distanceMax(300))
    .force("center", d3.forceCenter<SimulationNode>(width/2, height/2)
      .strength(this.layoutSettings.centerStrength))
    .force("collision", d3.forceCollide<SimulationNode>()
      .radius(this.layoutSettings.collisionRadius))
    .on("tick", () => {
      // Update positions on each simulation tick
      edgeLines
        .attr("x1", (d: SimulationLink) => {
          const sourceNode = d.source as SimulationNode;
          return sourceNode.x || 0;
        })
        // Additional position calculations...
      
      // Update node positions
      nodes
        .attr("transform", (d: SimulationNode) => 
          \`translate(\${d.x || 0},\${d.y || 0})\`);
    });
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">D3.js Force Simulation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The visualization uses D3.js force simulation for dynamic layout:
                </p>
                
                <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Force Layout Features:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><strong>Link Force:</strong> Maintains consistent distance between connected nodes</li>
                    <li><strong>Charge Force:</strong> Nodes repel each other to prevent overlap</li>
                    <li><strong>Center Force:</strong> Pulls all nodes toward center of view</li>
                    <li><strong>Collision Force:</strong> Prevents nodes from directly overlapping</li>
                    <li><strong>Tick Handler:</strong> Updates positions on each simulation step</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Force Simulation Properties:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`export interface LayoutSettings {
  nodeRepulsion: number;  // How strongly nodes push each other away
  linkDistance: number;   // Ideal distance between connected nodes
  centerStrength: number; // How strongly nodes are pulled to center
  collisionRadius: number; // Min distance between node centers
}

// Default settings
const DEFAULT_SETTINGS: LayoutSettings = {
  nodeRepulsion: 120,    // Higher = more spacing
  linkDistance: 100,     // Higher = longer edges
  centerStrength: 0.05,  // Higher = tighter clustering
  collisionRadius: 25    // Higher = more spacing
};`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Visual Elements:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><strong>Nodes:</strong> SVG circles with color based on node type</li>
                    <li><strong>Node Labels:</strong> Black text showing node name</li>
                    <li><strong>Edges:</strong> SVG lines with arrowheads</li>
                    <li><strong>Edge Labels:</strong> Text showing relationship type</li>
                    <li><strong>Web Search Indicator:</strong> 'W' badge for search results</li>
                    <li><strong>Tooltips:</strong> Show on hover with basic node info</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Node Visual Structure:</h4>
                  <div className="bg-white p-4 rounded border">
                    <svg width="100%" height="150" viewBox="0 0 200 150" className="mx-auto">
                      {/* Node circle */}
                      <circle cx="100" cy="75" r="40" fill="#3B82F6" />
                      
                      {/* Web search indicator */}
                      <circle cx="136" cy="39" r="12" fill="#2563EB" />
                      <text x="136" y="43" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">W</text>
                      
                      {/* Node label */}
                      <text x="100" y="80" textAnchor="middle" fill="black" fontWeight="bold" fontSize="14">
                        John Smith
                      </text>
                      
                      {/* Label lines */}
                      <line x1="100" y1="20" x2="100" y2="10" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="100" y="8" textAnchor="middle" fontSize="10" fill="#6B7280">Person (Employee)</text>
                      
                      {/* Properties indicator */}
                      <line x1="150" y1="75" x2="180" y2="75" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="180" y="75" textAnchor="start" fontSize="10" fill="#6B7280">Properties</text>
                      <text x="180" y="88" textAnchor="start" fontSize="8" fill="#6B7280">name: "John Smith"</text>
                      <text x="180" y="98" textAnchor="start" fontSize="8" fill="#6B7280">year: 2020</text>
                    </svg>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Interaction Features</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-md border border-green-100">
                    <h4 className="font-medium text-green-700 text-sm">User Interactions:</h4>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                      <li>Drag nodes to reposition</li>
                      <li>Click nodes to view properties</li>
                      <li>Zoom and pan the visualization</li>
                      <li>Highlight specific subgraphs</li>
                      <li>Customize node colors</li>
                      <li>Edit layout parameters</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md border border-green-100">
                    <h4 className="font-medium text-green-700 text-sm">Event Handlers:</h4>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                      <li><code>mouseover</code>: Show tooltips</li>
                      <li><code>mouseout</code>: Hide tooltips</li>
                      <li><code>click</code>: Open property panel</li>
                      <li><code>drag</code>: Move nodes and update simulation</li>
                      <li><code>zoom</code>: Scale and pan visualization</li>
                      <li><code>dblclick</code>: Pin/unpin nodes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Drag Implementation:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// Add drag behavior to nodes
nodes.call(
  d3.drag<SVGGElement, SimulationNode>()
    .on("start", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
      if (!event.active) this.simulation?.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
      if (!event.active) this.simulation?.alphaTarget(0);
      // Keep nodes fixed where they were dragged
    })
);`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Zoom Implementation:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// Initialize zoom behavior
this.zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.1, 4]) // Min/max zoom level
  .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    this.container.attr("transform", event.transform.toString());
  });

// Apply zoom behavior to SVG
this.svg.call(this.zoom);

// Custom zoom level setter
public setZoom(scale: number): void {
  const transform = d3.zoomTransform(this.svg.node()!);
  this.svg.transition().duration(300).call(
    this.zoom.transform,
    d3.zoomIdentity
      .translate(transform.x, transform.y)
      .scale(scale)
  );
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Complete Flow Summary</h3>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h4 className="font-medium text-amber-700 mb-2">End-to-End Process</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">1. User Input</h5>
                  <div className="text-xs">Text + options in InputPanel</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">2. API Request</h5>
                  <div className="text-xs">Client sends data to server</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">3. Claude Processing</h5>
                  <div className="text-xs">AI extracts graph from text</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">4. Data Transformation</h5>
                  <div className="text-xs">Format, enrich, position nodes</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">5. Visualization</h5>
                  <div className="text-xs">D3.js renders interactive graph</div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-md">
                <h4 className="font-medium text-sm mb-2">Key Files in the Process</h4>
                <div className="overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-2 py-1 text-left">Component</th>
                        <th className="px-2 py-1 text-left">File</th>
                        <th className="px-2 py-1 text-left">Responsibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">Input UI</td>
                        <td className="px-2 py-1 font-mono">client/src/components/InputPanel.tsx</td>
                        <td className="px-2 py-1">Text input, options UI</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">API Request</td>
                        <td className="px-2 py-1 font-mono">client/src/pages/Home.tsx</td>
                        <td className="px-2 py-1">Mutation function, state management</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">Request Handling</td>
                        <td className="px-2 py-1 font-mono">server/routes.ts</td>
                        <td className="px-2 py-1">API route, orchestration</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">AI Processing</td>
                        <td className="px-2 py-1 font-mono">server/anthropic.ts</td>
                        <td className="px-2 py-1">Claude API, prompt engineering</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">Graph Schema</td>
                        <td className="px-2 py-1 font-mono">shared/schema.ts</td>
                        <td className="px-2 py-1">Data structure definitions</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">Visualization</td>
                        <td className="px-2 py-1 font-mono">client/src/lib/graphVisualizer.ts</td>
                        <td className="px-2 py-1">D3.js rendering, layout</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-2 py-1">Graph Display</td>
                        <td className="px-2 py-1 font-mono">client/src/components/GraphPanel.tsx</td>
                        <td className="px-2 py-1">Visualization container, controls</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}