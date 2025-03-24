import Anthropic from '@anthropic-ai/sdk';
import { Graph, GraphOptions, Node, Edge } from '@shared/schema';
import { logApiInteraction } from './database';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

// Web search simulation function (in a real app, this would call a real search API)
export async function performWebSearch(query: string): Promise<string> {
  console.log(`Performing web search for query: ${query}`);
  
  const startTime = Date.now();
  let statusCode = 200;
  
  try {
    // Log the request to the database
    const requestData = {
      query,
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      temperature: 0.7,
    };
    
    await logApiInteraction(
      'request',
      'web_search',
      requestData
    );
    
    // In a real application, this would use an actual web search API
    // Here we're using Claude to generate information that simulates search results
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      temperature: 0.7,
      system: "You are a web search engine. Your task is to provide search results for the given query. Provide 3-5 detailed, information-rich results with factual information, focusing on authoritative sources. Each result should include the title, URL, and a detailed snippet. Make the information comprehensive and factual. Format your response like real search results. Include a mix of different perspectives and sources. Do not refer to yourself or your process. Don't admit you're an AI. Just provide the search results directly.",
      messages: [
        {
          role: 'user',
          content: `Web search query: "${query}". Please provide detailed search results.`
        }
      ]
    });
    
    // Extract the text content from the response
    let searchResults = '';
    for (const item of response.content) {
      if (item.type === 'text') {
        searchResults += item.text;
      }
    }
    
    // Calculate processing time
    const processingTimeMs = Date.now() - startTime;
    
    // Log the response to the database
    const responseData = {
      search_results: searchResults,
      model: CLAUDE_MODEL,
      completion_tokens: response.usage?.output_tokens || 0,
      prompt_tokens: response.usage?.input_tokens || 0
    };
    
    await logApiInteraction(
      'response',
      'web_search',
      requestData,
      responseData,
      statusCode,
      processingTimeMs
    );
    
    console.log('Received simulated web search results');
    return searchResults;
  } catch (error) {
    // Update status code for error
    statusCode = 500;
    
    // Calculate processing time even for errors
    const processingTimeMs = Date.now() - startTime;
    
    // Log the error to the database
    await logApiInteraction(
      'error',
      'web_search',
      { query },
      { error: error instanceof Error ? error.message : String(error) },
      statusCode,
      processingTimeMs
    );
    
    console.error('Error performing web search:', error);
    throw new Error(`Failed to perform web search: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface Entity {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
}

export async function generateGraphWithClaude(text: string, options: GraphOptions): Promise<Graph> {
  // Construct a prompt for Claude to extract entities and relationships
  const extractionPrompt = buildPrompt(text, options);
  
  const startTime = Date.now();
  let statusCode = 200;
  
  // Prepare request data for logging
  const requestData = {
    text_length: text.length,
    text_excerpt: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    options,
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    temperature: 1.0,
    thinking_enabled: true,
    thinking_budget: 2000
  };
  
  // Log the request to the database
  await logApiInteraction(
    'request',
    'generate_graph',
    requestData
  );
  
  try {
    // Call Claude API with advanced system prompt and thinking enabled for deeper analysis
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      temperature: 1.0, // Must be exactly 1.0 when thinking is enabled
      system: "You are an expert in natural language processing and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph. Use deep thinking to ensure comprehensive analysis, including implicit relationships and accurate hierarchical representation of concepts. Consider not just explicitly stated relationships but also those that can be inferred from context.",
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      thinking: {
        type: "enabled",
        budget_tokens: 2000
      }
    });

    // Extract the JSON response from Claude
    console.log('Claude API response:', JSON.stringify(response.content, null, 2));
    
    // Handle different content types from Claude API
    let contentText = '';
    
    // Check if we have a valid response with content
    if (!response.content || response.content.length === 0) {
      throw new Error('Empty response from Claude API');
    }
    
    // Define types for the content from Claude API
    interface TextContent {
      type: 'text';
      text: string;
    }
    
    interface ThinkingContent {
      type: 'thinking';
      thinking: Record<string, any>;
    }
    
    type ContentItem = TextContent | ThinkingContent;
    
    // Extract text content from any response format
    for (const item of response.content as ContentItem[]) {
      if (item.type === 'text') {
        contentText += (item as TextContent).text;
      } else if (item.type === 'thinking' && typeof (item as ThinkingContent).thinking === 'object') {
        // If the response contains thinking content, try to extract it
        contentText += JSON.stringify((item as ThinkingContent).thinking);
      }
    }
    
    if (!contentText) {
      throw new Error('No text content found in Claude API response');
    }
    
    console.log('Extracted content text:', contentText);
    
    // Try to find and extract a valid JSON object using regex for better reliability
    // This regex looks for objects with "nodes" and "edges" arrays which are the essential parts of our graph
    const graphJsonRegex = /{[\s\S]*?"nodes"\s*:\s*\[[\s\S]*?\][\s\S]*?"edges"\s*:\s*\[[\s\S]*?\][\s\S]*?}/g;
    const match = graphJsonRegex.exec(contentText);
    
    if (!match) {
      console.error('Could not find valid graph JSON in Claude response');
      
      // No fallback - fail immediately
      statusCode = 422; // Unprocessable Entity
      const processingTimeMs = Date.now() - startTime;
      
      // Log the error
      await logApiInteraction(
        'error',
        'generate_graph',
        requestData,
        { 
          error: 'Could not find valid graph JSON in Claude response',
          method: 'json_extraction_failed'
        },
        statusCode,
        processingTimeMs
      );
      
      throw new Error('Could not find valid graph JSON in Claude response. Please try with a different text or prompt.');
    }
    
    // We found a match with the regex
    const jsonResponse = match[0];
    console.log('Extracted graph JSON with regex match');
    
    try {
      const graphData = JSON.parse(jsonResponse);
      
      // Process the graph data
      processGraphData(graphData, text);
      
      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;
      
      // Log the successful response
      const responseData = {
        nodeCount: graphData.nodes.length,
        edgeCount: graphData.edges.length,
        completion_tokens: response.usage?.output_tokens || 0,
        prompt_tokens: response.usage?.input_tokens || 0,
        model: CLAUDE_MODEL
      };
      
      await logApiInteraction(
        'response',
        'generate_graph',
        requestData,
        responseData,
        statusCode,
        processingTimeMs
      );
      
      return graphData;
    } catch (parseError) {
      console.error('Error parsing regex-matched JSON response:', parseError);
      
      // Update status code for parsing error
      statusCode = 422; // Unprocessable Entity
      
      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;
      
      // Log the parsing error
      await logApiInteraction(
        'error',
        'generate_graph',
        requestData,
        { error: parseError instanceof Error ? parseError.message : String(parseError) },
        statusCode,
        processingTimeMs
      );
      
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // Update status code for API error
    statusCode = 500;
    
    // Calculate processing time
    const processingTimeMs = Date.now() - startTime;
    
    // Log the API error
    await logApiInteraction(
      'error',
      'generate_graph',
      requestData,
      { error: error instanceof Error ? error.message : String(error) },
      statusCode,
      processingTimeMs
    );
    
    throw new Error(`Failed to generate graph with Claude: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to process graph data (add layout, fix labels, etc.)
function processGraphData(graphData: Graph, text: string): void {
  // Apply simple layout algorithm to position nodes
  applyLayout(graphData);
  
  // Initialize subgraph tracking for new graphs
  const initialSubgraphId = 'sg1';
  graphData.subgraphCounter = 1;
  
  // Fix labels for all nodes if they exist
  if (graphData.nodes && Array.isArray(graphData.nodes)) {
    graphData.nodes.forEach((node: Node) => {
      // Process labels to extract label details from parentheses
      let label = node.label;
      let labelDetail = '';
      
      // Check if the label has a format like "Organization (Company)"
      const labelMatch = node.label?.match(/^(.+?)\s*\((.+?)\)$/);
      if (labelMatch) {
        label = labelMatch[1].trim(); // The part before the parentheses
        labelDetail = labelMatch[2].trim(); // The part within parentheses
      }
      
      // Set the corrected label and add label detail
      node.label = label;
      node.labelDetail = labelDetail || node.type;
      
      // Add subgraph ID
      node.subgraphIds = [initialSubgraphId];
    });
  }
  
  // Add subgraph IDs to all edges if they exist
  if (graphData.edges && Array.isArray(graphData.edges)) {
    graphData.edges.forEach((edge: Edge) => {
      edge.subgraphIds = [initialSubgraphId];
    });
  }
}

function buildPrompt(text: string, options: GraphOptions): string {
  return `
Analyze the following text and extract a labeled property graph with entities and relationships. The graph should be represented as JSON with "nodes" and "edges" arrays.

TEXT TO ANALYZE:
"""
${text}
"""

EXTRACTION OPTIONS:
${options.extractEntities ? '- Extract entities (people, organizations, locations, products, concepts, events, documents, etc.)' : '- Skip entity extraction'}
${options.extractRelations ? '- Extract relationships between entities' : '- Skip relationship extraction'}
${options.inferProperties ? '- Infer additional properties for entities and relationships based on context' : '- Only extract explicitly mentioned properties'}
${options.mergeEntities ? '- Merge similar or duplicate entities into single nodes' : '- Keep entities separate even if they might be the same'}

TASK BREAKDOWN:
1. First, identify all the key entities in the text.
2. For each entity, determine its:
   - High-level category (Person, Organization, Location, etc.) - This will be the "label"
   - Specific subtype - This will be stored in the "type" field
   - Unique properties (name, age, date, description, etc.)
   - Any identifiers that would help distinguish it
3. Map the relationships between these entities.
4. Ensure each relationship has a clear direction and descriptive label.

RESPONSE FORMAT:
Respond with a JSON object that has the following structure:
{
  "nodes": [
    {
      "id": "n1",  // A unique string identifier starting with 'n' followed by a number
      "label": "Person",  // IMPORTANT: Use ONLY these high-level categories: Person, Organization, Location, Event, Document, Project, Technology, Concept
      "type": "Entrepreneur",   // More specific type - choose from: Employee, Entrepreneur, Investor, Expert, Company, Agency, Institute, City, Country, Region, Conference, Meeting, Report, Presentation, Initiative, Software, Hardware, Method, Theory
      "properties": {
        "name": "John Doe",  // Required property
        // Include other properties that are relevant
        "age": 42,
        "role": "CEO",
        "description": "Founder of the company"
      }
    },
    // More nodes...
  ],
  "edges": [
    {
      "id": "e1",  // A unique string identifier starting with 'e' followed by a number
      "source": "n1",  // The id of the source node
      "target": "n2",  // The id of the target node
      "label": "WORKS_FOR",  // The relationship type in uppercase
      "properties": {
        // Include any properties of the relationship
        "since": 2020,
        "position": "Executive",
        "department": "Management"
      }
    },
    // More edges...
  ]
}

QUALITY REQUIREMENTS:
- Use STRICT label categories from the list above - never combine label and type in the label field
- Be consistent: the same entity type should always have the same label (e.g., all companies should have label "Organization" and type "Company")
- Store hierarchical or classification information as a property, not in the label or type fields
- Use ALL_CAPS for relationship labels
- Don't invent entities or relationships that aren't supported by the text
- Include sufficient properties to make each entity informative and distinctive
- Create relationship labels that clearly describe the nature of the connection
- Ensure each relationship flows in the logical direction (e.g., PERSON WORKS_FOR COMPANY, not the reverse)

Only respond with the JSON object, no explanations or other text.`;
}

function applyLayout(graph: Graph): void {
  // Instead of circular layout, use a more randomized layout
  // This gives the force-directed algorithm a better starting point
  const centerX = 400;
  const centerY = 300;
  const spreadFactor = 250; // Higher value means more spread out initial positions
  
  // Apply a slight randomization to the positions
  if (graph.nodes && Array.isArray(graph.nodes)) {
    graph.nodes.forEach((node: Node) => {
      // Use a combination of random positioning and node index to achieve 
      // better distribution while still maintaining some determinism
      node.x = centerX + (Math.random() - 0.5) * spreadFactor;
      node.y = centerY + (Math.random() - 0.5) * spreadFactor;
    });
  }
}
