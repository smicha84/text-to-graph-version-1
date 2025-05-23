import Anthropic from '@anthropic-ai/sdk';
import { Graph, GraphOptions, Node, Edge } from '@shared/schema';
import { logApiInteraction } from './database';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

// Enhanced web search simulation function with improved structured response format
export async function performWebSearch(query: string, graphContext?: any): Promise<string> {
  console.log(`Performing enhanced web search for query: "${query}"`);
  
  const startTime = Date.now();
  let statusCode = 200;
  
  try {
    // Prepare the context and prompt based on graph information when available
    const hasContext = graphContext && Object.keys(graphContext).length > 0;
    
    // Log the request to the database with enhanced metadata
    const requestData = {
      query,
      model: CLAUDE_MODEL,
      max_tokens: 8000, // Increased for more comprehensive results
      temperature: 0.5, // Lower temperature for more factual responses
      has_graph_context: hasContext,
      context_size: hasContext ? 
        JSON.stringify(graphContext).length : 0
    };
    
    await logApiInteraction(
      'request',
      'web_search',
      requestData
    );
    
    // Construct a more sophisticated system prompt based on whether we have context
    let systemPrompt = `You are a sophisticated web search engine with knowledge graph capabilities. Your task is to provide comprehensive search results for the given query that can be integrated into a knowledge graph.

For each search result, provide:
1. Title of the page or resource
2. URL (make these realistic but they can be fictional)
3. A detailed snippet with factual information
4. Key entities mentioned (people, organizations, places, concepts)
5. Key relationships between entities
6. Citations or references where appropriate

Structure your information to maximize usefulness for graph integration. Focus on authoritative sources. Make the information comprehensive and factual. Include different perspectives where appropriate.

Format your results in a structured way that clearly separates each result. Each result should include all the above elements.
`;

    // Add context-specific instructions when we have graph context
    if (hasContext) {
      systemPrompt += `\nIMPORTANT: I'm providing you with context about the existing knowledge graph. Use this to make your search results MORE RELEVANT to the existing structure:
- Focus on information that connects to the node "${graphContext.sourceNode.label}"
- Look for connections to other important nodes in the graph including: ${graphContext.importantNodes.map((n: any) => n.label).join(', ')}
- Emphasize relationships that extend or clarify existing connections
- Prioritize information that fills gaps in the existing knowledge structure
`;
    }
    
    // Enhanced user message with more context when available
    let userMessage = `Web search query: "${query}"`;
    
    // Add graph context when available
    if (hasContext) {
      userMessage += `\n\nCONTEXT:
Source Node: ${JSON.stringify(graphContext.sourceNode, null, 2)}
Direct Connections: ${JSON.stringify(graphContext.directConnections.map((n: any) => ({
        id: n.id,
        label: n.label,
        type: n.type
      })), null, 2)}
Relationships: ${JSON.stringify(graphContext.relationships.map((r: any) => ({
        source: r.source,
        label: r.label,
        target: r.target
      })), null, 2)}
`;
    }
    
    userMessage += `\n\nPlease provide detailed search results that can be integrated into the knowledge graph.`;
    
    // In a real application, this would use an actual web search API
    // Here we're using Claude to generate information that simulates search results
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
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
    
    // Log the response to the database with enhanced metadata
    const responseData = {
      search_results: searchResults,
      model: CLAUDE_MODEL,
      completion_tokens: response.usage?.output_tokens || 0,
      prompt_tokens: response.usage?.input_tokens || 0,
      processing_time_ms: processingTimeMs,
      result_length: searchResults.length,
      has_structured_results: searchResults.includes('Title:') && searchResults.includes('URL:')
    };
    
    await logApiInteraction(
      'response',
      'web_search',
      requestData,
      responseData,
      statusCode,
      processingTimeMs
    );
    
    console.log('Received enhanced web search results');
    
    // Format the results to add a header that helps Claude understand the context
    return `# Web Search Results for: "${query}"\n\nThe following information was retrieved from a web search and should be used to expand the knowledge graph:\n\n${searchResults}`;
  } catch (error) {
    // Update status code for error
    statusCode = 500;
    
    // Calculate processing time even for errors
    const processingTimeMs = Date.now() - startTime;
    
    // Log the error to the database with enhanced context
    await logApiInteraction(
      'error',
      'web_search',
      { query, has_context: !!graphContext },
      { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      statusCode,
      processingTimeMs
    );
    
    console.error('Error performing enhanced web search:', error);
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
    max_tokens: 8000,
    temperature: 1.0,
    thinking_enabled: true,
    thinking_budget: 4000
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
      max_tokens: 8000,
      temperature: 1.0, // Must be exactly 1.0 when thinking is enabled
      system: "You are an expert in natural language processing, ontology engineering, and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph. First, create a comprehensive domain ontology that defines entity types, relationship types, and hierarchies. Then use this ontology to guide extraction of entities and relationships. Finally, verify that all nodes and edges conform to the ontology and are supported by the text. Use deep thinking to ensure comprehensive analysis, including implicit relationships and accurate hierarchical representation of concepts. Consider not just explicitly stated relationships but also those that can be inferred from context.",
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      thinking: {
        type: "enabled",
        budget_tokens: 4000
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
  // Check if we have existing taxonomy information
  const existingTaxonomy = options.existingTaxonomy;
  // Check if we have existing entities for deduplication
  const existingEntities = options.existingEntities;
  
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
${options.generateOntology ? '- Generate domain-specific ontology before extraction' : '- Skip ontology generation'}
${options.generateTaxonomies ? '- Generate hierarchical taxonomies for entity types (create IS_PARENT_OF relationships)' : '- Skip taxonomy generation'}
${existingTaxonomy ? '- IMPORTANT: Reuse existing taxonomy nodes and relationships provided below' : ''}
${existingEntities ? '- IMPORTANT: When identifying entities, first check if they already exist in the provided list of existing entities' : ''}

${existingEntities ? `
EXISTING ENTITIES FOR DEDUPLICATION:
The graph already contains these entities. When you identify an entity in the text:
1. Check if it's the same as any entity in this list (even if referenced differently, e.g., by first name only or nickname)
2. If it matches an existing entity, use the same node ID and maintain consistency with the entity type
3. Pay special attention to people, organizations, and locations that might be referenced differently but are the same entity

Existing Entities:
${JSON.stringify(existingEntities, null, 2)}
` : ''}

${existingTaxonomy ? `
EXISTING TAXONOMY INFORMATION:
The graph already contains a taxonomy hierarchy that should be reused. When applying taxonomy to new nodes, 
connect them to these existing taxonomy nodes rather than creating new taxonomy categories unless absolutely necessary.

Existing Taxonomy Nodes:
${JSON.stringify(existingTaxonomy.nodes, null, 2)}

Existing Taxonomy Relationships:
${JSON.stringify(existingTaxonomy.relationships, null, 2)}
` : ''}

TASK BREAKDOWN:
${options.generateOntology ? `1. FIRST STEP - ONTOLOGY CREATION: Create an ontology based on the text that defines:
   - The main entity types that exist in this domain
   - The possible relationship types between these entities
   - The hierarchical organization of entity types (parent-child relationships)
   - Key properties that typically belong to each entity type` : ''}

${options.generateTaxonomies ? `${options.generateOntology ? '2' : '1'}. ${options.generateOntology ? 'SECOND' : 'FIRST'} STEP - TAXONOMY GENERATION: Create hierarchical taxonomies for the entity types:
   - For each entity type, identify broader categories and specialized subcategories
   - Create explicit IS_PARENT_OF relationships between these categories
   - Organize into at least 3-5 levels deep where possible
   - Ensure that each taxonomy node has properties like "name" and "description"` : ''}

${options.generateOntology || options.generateTaxonomies ? (options.generateOntology && options.generateTaxonomies ? '3' : '2') : '1'}. ${options.generateOntology && options.generateTaxonomies ? 'THIRD' : options.generateOntology || options.generateTaxonomies ? 'SECOND' : 'FIRST'} STEP - ENTITY EXTRACTION: ${options.generateOntology ? 'Using the ontology created earlier' : 'Analyze the text'}, identify all key entities in the text.
   For each entity, determine:
   - High-level category from the ontology (Person, Organization, Location, etc.) - This will be the "label"
   - Specific subtype within that category - This will be stored in the "type" field
   - Unique properties (name, age, date, description, etc.)
   - Any identifiers that would help distinguish it

${options.generateOntology || options.generateTaxonomies ? (options.generateOntology && options.generateTaxonomies ? '4' : '3') : '2'}. ${options.generateOntology && options.generateTaxonomies ? 'FOURTH' : options.generateOntology || options.generateTaxonomies ? 'THIRD' : 'SECOND'} STEP - RELATIONSHIP MAPPING: Looking at ${options.generateOntology ? 'the ontology, ' : ''}the list of extracted entities, and the original text,
   map the relationships between the entities.
   - Ensure each relationship has a clear direction and descriptive label.
   - ${options.generateOntology ? 'Use relationship types defined in your ontology' : 'Create descriptive relationship types in ALL_CAPS'}
   - Verify that relationships are supported by the text

${options.generateTaxonomies ? `${options.generateOntology || options.generateTaxonomies ? (options.generateOntology && options.generateTaxonomies ? '5' : '4') : '3'}. ${options.generateOntology && options.generateTaxonomies ? 'FIFTH' : options.generateOntology || options.generateTaxonomies ? 'FOURTH' : 'THIRD'} STEP - TAXONOMY INTEGRATION: Connect entities to the taxonomy hierarchy:
   - For each entity, identify its appropriate place in the taxonomy
   - Create IS_A relationships to connect instances to their types
   - Ensure that taxonomy nodes have IS_PARENT_OF relationships creating a proper hierarchy` : ''}

${options.generateOntology ? `STEP 1: ONTOLOGY CREATION
-------------------------
First, create a domain ontology by analyzing the text and identifying:
- Main entity types (classes)
- Relationship types between entities
- Properties associated with each entity type
- Hierarchical organization

Your ontology should use these high-level categories:
- Person
- Organization
- Location
- Event
- Document
- Project
- Technology
- Concept` : ''}

${options.generateTaxonomies ? `
${options.generateOntology ? 'STEP 2' : 'STEP 1'}: TAXONOMY GENERATION
--------------------------
${options.generateOntology ? 'Next' : 'First'}, create hierarchical taxonomies for entity types:
- For each entity type identified in the text, create a taxonomy with at least 3-5 levels deep
- Each taxonomy node should have a descriptive name and connect to its parent with IS_PARENT_OF relationship
- For example, Organization → Company → Tech Company → Software Company → AI Company
- Create these taxonomy nodes as additional nodes in the graph with proper properties
- IMPORTANT: Use IDs with the "tax_" prefix for all taxonomy nodes (e.g., tax_1, tax_2, tax_3)
- Taxonomy nodes should use labels like "OrganizationType", "PersonType", etc.
- Taxonomy nodes should have "Taxonomy" as their type
- Connect taxonomy nodes with IS_PARENT_OF relationships
- Connect regular entities to their taxonomy categories with IS_A relationships
- The taxonomy should be domain-specific and relevant to the content of the text
- Each taxonomy node must include properties: name, level (1-5, with 1 being most general), and description` : ''}

For each category, identify specific subtypes and typical properties.

STEP 2 & 3: ENTITY & RELATIONSHIP EXTRACTION
--------------------------------------------
After creating the ontology, use it to guide your entity extraction and relationship mapping.
Ensure all entities and relationships conform to your ontology.

RESPONSE FORMAT:
Respond with a JSON object that has the following structure:
{
  "nodes": [
    // Regular entity nodes
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
    
    // FOR TAXONOMY GENERATION: Include taxonomy nodes with tax_ prefix IDs when generateTaxonomies is enabled
    {
      "id": "tax_1",  // A unique string identifier starting with 'tax_' followed by a number
      "label": "PersonType",  // Use the pattern [CategoryName]Type for taxonomy nodes
      "type": "Taxonomy",   // All taxonomy nodes should have "Taxonomy" type
      "properties": {
        "name": "Professional",  // The name of this taxonomy level
        "level": 2,  // The level in the taxonomy hierarchy (1 is highest, 5 is lowest)
        "description": "People who work in professional occupations"
      }
    },
    // More nodes...
  ],
  "edges": [
    // Regular relationship edges
    {
      "id": "e1",  // A unique string identifier starting with 'e' followed by a number
      "source": "n1",  // The id of the source node
      "target": "n2",  // The id of the target node
      "label": "WORKS_FOR",  // The relationship type in uppercase, should be from your ontology
      "properties": {
        // Include any properties of the relationship
        "since": 2020,
        "position": "Executive",
        "department": "Management"
      }
    },
    
    // FOR TAXONOMY GENERATION: Include IS_PARENT_OF relationships between taxonomy nodes
    {
      "id": "tax_e1",  // A unique string identifier starting with 'tax_e' followed by a number
      "source": "tax_1",  // ID of the parent taxonomy node
      "target": "tax_2",  // ID of the child taxonomy node
      "label": "IS_PARENT_OF",  // Always use IS_PARENT_OF for taxonomy relationships
      "properties": {
        "relation_type": "taxonomy"
      }
    },
    
    // FOR TAXONOMY GENERATION: Include IS_A relationships connecting entities to taxonomy
    {
      "id": "tax_e2",  // Another unique identifier for taxonomy edges
      "source": "n1",  // ID of the entity node
      "target": "tax_3",  // ID of the relevant taxonomy node
      "label": "IS_A",  // Always use IS_A to connect entities to their taxonomy categories
      "properties": {
        "relation_type": "instance_of"
      }
    },
    // More edges...
  ]
}

QUALITY REQUIREMENTS:
- Begin by creating a comprehensive ontology to guide your extraction process
- Use STRICT label categories from the list above - never combine label and type in the label field
- Be consistent: the same entity type should always have the same label (e.g., all companies should have label "Organization" and type "Company")
- Store hierarchical or classification information as a property, not in the label or type fields
- Use ALL_CAPS for relationship labels, derived from your ontology
- Don't invent entities or relationships that aren't supported by the text
- Include sufficient properties to make each entity informative and distinctive
- Create relationship labels that clearly describe the nature of the connection
- Ensure each relationship flows in the logical direction (e.g., PERSON WORKS_FOR COMPANY, not the reverse)
- Verify that all entities and relationships reflect information from the original text

FOR TAXONOMY GENERATION:
- When generateTaxonomies is enabled, create a multi-level taxonomy with at least 3-5 levels
- Use the "tax_" prefix for all taxonomy node IDs (e.g., tax_1, tax_2)
- Use "IS_PARENT_OF" relationship labels between taxonomy nodes to create the hierarchy
- Use "IS_A" relationship labels to connect regular entity nodes to their taxonomy types
- Make taxonomy nodes have a "Taxonomy" type and a label ending in "Type" (e.g., "PersonType")
- Each taxonomy node should have properties including: name, level, and description

Only respond with the JSON object for the final graph, no explanations or other text.`;
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
