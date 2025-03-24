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

export default function WebSearchAnatomy() {
  // Fetch the most recent web search logs
  const { data: logsResponse, isLoading } = useRecentApiLogs("web_search", 3, true);
  const recentApiLogs = logsResponse?.data || [];
  
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Web Search Process Anatomy</h1>
      <p className="text-lg mb-8">
        This page explains the detailed process of how web search works in the graph visualization system,
        from query generation to graph integration.
      </p>
      
      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="step1">Query Generation</TabsTrigger>
          <TabsTrigger value="step2">Web Search</TabsTrigger>
          <TabsTrigger value="step3">Result Processing</TabsTrigger>
          <TabsTrigger value="step4">Graph Integration</TabsTrigger>
        </TabsList>
        
        {/* Overview of the entire process */}
        <TabsContent value="overview" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">The Web Search Process</h2>
          
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-700">1. Select Node</h3>
                <p className="text-sm mt-1">User selects a node to expand</p>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-700">2. Generate Query</h3>
                <p className="text-sm mt-1">Smart query is generated based on node</p>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <h3 className="font-medium text-purple-700">3. Search & Process</h3>
                <p className="text-sm mt-1">Web search is performed and results processed</p>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="font-medium text-green-700">4. Integrate Results</h3>
                <p className="text-sm mt-1">Results are added to the graph with connections</p>
              </div>
            </div>
            
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Process Flow Diagram</h3>
              <div className="overflow-auto">
                <pre className="text-xs bg-black text-white p-4 rounded">
{`Select Node → PropertyPanel → SidebarPromptStation → Generate or refine query →
  → Client API Request → Server/routes.ts → webSearchAndExpandGraph() → 
  → performWebSearch() → Claude AI (search context) → Search results → 
  → Claude AI (graph extraction) → New subgraph → Connect to existing graph →
  → Add metadata & markers → Server response → Client visualizes results`}
                </pre>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h3 className="font-medium text-amber-700 mb-2">Key Components Involved</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><span className="font-medium">client/src/components/PropertyPanel.tsx</span> - Contains the globe icon button to trigger search</li>
                <li><span className="font-medium">client/src/components/SidebarPromptStation.tsx</span> - For entering custom search queries</li>
                <li><span className="font-medium">client/src/lib/webSearchUtils.ts</span> - Contains query generation logic</li>
                <li><span className="font-medium">server/routes.ts</span> - Handles the web search API endpoint</li>
                <li><span className="font-medium">server/anthropic.ts</span> - Contains performWebSearch() function and Claude interactions</li>
                <li><span className="font-medium">client/src/lib/graphVisualizer.ts</span> - Handles special styling for web search results</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 1: Query Generation */}
        <TabsContent value="step1" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 1: Query Generation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Initiating a Web Search</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  Web searches can be initiated in two ways:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Clicking the globe/world icon in the property panel for a selected node</li>
                  <li>Using the SidebarPromptStation to manually enter a search query</li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Code Flow: PropertyPanel</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// PropertyPanel.tsx 
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    if (onWebSearch && element && isNode(element)) {
      // Generate search query from node content
      const query = generateWebSearchQuery(
        graph || { nodes: [], edges: [] }, 
        element.id
      );
      onWebSearch(element.id, query);
    }
  }}
  className="h-8 w-8 rounded-full"
  title="Search web for more information"
>
  <Globe className="h-4 w-4" />
</Button>`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Code Flow: SidebarPromptStation</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// SidebarPromptStation.tsx
<Button 
  onClick={() => {
    if (selectedNodeId && searchPrompt) {
      onWebSearch(selectedNodeId, searchPrompt);
      // Add to search history
      setSearchHistory([
        { nodeId: selectedNodeId, query: searchPrompt, timestamp: new Date() },
        ...searchHistory
      ]);
      setSearchPrompt("");
    }
  }}
  disabled={isSearching || !selectedNodeId || !searchPrompt}
>
  Search
</Button>`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Smart Query Generation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  When a user initiates a search, a contextual query is automatically generated:
                </p>
                
                <div className="mt-2 p-3 bg-amber-50 rounded-md border border-amber-100">
                  <h4 className="font-medium text-amber-700 text-sm">Query Generation Logic:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Retrieve all node information (type, properties, etc.)</li>
                    <li>Retrieve all connected nodes and their relationships</li>
                    <li>Analyze node type to customize query approach</li>
                    <li>Format a natural language query based on node context</li>
                    <li>Focus query on most important/missing information</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Example Node:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`{
  "id": "n3",
  "label": "Organization",
  "type": "Company",
  "properties": {
    "name": "Acme Corp"
  },
  "labelDetail": "Company"
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Generated Query:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`"What are the main products, industry sectors, key executives, and notable achievements of Acme Corp? Include founding year and headquarters location."`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Query Generation Implementation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The generateWebSearchQuery function in webSearchUtils.ts:
                </p>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Implementation:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// webSearchUtils.ts
/**
 * Generate a search query based on a node and its connections
 */
export function generateWebSearchQuery(graph: Graph, nodeId: string): string {
  // Find the node
  const node = graph.nodes.find(n => n.id === nodeId);
  if (!node) return "";
  
  // Get all connections
  const connections = getNodeConnections(graph, nodeId);
  
  // Base query parts
  let query = "";
  const nodeName = node.properties.name || 
                   node.properties.title || 
                   node.label;
  
  // Different query strategies based on node type
  switch (node.type?.toLowerCase()) {
    case "person":
      query = \`Who is \${nodeName}? Include background, career, achievements\`;
      break;
    case "company":
    case "organization":
      query = \`What is \${nodeName}? Include history, products, leadership\`;
      break;
    case "location":
    case "place":
      query = \`Tell me about \${nodeName} location. Include key facts, history\`;
      break;
    case "technology":
    case "product":
      query = \`What is \${nodeName}? Include features, history, applications\`;
      break;
    case "event":
      query = \`What happened at \${nodeName}? Include date, significance, people involved\`;
      break;
    default:
      query = \`What is \${nodeName}? Include key facts and details\`;
  }
  
  // Add context from connections if available
  if (connections.relatedNodes.length > 0) {
    const relatedNames = connections.relatedNodes
      .map(n => n.properties.name || n.label)
      .slice(0, 3)
      .join(", ");
    
    if (relatedNames) {
      query += \` particularly in relation to \${relatedNames}\`;
    }
  }
  
  return query;
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Key Aspects:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li>Queries are tailored to the semantic type of the node</li>
                    <li>Includes related entities to provide search context</li>
                    <li>Different templates used for different entity types</li>
                    <li>Formatted as natural language for better search results</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">API Request Formation</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  When the search is triggered, an API request is sent:
                </p>
                
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">client/src/pages/Home.tsx:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// Mutation for web search
const webSearchMutation = useMutation({
  mutationFn: async ({ nodeId, query }: WebSearchOptions) => {
    // API request to web search endpoint
    return apiRequest('/api/web-search', {
      method: 'POST',
      body: {
        nodeId,
        query,
        existingGraph: graph // Send current graph for context
      },
    });
  },
  onSuccess: (data: Graph) => {
    // Update graph with new search results
    setGraph(data);
    setIsSearching(false);
  },
  onError: (error: Error) => {
    console.error('Error in web search:', error);
    setIsSearching(false);
    toast({
      title: 'Web search failed',
      description: error.message,
      variant: 'destructive',
    });
  },
});

// Handler function
const handleWebSearch = (nodeId: string, query: string) => {
  setIsSearching(true);
  webSearchMutation.mutate({ nodeId, query });
};`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">HTTP Request Body:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`POST /api/web-search
Content-Type: application/json

