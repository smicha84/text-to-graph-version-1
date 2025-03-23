import Anthropic from '@anthropic-ai/sdk';
import { Graph, GraphOptions, Node, Edge } from '@shared/schema';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

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

export async function generateGraphWithClaude(
  text: string, 
  options: GraphOptions
): Promise<Graph> {
  // Construct a prompt for Claude to extract entities and relationships
  // If a custom extraction prompt is provided, use it; otherwise build the default one
  const extractionPrompt = options.customExtractionPrompt || buildPrompt(text, options);
  
  try {
    // Default system prompt with explicit instruction to ONLY return valid JSON
    const defaultSystemPrompt = "You are an expert in natural language processing and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph. Use deep thinking to ensure comprehensive analysis, including implicit relationships and accurate hierarchical representation of concepts. IMPORTANT: Your response MUST ONLY be a valid JSON object with 'nodes' and 'edges' arrays - no explanation text, no markdown formatting, no additional content.";
    
    // Setup the API call parameters
    const apiParams: any = {
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      temperature: options.temperature !== undefined ? options.temperature : 0.7, // Lower temperature for more consistent output
      system: options.customSystemPrompt || defaultSystemPrompt,
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ]
    };
    
    // Add thinking configuration if enabled
    if (options.thinkingEnabled !== false) { // Default to enabled if not specified
      // Thinking requires temperature to be exactly 1.0
      apiParams.temperature = 1.0;
      apiParams.thinking = {
        type: "enabled",
        budget_tokens: options.thinkingBudget || 2000
      };
    }
    
    console.log('Sending request to Claude API with parameters:', JSON.stringify({
      model: apiParams.model,
      temperature: apiParams.temperature,
      thinkingEnabled: !!apiParams.thinking,
      promptLength: extractionPrompt.length
    }));
    
    // Call Claude API with the configured parameters
    const response = await anthropic.messages.create(apiParams);

    // Extract the JSON response from Claude
    console.log('Claude API response received, content items:', response.content?.length || 0);
    
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
    
    // Clean up the content text - remove any markdown code block markers and trim whitespace
    contentText = contentText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    // If the content starts with a '{' and ends with a '}', it's likely JSON
    if (contentText.startsWith('{') && contentText.endsWith('}')) {
      console.log('Content appears to be JSON, length:', contentText.length);
    } else {
      console.log('Content does not appear to be direct JSON, will attempt extraction');
    }
    
    console.log('Content text sample:', contentText.substring(0, Math.min(200, contentText.length)));
    
    // Try to find and extract a valid JSON object using regex for better reliability
    // This regex looks for objects with "nodes" and "edges" arrays which are the essential parts of our graph
    console.log('Original content text length:', contentText.length);
    console.log('Content text excerpt:', contentText.substring(0, 200) + '...');
    
    // More permissive regex pattern to catch various JSON formats
    const graphJsonRegex = /{[\s\S]*?"nodes"\s*:\s*\[[\s\S]*?\][\s\S]*?"edges"\s*:\s*\[[\s\S]*?\][\s\S]*?}/g;
    
    console.log('Attempting to match with regex pattern');
    const match = graphJsonRegex.exec(contentText);
    
    if (!match) {
      console.error('Could not find valid graph JSON in Claude response using regex');
      
      // Try JSON extraction from first { to last }
      const jsonStart = contentText.indexOf('{');
      const jsonEnd = contentText.lastIndexOf('}') + 1;
      
      console.log(`JSON brackets found at positions: ${jsonStart} to ${jsonEnd}`);
      
      if (jsonStart === -1 || jsonEnd === 0 || jsonStart >= jsonEnd) {
        console.error('No valid JSON structure found in response');
        throw new Error('Could not extract any JSON object from Claude response - no valid brackets found');
      }
      
      const jsonResponse = contentText.substring(jsonStart, jsonEnd);
      console.log('Extracted potential JSON (length):', jsonResponse.length);
      console.log('JSON extract first 100 chars:', jsonResponse.substring(0, 100) + '...');
      
      try {
        // Verify if extracted content has required structure before parsing
        if (!jsonResponse.includes('"nodes"') || !jsonResponse.includes('"edges"')) {
          console.error('Extracted content does not contain required "nodes" and "edges" fields');
          throw new Error('The extracted content does not match the expected graph structure');
        }
        
        // Create a default structure in case parsing fails
        const graphData: Graph = {
          nodes: [],
          edges: [],
          subgraphCounter: 1
        };
        
        // Try to parse the JSON
        try {
          const parsedData = JSON.parse(jsonResponse);
          console.log('Successfully parsed JSON. Structure:', Object.keys(parsedData).join(', '));
          
          // Validate the parsed data structure
          if (!Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
            console.error('Parsed JSON does not have valid nodes and edges arrays:', 
              'nodes is array:', Array.isArray(parsedData.nodes), 
              'edges is array:', Array.isArray(parsedData.edges));
            throw new Error('The string did not match the expected pattern');
          }
          
          Object.assign(graphData, parsedData);
        } catch (parseError) {
          console.error('Error with JSON parsing:', parseError);
          throw new Error(`JSON parsing error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
        
        // Process the graph data
        processGraphData(graphData, text);
        return graphData;
      } catch (finalError) {
        console.error('All JSON extraction methods failed:', finalError);
        throw new Error(`Failed to extract usable graph data: ${finalError instanceof Error ? finalError.message : String(finalError)}`);
      }
    }
    
    // We found a match with the regex
    const jsonResponse = match[0];
    console.log('Extracted graph JSON with regex match, length:', jsonResponse.length);
    console.log('JSON extract first 100 chars:', jsonResponse.substring(0, 100) + '...');
    
    try {
      const graphData = JSON.parse(jsonResponse);
      console.log('Successfully parsed regex-matched JSON. Keys:', Object.keys(graphData).join(', '));
      
      // Validate the structure
      if (!Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
        console.error('Parsed JSON does not have valid nodes and edges arrays');
        throw new Error('The string did not match the expected pattern');
      }
      
      // Process the graph data
      processGraphData(graphData, text);
      return graphData;
    } catch (parseError) {
      console.error('Error parsing regex-matched JSON response:', parseError);
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
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
Analyze the following text and extract a labeled property graph with entities and relationships. The graph must be represented as JSON with "nodes" and "edges" arrays.

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

RESPONSE FORMAT INSTRUCTIONS:
1. You MUST return ONLY a valid JSON object with no additional text
2. DO NOT include any markdown formatting (no \`\`\`json or \`\`\` markers)
3. DO NOT include any explanations before or after the JSON
4. The JSON structure MUST have both "nodes" and "edges" arrays
5. All node and edge IDs must be unique strings

JSON STRUCTURE:
{
  "nodes": [
    {
      "id": "n1",  // A unique string identifier starting with 'n' followed by a number
      "label": "Person",  // IMPORTANT: Use ONLY these high-level categories: Person, Organization, Location, Event, Document, Project, Technology, Concept
      "type": "Entrepreneur",   // More specific type - choose from: Employee, Entrepreneur, Investor, Expert, Company, Agency, Institute, City, Country, Region, Conference, Meeting, Report, Presentation, Initiative, Software, Hardware, Method, Theory
      "properties": {
        "name": "John Doe",  // Required property
        "age": 42,
        "role": "CEO",
        "description": "Founder of the company"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",  // A unique string identifier starting with 'e' followed by a number
      "source": "n1",  // The id of the source node
      "target": "n2",  // The id of the target node
      "label": "WORKS_FOR",  // The relationship type in uppercase
      "properties": {
        "since": 2020,
        "position": "Executive",
        "department": "Management"
      }
    }
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

CRITICAL: You must ONLY return the valid JSON object with no surrounding text, no comments, no explanations, no code blocks. Make sure your JSON has both "nodes" and "edges" arrays, even if one is empty.`;
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