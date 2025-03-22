import Anthropic from '@anthropic-ai/sdk';
import { Graph, GraphOptions } from '@shared/schema';

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

export async function generateGraphWithClaude(text: string, options: GraphOptions): Promise<Graph> {
  // Construct a prompt for Claude to extract entities and relationships
  const extractionPrompt = buildPrompt(text, options);
  
  try {
    // Call Claude API with advanced system prompt for deep analysis
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      temperature: 0.2,
      system: "You are an expert in natural language processing and knowledge graph creation. Your task is to analyze text and extract entities and relationships to form a property graph. Use deep thinking to ensure comprehensive analysis, including implicit relationships and accurate hierarchical representation of concepts. Consider not just explicitly stated relationships but also those that can be inferred from context.",
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ]
    });

    // Extract the JSON response from Claude
    const content = response.content[0];
    
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude API');
    }
    
    const contentText = content.text;
    const jsonStart = contentText.indexOf('{');
    const jsonEnd = contentText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Could not extract valid JSON from Claude response');
    }
    
    const jsonResponse = contentText.substring(jsonStart, jsonEnd);
    const graphData = JSON.parse(jsonResponse);

    // Apply simple layout algorithm to position nodes
    applyLayout(graphData);
    
    return graphData;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to generate graph with Claude: ${error instanceof Error ? error.message : String(error)}`);
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
   - Type/category (Person, Organization, Location, Event, Concept, etc.)
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
      "label": "Person",  // The entity type (Person, Organization, Location, etc.)
      "type": "Person",   // More specific category if available
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
- Ensure the graph is connected and meaningful
- Use consistent labeling schemes for similar entities and relationships
- Use ALL_CAPS for relationship labels
- Don't invent entities or relationships that aren't supported by the text
- Include sufficient properties to make each entity informative and distinctive
- Create relationship labels that clearly describe the nature of the connection
- Ensure each relationship flows in the logical direction (e.g., PERSON WORKS_FOR COMPANY, not the reverse)

Only respond with the JSON object, no explanations or other text.`;
}

function applyLayout(graph: { nodes: any[], edges: any[] }): void {
  const centerX = 400;
  const centerY = 300;
  const radius = 200;
  
  graph.nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / graph.nodes.length;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}