{
  "nodeId": "n3",
  "query": "What is Acme Corp? Include history, products, leadership",
  "existingGraph": {
    "nodes": [...],
    "edges": [...]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 2: Web Search */}
        <TabsContent value="step2" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 2: Web Search Process</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Server-Side Request Handling</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  When the web search request reaches the server:
                </p>
                
                <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Server Code Flow:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li><code>routes.ts</code>: <code>app.post('/api/web-search')</code> handler receives request</li>
                    <li>Extract nodeId, query, and existing graph</li>
                    <li>Call <code>webSearchAndExpandGraph(query, nodeId, existingGraph)</code></li>
                    <li>Log the API interaction with <code>logApiInteraction()</code></li>
                    <li>Return updated graph data as JSON response</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">routes.ts Route Handler:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// Handle web search requests
app.post('/api/web-search', async (req, res) => {
  try {
    const { query, nodeId, existingGraph } = req.body;
    
    if (!query || !nodeId || !existingGraph) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }
    
    console.log(\`Web search for node \${nodeId}: "\${query}"\`);
    
    // Use web search function to expand graph
    const expandedGraph = await webSearchAndExpandGraph(
      query, nodeId, existingGraph
    );
    
    // Log API interaction
    await logApiInteraction({
      type: 'anthropic',
      operation: 'web_search',
      requestData: { query, nodeId },
      responseData: { 
        newNodeCount: expandedGraph.nodes.length - existingGraph.nodes.length 
      },
    });
    
    return res.json(expandedGraph);
  } catch (error) {
    console.error('Error during web search:', error);
    return res.status(500).json({ 
      error: 'Failed to perform web search' 
    });
  }
});`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Search Context Building</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  Before performing the search, a context is built for the AI:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Context Contains:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li>Full details of the source node (triggering node)</li>
                    <li>All its direct connections and relationships</li>
                    <li>Most important/central nodes in the existing graph</li>
                    <li>The domain and focus of the graph based on node types</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">buildGraphContextForSearch() Function:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`/**
 * Build a relevant context object to provide to Claude for the web search
 */
function buildGraphContextForSearch(graph, nodeId) {
  const node = graph.nodes.find(n => n.id === nodeId);
  if (!node) return {};
  
  // Find direct connections
  const connections = [];
  graph.edges.forEach(edge => {
    if (edge.source === nodeId) {
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      if (targetNode) {
        connections.push({
          direction: 'outgoing',
          relationship: edge.label,
          node: {
            id: targetNode.id,
            type: targetNode.type,
            properties: targetNode.properties
          }
        });
      }
    } else if (edge.target === nodeId) {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        connections.push({
          direction: 'incoming',
          relationship: edge.label,
          node: {
            id: sourceNode.id,
            type: sourceNode.type,
            properties: sourceNode.properties
          }
        });
      }
    }
  });
  
  // Find important nodes in the graph
  const importantNodes = findImportantNodes(graph);
  
  return {
    sourceNode: {
      id: node.id,
      type: node.type,
      properties: node.properties
    },
    connections,
    importantNodes,
    graphSummary: {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      nodeTypes: [...new Set(graph.nodes.map(n => n.type))]
    }
  };
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Web Search with Claude AI</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm">
                  The actual search is performed using Claude's knowledge in <code>anthropic.ts</code>:
                </p>
                
                <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">performWebSearch() Function:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Construct a search-specific prompt with Claude</li>
                    <li>Provide the graph context to help focus the search</li>
                    <li>Ask Claude to perform a simulated web search based on its knowledge</li>
                    <li>Request information in a structured format for graph extraction</li>
                    <li>Receive comprehensive search results as text</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">anthropic.ts Implementation:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`export async function performWebSearch(query: string, graphContext?: any): Promise<string> {
  console.log("Using Claude API for web search");
  
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
    
    // Build the prompt for the web search
    let prompt = \`You are an advanced AI that can perform high-quality web searches to find information.
    
Search request: "\${query}"

Please conduct a thorough search and provide comprehensive results with factual, accurate information.
Include relevant dates, figures, and statistics when appropriate.
Organize your response in a structured way that will be easy to convert into a graph later.
\`;

    // Add graph context if available
    if (graphContext) {
      prompt += \`
The search is being performed in the context of a knowledge graph with the following information:

Source node: \${JSON.stringify(graphContext.sourceNode, null, 2)}

Connected nodes:
\${JSON.stringify(graphContext.connections, null, 2)}

Important related entities:
\${JSON.stringify(graphContext.importantNodes, null, 2)}

Please ensure your search results will be relevant to expanding this knowledge graph.
\`;
    }
    
    // Make API call to Claude
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 8000,
      temperature: 0.2,
      system: "You are an advanced AI with web search capabilities. Provide comprehensive, factual information in response to search queries.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Extract and return the search results text
    return response.content[0].text;
  } catch (error) {
    console.error("Error in web search:", error);
    throw new Error("Failed to perform web search");
  }
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Example Search Response:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto max-h-64">
{`# Web Search Results: Acme Corporation

## Company Overview
- **Full Name**: Acme Corporation
- **Founded**: 1947 in Arizona
- **Headquarters**: Phoenix, Arizona, United States
- **Industry**: Consumer goods, technology products
- **Type**: Public company (NASDAQ: ACME)
- **Revenue**: $4.2 billion (2024)
- **Employees**: Approximately 12,500 worldwide

## Leadership
- **CEO**: Jane Martinez (since 2021)
- **Founder**: William Johnson
- **Chairman**: Robert Chen
- **CTO**: Sarah Williams
- **CFO**: Michael Thompson

## Major Products
1. **Acme Rocket Line** - The company's flagship product line of model rockets and accessories
2. **Acme Anvils** - Premium steel anvils in various weights
3. **Acme Digital Solutions** - Enterprise software for manufacturing companies
4. **Acme Smart Home** - Connected home devices including security systems
5. **Acme Robotics** - Industrial and consumer robotics

## Significant Developments
- 1947: Founded as a small tool manufacturer
- 1962: Expanded into consumer products
- 1985: Went public on NASDAQ
- 2001: Launched digital division
- 2015: Acquired TechRobotics for $750 million
- 2020: Launched sustainable product initiative
- 2023: Opened new headquarters campus in Phoenix

## Competition
- Major competitors include Globex Corporation, Initech, and Massive Dynamic

## Financial Performance
- Strong growth in the robotics and digital solutions divisions (28% YoY)
- Consumer products division showing steady performance (7% YoY)
- Recent $1.2 billion investment in R&D facilities

## Corporate Responsibility
- Carbon neutral operations since 2022
- "Acme Green" initiative funds renewable energy projects
- Diversity program increased leadership diversity by 35% since 2019`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Processing */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">From Search Results to Graph Data</h3>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <p className="text-sm mb-3">
                After getting the search results, they need to be transformed into a graph structure. This happens in <code>webSearchAndExpandGraph()</code>:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md shadow">
                  <h4 className="font-medium text-sm mb-2">Process Flow:</h4>
                  <ol className="list-decimal list-inside text-xs space-y-1">
                    <li>Perform the web search using <code>performWebSearch(query, context)</code></li>
                    <li>Ask Claude to convert the search results into a graph structure</li>
                    <li>Include the source node ID to track the origin</li>
                    <li>Parse the returned JSON graph data</li>
                    <li>Add metadata to track the search origin and time</li>
                  </ol>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow">
                  <h4 className="font-medium text-sm mb-2">Metadata Added:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>source:</strong> "web search result"</li>
                    <li><strong>search_query:</strong> The original query text</li>
                    <li><strong>source_node_id:</strong> ID of the node that initiated search</li>
                    <li><strong>search_timestamp:</strong> When the search was performed</li>
                    <li><strong>confidence_score:</strong> Reliability rating (0.0-1.0)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <h4 className="font-medium text-sm">Search Processing Code:</h4>
                <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto max-h-64">
{`async function webSearchAndExpandGraph(query: string, nodeId: string, existingGraph: any) {
  // Build context from existing graph
  const graphContext = buildGraphContextForSearch(existingGraph, nodeId);
  
  // Perform web search
  console.log("Performing web search with query:", query);
  const searchResults = await performWebSearch(query, graphContext);
  
  // Extract graph data from search results using Claude
  const prompt = \`
You are an expert graph builder. Convert these search results into a graph structure.

SEARCH RESULTS:
\${searchResults}

INSTRUCTIONS:
1. Extract key entities (people, organizations, products, locations, concepts, etc.)
2. Create relationships between entities
3. Include properties for each entity based on the search results
4. Return in the following JSON format:
{
  "nodes": [
    {"id": "ws1", "label": "Person", "type": "Executive", "properties": {...}}
  ],
  "edges": [
    {"id": "e1", "source": "ws1", "target": "ws2", "label": "WORKS_AT", "properties": {...}}
  ]
}

Important: Use "ws" prefix for node IDs to indicate they came from web search.
This search was initiated from node ID "\${nodeId}". Remember to connect search results to this node.
\`;

  // Process with Claude
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });
  
  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 8000,
    temperature: 0.2,
    system: "You are an expert at extracting labeled property graphs from text.",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });
  
  // Extract graph data from response
  const responseText = response.content[0].text;
  let webSearchGraph;
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/);
    if (jsonMatch && jsonMatch[1]) {
      webSearchGraph = JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to find JSON anywhere in the response
      const jsonPattern = /\{\\s*"nodes"\\s*:\\s*\\[.*?\\]\\s*,\\s*"edges"\\s*:\\s*\\[.*?\\]\\s*\}/s;
      const match = responseText.match(jsonPattern);
      if (match) {
        webSearchGraph = JSON.parse(match[0]);
      } else {
        throw new Error("Could not find valid graph JSON in Claude response");
      }
    }
    
    // Add metadata to all nodes from web search
    if (webSearchGraph && webSearchGraph.nodes) {
      webSearchGraph.nodes.forEach(node => {
        // Add metadata to indicate this came from web search
        if (!node.properties) node.properties = {};
        node.properties.source = "web search result";
        node.properties.search_query = query;
        node.properties.source_node_id = nodeId;
        node.properties.search_timestamp = new Date().toISOString();
      });
    }
    
    // Merge with existing graph
    const mergedGraph = mergeGraphs(existingGraph, webSearchGraph);
    return mergedGraph;
  } catch (error) {
    console.error("API error for generate_graph:", error);
    throw new Error("Failed to process web search results");
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 3: Result Processing */}
        <TabsContent value="step3" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 3: Processing Search Results</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Generating a Graph from Search Results</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  The search results text is processed into a graph structure:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">Claude is prompted to:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Extract key entities from the search results</li>
                    <li>Identify relationships between entities</li>
                    <li>Structure properties for each entity and relationship</li>
                    <li>Output a complete JSON graph structure</li>
                    <li>Use "ws" prefix for node IDs to indicate web search origin</li>
                    <li>Include a connection to the source node</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Example Graph Output from Search Results:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto max-h-80">
{`{
  "nodes": [
    {
      "id": "ws1",
      "label": "Organization",
      "type": "Company",
      "properties": {
        "name": "Acme Corporation",
        "founded": 1947,
        "headquarters": "Phoenix, Arizona",
        "industry": "Consumer goods, technology products",
        "type": "Public company",
        "stockSymbol": "NASDAQ: ACME",
        "revenue": "$4.2 billion (2024)",
        "employees": 12500,
        "source": "web search result",
        "search_query": "What is Acme Corp? Include history, products, leadership",
        "source_node_id": "n3",
        "search_timestamp": "2025-03-24T09:42:15.000Z",
        "confidence_score": 0.95
      }
    },
    {
      "id": "ws2",
      "label": "Person",
      "type": "Executive",
      "properties": {
        "name": "Jane Martinez",
        "position": "CEO",
        "tenure": "since 2021",
        "source": "web search result",
        "search_query": "What is Acme Corp? Include history, products, leadership",
        "source_node_id": "n3",
        "search_timestamp": "2025-03-24T09:42:15.000Z",
        "confidence_score": 0.92
      }
    },
    {
      "id": "ws3",
      "label": "Person",
      "type": "Founder",
      "properties": {
        "name": "William Johnson",
        "source": "web search result",
        "search_query": "What is Acme Corp? Include history, products, leadership",
        "source_node_id": "n3",
        "search_timestamp": "2025-03-24T09:42:15.000Z",
        "confidence_score": 0.90
      }
    },
    {
      "id": "ws4",
      "label": "Product",
      "type": "ProductLine",
      "properties": {
        "name": "Acme Rocket Line",
        "description": "Flagship product line of model rockets and accessories",
        "source": "web search result",
        "search_query": "What is Acme Corp? Include history, products, leadership",
        "source_node_id": "n3",
        "search_timestamp": "2025-03-24T09:42:15.000Z",
        "confidence_score": 0.88
      }
    },
    {
      "id": "ws5",
      "label": "Event",
      "type": "Milestone",
      "properties": {
        "name": "Founded",
        "date": "1947",
        "description": "Founded as a small tool manufacturer",
        "source": "web search result",
        "search_query": "What is Acme Corp? Include history, products, leadership",
        "source_node_id": "n3",
        "search_timestamp": "2025-03-24T09:42:15.000Z",
        "confidence_score": 0.93
      }
    }
  ],
  "edges": [
    {
      "id": "wse1",
      "source": "ws2",
      "target": "ws1",
      "label": "LEADS",
      "properties": {
        "role": "CEO",
        "since": 2021,
        "confidence_score": 0.92
      }
    },
    {
      "id": "wse2",
      "source": "ws3",
      "target": "ws1",
      "label": "FOUNDED",
      "properties": {
        "year": 1947,
        "confidence_score": 0.90
      }
    },
    {
      "id": "wse3",
      "source": "ws1",
      "target": "ws4",
      "label": "PRODUCES",
      "properties": {
        "flagship": true,
        "confidence_score": 0.88
      }
    },
    {
      "id": "wse4",
      "source": "ws1",
      "target": "ws5",
      "label": "EXPERIENCED",
      "properties": {
        "significance": "Company founding",
        "confidence_score": 0.93
      }
    },
    {
      "id": "wse5",
      "source": "n3",
      "target": "ws1",
      "label": "EXPANDED_TO",
      "properties": {
        "via": "web search",
        "query": "What is Acme Corp?",
        "confidence_score": 0.95
      }
    }
  ]
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Node and Edge Metadata</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  Special metadata is added to track web search results:
                </p>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Metadata Fields:</h4>
                  <table className="mt-1 min-w-full text-xs">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Field</th>
                        <th className="px-2 py-1 text-left">Description</th>
                        <th className="px-2 py-1 text-left">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1 font-mono">source</td>
                        <td className="px-2 py-1">Origin of the node data</td>
                        <td className="px-2 py-1 font-mono">"web search result"</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1 font-mono">search_query</td>
                        <td className="px-2 py-1">Original query text</td>
                        <td className="px-2 py-1 font-mono">"What is Acme Corp?"</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1 font-mono">source_node_id</td>
                        <td className="px-2 py-1">Node ID that initiated search</td>
                        <td className="px-2 py-1 font-mono">"n3"</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1 font-mono">search_timestamp</td>
                        <td className="px-2 py-1">When search was performed</td>
                        <td className="px-2 py-1 font-mono">"2025-03-24T09:42:15.000Z"</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1 font-mono">confidence_score</td>
                        <td className="px-2 py-1">Reliability rating (0.0-1.0)</td>
                        <td className="px-2 py-1 font-mono">0.92</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Benefits of Metadata:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li>Track provenance of information (where it came from)</li>
                    <li>Enable filtering of nodes by source</li>
                    <li>Allow confidence-based rendering decisions</li>
                    <li>Provide context for user evaluating reliability</li>
                    <li>Maintain historical record of search expansions</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Merging with Existing Graph</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  Once the search results are processed into a graph, they are merged with the existing graph:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">mergeGraphs() Function:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Create a new subgraph ID for this web search</li>
                    <li>Try to identify duplicates between new and existing nodes</li>
                    <li>For each new node, determine if it needs merging</li>
                    <li>Add new nodes with the web search subgraph ID</li>
                    <li>Add edges with remapped node IDs if needed</li>
                    <li>Ensure direct connection to source node</li>
                    <li>Update subgraph counter</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Entity Merging Process:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`function mergeGraphs(existingGraph, newGraph) {
  // Create new result graph starting with existing graph
  const result = { ...existingGraph };
  
  // Create a unique ID for this subgraph (for web search)
  const newSubgraphId = \`webSearch_\${result.subgraphCounter || 1}\`;
  
  // Create map to track node ID mappings
  const nodeMapping = new Map();
  
  // Process each new node
  newGraph.nodes.forEach(newNode => {
    // Find potential match in existing graph
    const mergeInfo = findPotentialMerge(result.nodes, newNode);
    
    if (mergeInfo && mergeInfo.strength >= 0.85) {
      // High confidence match - merge nodes
      const existingNode = result.nodes.find(n => n.id === mergeInfo.existingNodeId);
      
      // Merge properties (existing takes precedence for conflicts)
      existingNode.properties = {
        ...newNode.properties,
        ...existingNode.properties
      };
      
      // Add to subgraph
      if (!existingNode.subgraphIds) {
        existingNode.subgraphIds = [];
      }
      if (!existingNode.subgraphIds.includes(newSubgraphId)) {
        existingNode.subgraphIds.push(newSubgraphId);
      }
      
      // Track mapping for edge remapping
      nodeMapping.set(newNode.id, existingNode.id);
    } else {
      // No good match - add as new node
      newNode.subgraphIds = [newSubgraphId];
      result.nodes.push(newNode);
    }
  });
  
  // Process new edges with remapped IDs
  newGraph.edges.forEach(newEdge => {
    // Remap source/target if needed
    const sourceId = nodeMapping.get(newEdge.source) || newEdge.source;
    const targetId = nodeMapping.get(newEdge.target) || newEdge.target;
    
    newEdge.source = sourceId;
    newEdge.target = targetId;
    newEdge.subgraphIds = [newSubgraphId];
    
    // Add confidence score if not present
    if (!newEdge.properties.confidence_score) {
      newEdge.properties.confidence_score = 0.7;
    }
    
    result.edges.push(newEdge);
  });
  
  // If this was triggered by a specific node, ensure connection exists
  const sourceNodeId = newGraph.nodes[0]?.properties?.source_node_id;
  if (sourceNodeId) {
    // Check if we need to add a direct connection to the source node
    const directConnectionExists = result.edges.some(edge => 
      (edge.source === sourceNodeId && nodeMapping.has(edge.target)) ||
      (edge.target === sourceNodeId && nodeMapping.has(edge.source))
    );
    
    if (!directConnectionExists) {
      // Add a connection to the first web search node
      const firstNewNodeId = newGraph.nodes[0]?.id;
      if (firstNewNodeId) {
        const connectionEdge = {
          id: \`wse_connection_\${result.edges.length + 1}\`,
          source: sourceNodeId,
          target: nodeMapping.get(firstNewNodeId) || firstNewNodeId,
          label: "EXPANDED_TO",
          properties: {
            via: "web search",
            confidence_score: 0.85
          },
          subgraphIds: [newSubgraphId]
        };
        result.edges.push(connectionEdge);
      }
    }
  }
  
  // Update subgraph counter
  result.subgraphCounter = (result.subgraphCounter || 1) + 1;
  
  return result;
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Entity Matching Algorithm</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  A critical part of the merge process is determining when to merge vs. add new nodes:
                </p>
                
                <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <h4 className="font-medium text-purple-700 text-sm">findPotentialMerge() Function:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`/**
 * Find potential matches for merging a new node with existing ones
 * Returns null if no good matches, or object with match details
 */
function findPotentialMerge(existingNodes, newNode) {
  // Start with no match
  let bestMatch = null;
  let highestScore = 0;
  
  // Check each existing node
  existingNodes.forEach(existingNode => {
    // Skip if different types
    if (existingNode.type !== newNode.type) return;
    
    // Calculate match score
    let score = 0;
    
    // Name match is strongest signal
    if (existingNode.properties.name && 
        newNode.properties.name &&
        existingNode.properties.name.toLowerCase() === 
        newNode.properties.name.toLowerCase()) {
      score += 0.7; // Strong boost for exact name match
    } else if (existingNode.properties.name && 
               newNode.properties.name) {
      // Check for partial name match
      const existingName = existingNode.properties.name.toLowerCase();
      const newName = newNode.properties.name.toLowerCase();
      
      if (existingName.includes(newName) || 
          newName.includes(existingName)) {
        score += 0.4; // Partial match
      }
    }
    
    // Check other key properties
    const commonProps = Object.keys(existingNode.properties)
      .filter(key => newNode.properties[key] !== undefined);
    
    commonProps.forEach(prop => {
      if (prop === 'name') return; // Already counted
      
      if (existingNode.properties[prop] === newNode.properties[prop]) {
        score += 0.1; // Small boost for each matching property
      }
    });
    
    // Track best match
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        existingNodeId: existingNode.id,
        newNodeId: newNode.id,
        strength: score
      };
    }
  });
  
  return bestMatch;
}`}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Matching Criteria:</h4>
                  <table className="mt-1 min-w-full text-xs">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Match Type</th>
                        <th className="px-2 py-1 text-left">Score Impact</th>
                        <th className="px-2 py-1 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1">Exact name match</td>
                        <td className="px-2 py-1">+0.7</td>
                        <td className="px-2 py-1">Same name property value (case-insensitive)</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1">Partial name match</td>
                        <td className="px-2 py-1">+0.4</td>
                        <td className="px-2 py-1">One name contains the other</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1">Other property match</td>
                        <td className="px-2 py-1">+0.1 each</td>
                        <td className="px-2 py-1">Each matching property adds to score</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1">Different types</td>
                        <td className="px-2 py-1">Auto-reject</td>
                        <td className="px-2 py-1">Different node types never merge</td>
                      </tr>
                      <tr className="border-t border-blue-100">
                        <td className="px-2 py-1">Merge threshold</td>
                        <td className="px-2 py-1">0.85+</td>
                        <td className="px-2 py-1">Score required to merge vs. add new</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Processing Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Processing Challenges and Solutions</h3>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md shadow">
                  <h4 className="font-medium text-amber-700 text-sm mb-2">Key Challenges:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>JSON Extraction:</strong> Claude sometimes includes explanatory text around JSON</li>
                    <li><strong>Entity Duplication:</strong> Same entities might have slight name variations</li>
                    <li><strong>Confidence Assessment:</strong> Hard to determine accuracy of web search results</li>
                    <li><strong>Connection Logic:</strong> Deciding how to connect new nodes to existing ones</li>
                    <li><strong>Property Conflicts:</strong> Handling different property values for same entity</li>
                  </ul>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow">
                  <h4 className="font-medium text-green-700 text-sm mb-2">Solutions Implemented:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>Robust Parsing:</strong> Multiple regex patterns to extract JSON</li>
                    <li><strong>Entity Matching:</strong> Scoring system with partial name matching</li>
                    <li><strong>Metadata Tracking:</strong> Source and confidence scores on all web search data</li>
                    <li><strong>Visual Differentiation:</strong> Special styling for web search results</li>
                    <li><strong>Subgraph IDs:</strong> Group all related search results for filtering</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <h4 className="font-medium text-sm mb-2">Typical Processing Flow:</h4>
                <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
{`Query → Web Search → Text Results → Graph Extraction →
  → Entity Resolution → Graph Merging → Layout Update → Response`}
                </pre>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-blue-50 rounded">
                    <strong>Input:</strong> Text query about a node
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <strong>Processing:</strong> AI-powered search and graph extraction
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <strong>Output:</strong> New connected subgraph with metadata
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Step 4: Graph Integration */}
        <TabsContent value="step4" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-bold mb-4">Step 4: Visualization and Graph Integration</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Client-Side Processing</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  When the expanded graph is returned to the client:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Client Processing Steps:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Receive updated graph with web search results merged in</li>
                    <li>Update state with <code>setGraph(data)</code></li>
                    <li>Set <code>isSearching(false)</code> to update UI state</li>
                    <li>GraphPanel passes updated graph to GraphVisualizer</li>
                    <li>GraphVisualizer applies special styling to web search nodes</li>
                    <li>Force layout updates to incorporate new nodes</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Home.tsx Web Search Handler:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// In Home.tsx
const webSearchMutation = useMutation({
  mutationFn: async ({ nodeId, query }: WebSearchOptions) => {
    // Make API request
    return apiRequest('/api/web-search', {
      method: 'POST',
      body: {
        nodeId,
        query,
        existingGraph: graph
      },
    });
  },
  onSuccess: (data: Graph) => {
    // Update graph with search results
    setGraph(data);
    setIsSearching(false);
    
    // Show success message
    toast({
      title: 'Web search completed',
      description: \`Added \${
        data.nodes.length - (graph?.nodes.length || 0)
      } new nodes from web search\`,
    });
  },
  onError: (error: Error) => {
    console.error('Error in web search:', error);
    setIsSearching(false);
    toast({
      title: 'Web search failed',
      description: error.message,
      variant: 'destructive',
    });
  },
});`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Web Search Visual Indicators</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  GraphVisualizer applies special styling to web search results:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Visual Indicators:</h4>
                  <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                    <li><strong>Web search badge:</strong> "W" indicator in blue circle</li>
                    <li><strong>Dashed border:</strong> Around nodes from web search</li>
                    <li><strong>Subgraph highlighting:</strong> All web search results can be highlighted together</li>
                    <li><strong>Connection emphasis:</strong> Source node has special highlighting</li>
                    <li><strong>Tooltips:</strong> Show search query and confidence information</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Visual Styling Code:</h4>
                  <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
{`// In graphVisualizer.ts render() method
// Create circles for nodes
nodes.append("circle")
  .attr("r", 20)
  .attr("fill", (d: SimulationNode) => this.getNodeColor(d.type))
  .attr("stroke", (d: SimulationNode) => {
    // Special styling for web search results
    return d.properties.source === "web search result" ? "#3B82F6" : null;
  })
  .attr("stroke-width", (d: SimulationNode) => {
    return d.properties.source === "web search result" ? 2 : 0;
  })
  .attr("stroke-dasharray", (d: SimulationNode) => {
    // Dashed border for web search results
    return d.properties.source === "web search result" ? "3,3" : null;
  });

// Add "W" indicator for web search results
nodes.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "-1.5em")
  .attr("dx", "1.5em")
  .attr("font-size", "10px")
  .attr("font-weight", "bold")
  .attr("fill", "white")
  .attr("stroke", "#2563EB")
  .attr("stroke-width", 12)
  .attr("stroke-linejoin", "round")
  .attr("paint-order", "stroke")
  .style("display", (d: SimulationNode) => 
    d.properties.source === "web search result" ? "block" : "none"
  )
  .text((d: SimulationNode) => "W");`}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Web Search Node Visual Appearance:</h4>
                  <div className="bg-white p-4 rounded border">
                    <svg width="100%" height="120" viewBox="0 0 200 120" className="mx-auto">
                      {/* Node circle */}
                      <circle cx="100" cy="60" r="30" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
                      
                      {/* W Badge */}
                      <circle cx="130" cy="30" r="12" fill="#2563EB" />
                      <text x="130" y="34" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">W</text>
                      
                      {/* Node label */}
                      <text x="100" y="65" textAnchor="middle" fill="black" fontWeight="bold" fontSize="14">
                        Acme Corp
                      </text>
                      
                      {/* Tooltip */}
                      <rect x="10" y="20" width="80" height="80" fill="white" stroke="#E5E7EB" rx="4" />
                      <text x="15" y="35" fontSize="10" fill="#111827" fontWeight="bold">Acme Corp</text>
                      <text x="15" y="50" fontSize="8" fill="#4B5563">Web search result</text>
                      <text x="15" y="65" fontSize="8" fill="#4B5563">Confidence: 95%</text>
                      <text x="15" y="80" fontSize="8" fill="#4B5563">Source: Node #n3</text>
                      <text x="15" y="95" fontSize="8" fill="#4B5563">2025-03-24</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Subgraph Highlighting</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  One of the most important features is the ability to highlight specific subgraphs:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Subgraph Functionality:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>Each web search creates a new subgraph ID (<code>webSearch_N</code>)</li>
                    <li>All nodes and edges from that search are tagged with that ID</li>
                    <li>GraphVisualizer can highlight a specific subgraph</li>
                    <li>This dims all other nodes/edges and highlights the subgraph</li>
                    <li>Provides visual focus on just the search results</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">highlightSubgraph() Method:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`/**
 * Highlight a specific subgraph by ID, fading other elements
 * @param subgraphId The ID of the subgraph to highlight, or null to clear
 */
public highlightSubgraph(subgraphId: string | null): void {
  this.activeSubgraphId = subgraphId;
  
  if (!this.graph) return;
  
  // If no subgraph is selected, reset all elements
  if (!subgraphId) {
    this.container.selectAll(".node circle")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke-width", (d: any) => {
        return d.properties.source === "web search result" ? 2 : 0;
      });
      
    this.container.selectAll(".edge line")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke-width", 1.5);
      
    this.container.selectAll(".edge text, .node text")
      .transition().duration(300)
      .attr("opacity", 1.0);
      
    return;
  }
  
  // Check if this is a web search subgraph
  const isWebSearchSubgraph = subgraphId.startsWith('webSearch_');
  
  // Fade all elements first
  this.container.selectAll(".node circle")
    .transition().duration(300)
    .attr("opacity", 0.3);
    
  this.container.selectAll(".edge line")
    .transition().duration(300)
    .attr("opacity", 0.2)
    .attr("stroke-width", 1);
    
  this.container.selectAll(".edge text, .node text")
    .transition().duration(300)
    .attr("opacity", 0.2);
  
  // For web search, highlight source node
  if (isWebSearchSubgraph) {
    this.container.selectAll(".node")
      .filter((d: any) => {
        if (d.properties && d.properties.source_node_id) {
          return true;
        }
        return false;
      })
      .selectAll("circle")
      .transition().duration(300)
      .attr("opacity", 1.0)
      .attr("stroke", "#EF4444") // red-500 for source
      .attr("stroke-width", 4);
  }
  
  // Highlight nodes in the subgraph
  this.container.selectAll(".node")
    .filter((d: any) => d.subgraphIds && 
                        d.subgraphIds.includes(subgraphId))
    .selectAll("circle")
    .transition().duration(300)
    .attr("opacity", 1.0)
    .attr("stroke", "#2563EB") // blue-600
    .attr("stroke-width", 3);
    
  this.container.selectAll(".node")
    .filter((d: any) => d.subgraphIds && 
                        d.subgraphIds.includes(subgraphId))
    .selectAll("text")
    .transition().duration(300)
    .attr("opacity", 1.0);
    
  // Highlight edges in the subgraph
  this.container.selectAll(".edge")
    .filter((d: any) => d.subgraphIds && 
                        d.subgraphIds.includes(subgraphId))
    .selectAll("line")
    .transition().duration(300)
    .attr("opacity", 1.0)
    .attr("stroke-width", 2.5)
    .attr("stroke", "#2563EB"); // blue-600
    
  this.container.selectAll(".edge")
    .filter((d: any) => d.subgraphIds && 
                        d.subgraphIds.includes(subgraphId))
    .selectAll("text")
    .transition().duration(300)
    .attr("opacity", 1.0)
    .attr("fill", "#2563EB"); // blue-600
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Graph Layout Integration</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2">
                  When new nodes are added, the layout is updated:
                </p>
                
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                  <h4 className="font-medium text-green-700 text-sm">Layout Integration:</h4>
                  <ol className="list-decimal list-inside mt-1 text-xs space-y-1">
                    <li>New nodes are placed near the source node initially</li>
                    <li>Force simulation is restarted with higher alpha</li>
                    <li>Forces push and pull nodes to create optimal layout</li>
                    <li>Animation smoothly transitions to new layout</li>
                    <li>View is auto-fit to show all nodes</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="font-medium text-blue-700 text-sm">Force Layout Diagram:</h4>
                  <svg width="100%" height="200" viewBox="0 0 400 200" className="mx-auto">
                    {/* Source node */}
                    <circle cx="100" cy="100" r="20" fill="#3B82F6" stroke="#000" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="100" y="105" textAnchor="middle" fill="black" fontWeight="bold" fontSize="10">Source</text>
                    
                    {/* New nodes */}
                    <circle cx="200" cy="70" r="15" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="200" y="75" textAnchor="middle" fill="black" fontWeight="bold" fontSize="8">Node 1</text>
                    
                    <circle cx="240" cy="120" r="15" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="240" y="125" textAnchor="middle" fill="black" fontWeight="bold" fontSize="8">Node 2</text>
                    
                    <circle cx="190" cy="150" r="15" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="190" y="155" textAnchor="middle" fill="black" fontWeight="bold" fontSize="8">Node 3</text>
                    
                    {/* Existing node */}
                    <circle cx="300" cy="100" r="20" fill="#9CA3AF" />
                    <text x="300" y="105" textAnchor="middle" fill="black" fontWeight="bold" fontSize="10">Existing</text>
                    
                    {/* Edges */}
                    <line x1="100" y1="100" x2="200" y2="70" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="100" y1="100" x2="240" y2="120" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="100" y1="100" x2="190" y2="150" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="240" y1="120" x2="300" y2="100" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" />
                    
                    {/* Forces */}
                    <line x1="200" y1="70" x2="220" y2="60" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="230" y="55" fontSize="8" fill="#EF4444">Repulsion</text>
                    
                    <line x1="100" y1="100" x2="90" y2="85" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="75" y="75" fontSize="8" fill="#10B981">Link force</text>
                    
                    <line x1="300" y1="100" x2="320" y2="90" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="330" y="85" fontSize="8" fill="#8B5CF6">Center force</text>
                  </svg>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <h4 className="font-medium text-sm">Force Simulation Update:</h4>
                  <pre className="mt-1 text-xs bg-black text-white p-2 rounded overflow-auto">
{`// When new graph data arrives
public render(graph: Graph): void {
  this.graph = graph;
  
  // Clear and rebuild visualization
  this.container.selectAll("*").remove();
  
  // Setup data for force simulation
  const nodeData = graph.nodes as SimulationNode[];
  const linkData = graph.edges as SimulationLink[];
  
  // Create elements...
  
  // Initialize force simulation
  this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>(nodeData)
    .force("link", d3.forceLink<SimulationNode, SimulationLink>(linkData)
      .id((d: SimulationNode) => d.id)
      .distance(this.layoutSettings.linkDistance))
    .force("charge", d3.forceManyBody<SimulationNode>()
      .strength(-this.layoutSettings.nodeRepulsion))
    .force("center", d3.forceCenter<SimulationNode>(
      this.width / 2, this.height / 2
    ).strength(this.layoutSettings.centerStrength))
    .force("collision", d3.forceCollide<SimulationNode>()
      .radius(this.layoutSettings.collisionRadius))
    .on("tick", () => {
      // Update positions on each simulation tick
      // ...
    });
    
  // Auto-fit the view to show all nodes
  this.fitToView();
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          {/* Web Search Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Complete Web Search Process</h3>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h4 className="font-medium text-amber-700 mb-2">End-to-End Process Flow</h4>
              
              <div className="overflow-auto">
                <pre className="text-xs bg-black text-white p-4 rounded">
{`1. User selects node and clicks globe icon or enters custom query
2. SidebarPromptStation or PropertyPanel initiates web search
3. Client calls API with nodeId, query, and existing graph
4. Server receives request in routes.ts
5. webSearchAndExpandGraph() function orchestrates the process:
   a. Build graph context for search
   b. Perform web search with Claude (performWebSearch())
   c. Extract graph data from search results with Claude
   d. Add metadata to track search origin and confidence
   e. Merge with existing graph (mergeGraphs())
   f. Ensure connection to source node
6. Server returns the expanded graph
7. Client updates state and re-renders visualization
8. Special styling applied to web search nodes
9. Force layout updates to incorporate new nodes
10. User can highlight the web search subgraph`}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">1. User Input</h5>
                  <div className="text-xs">Click globe icon or enter custom query</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">2. Server Processing</h5>
                  <div className="text-xs">Search execution and graph extraction with Claude</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">3. Graph Merging</h5>
                  <div className="text-xs">Intelligently merge results with existing graph</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                  <h5 className="font-medium text-sm mb-1">4. Visualization</h5>
                  <div className="text-xs">Special styling and layout for web search results</div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md mt-4">
                <h4 className="font-medium text-blue-700 text-sm mb-2">Key Files in the Process</h4>
                <div className="overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Component</th>
                        <th className="px-2 py-1 text-left">File</th>
                        <th className="px-2 py-1 text-left">Responsibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">UI Trigger</td>
                        <td className="px-2 py-1 font-mono">client/src/components/PropertyPanel.tsx</td>
                        <td className="px-2 py-1">Globe icon button to initiate search</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Query Input</td>
                        <td className="px-2 py-1 font-mono">client/src/components/SidebarPromptStation.tsx</td>
                        <td className="px-2 py-1">Custom query entry and history</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Query Generation</td>
                        <td className="px-2 py-1 font-mono">client/src/lib/webSearchUtils.ts</td>
                        <td className="px-2 py-1">Smart query generation from node context</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">API Request</td>
                        <td className="px-2 py-1 font-mono">client/src/pages/Home.tsx</td>
                        <td className="px-2 py-1">Web search mutation function</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Server Route</td>
                        <td className="px-2 py-1 font-mono">server/routes.ts</td>
                        <td className="px-2 py-1">API endpoint for web search</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Search Execution</td>
                        <td className="px-2 py-1 font-mono">server/anthropic.ts</td>
                        <td className="px-2 py-1">Claude integration for web search</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Graph Merging</td>
                        <td className="px-2 py-1 font-mono">server/routes.ts</td>
                        <td className="px-2 py-1">mergeGraphs() function</td>
                      </tr>
                      <tr className="border-t border-blue-200">
                        <td className="px-2 py-1">Visualization</td>
                        <td className="px-2 py-1 font-mono">client/src/lib/graphVisualizer.ts</td>
                        <td className="px-2 py-1">Special styling for web search results</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Recent API Logs */}
      <div className="mt-4">
        <h3 className="text-xl font-medium mb-2">Recent Web Search API Logs</h3>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading recent API logs...</p>
          ) : (
            <div>
              <p className="text-sm mb-2">Recent web search logs from your application:</p>
              <div className="overflow-auto">
                {Array.isArray(recentApiLogs) && recentApiLogs.length > 0 ? (
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Time</th>
                        <th className="px-2 py-1 text-left">Operation</th>
                        <th className="px-2 py-1 text-left">Query</th>
                        <th className="px-2 py-1 text-left">Source Node</th>
                        <th className="px-2 py-1 text-right">Processing Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApiLogs.map((log: any) => (
                        <tr key={log.id} className="border-t border-gray-200">
                          <td className="px-2 py-1">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="px-2 py-1">{log.operation}</td>
                          <td className="px-2 py-1 max-w-[200px] truncate">
                            {log.requestData?.query ? `"${log.requestData.query.substring(0, 30)}..."` : "N/A"}
                          </td>
                          <td className="px-2 py-1">
                            {log.requestData?.nodeId || "N/A"}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {log.processingTimeMs ? `${log.processingTimeMs}ms` : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic">No recent web search logs found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}