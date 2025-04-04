import Anthropic from '@anthropic-ai/sdk';
import { Graph } from '../shared/schema';
import { logApiInteraction } from './database';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Define types for chat service
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  graphContext?: Graph | null;
  selectedNodeContext?: any | null;
  promptSource?: string;
  promptMetadata?: Record<string, any>;
}

interface GraphAnalysisResult {
  suggestedNodes?: any[];
  suggestedEdges?: any[];
  analysis?: string;
}

interface ChatResponse {
  message: string;
  graphAnalysis?: GraphAnalysisResult;
}

/**
 * Processes a chat message with the graph context
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { message, graphContext, selectedNodeContext, promptSource = 'unknown' } = request;
  
  // Prepare conversation context
  const messages: MessageParam[] = [];
  
  // Add system message with instructions
  const systemMessage = buildSystemMessage(graphContext, selectedNodeContext);
  
  try {
    // Log the API request
    const requestLog = {
      endpoint: '/api/chat',
      request: {
        message,
        promptSource,
        hasGraphContext: !!graphContext,
        hasSelectedNode: !!selectedNodeContext,
      },
      model: 'claude-3-opus-20240229',
    };
    
    await logApiInteraction(requestLog, null);
    
    // Call Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: message,
        }
      ],
    });
    
    // Extract the text content
    const responseContent = response.content.reduce((acc, item) => {
      if (item.type === 'text') {
        return acc + item.text;
      }
      return acc;
    }, '');
    
    // Log success response
    await logApiInteraction(requestLog, {
      status: 200,
      responseLength: responseContent.length,
    });
    
    // Extract graph analysis if present
    const graphAnalysis = extractGraphAnalysis(responseContent);
    
    return {
      message: responseContent,
      graphAnalysis,
    };
  } catch (error) {
    console.error('Error processing chat:', error);
    
    // Log error
    const requestLog = {
      endpoint: '/api/chat',
      request: {
        message,
        promptSource,
        hasGraphContext: !!graphContext,
        hasSelectedNode: !!selectedNodeContext,
      },
      model: 'claude-3-opus-20240229',
    };
    
    await logApiInteraction(requestLog, {
      status: 500,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      message: 'Sorry, I encountered an error processing your request. Please try again.',
    };
  }
}

/**
 * Extracts graph analysis JSON from the AI response if present
 */
function extractGraphAnalysis(response: string): GraphAnalysisResult | undefined {
  // Look for JSON block in the response
  const jsonRegex = /```json\n([\s\S]*?)\n```/;
  const jsonMatch = response.match(jsonRegex);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      const analysisData = JSON.parse(jsonMatch[1]);
      
      // Validate the structure
      if (
        (analysisData.suggestedNodes || analysisData.suggestedEdges || analysisData.analysis) &&
        (Array.isArray(analysisData.suggestedNodes) || Array.isArray(analysisData.suggestedEdges) || typeof analysisData.analysis === 'string')
      ) {
        return {
          suggestedNodes: analysisData.suggestedNodes || [],
          suggestedEdges: analysisData.suggestedEdges || [],
          analysis: analysisData.analysis || '',
        };
      }
    } catch (error) {
      console.warn('Failed to parse graph analysis JSON:', error);
    }
  }
  
  return undefined;
}

/**
 * Builds a system message for Claude based on the current context
 */
function buildSystemMessage(graphContext?: Graph | null, selectedNode?: any): string {
  let systemMessage = `
You are a graph analysis assistant that helps users understand and explore their graph data.
You have expertise in graph theory, data visualization, and knowledge representation.

Your primary functions are:
1. Analyzing graph structures to identify patterns, relationships, and insights
2. Suggesting potential additions or modifications to the graph
3. Answering questions about the graph's content and structure
4. Providing explanations of complex relationships in the data

When appropriate, include graph analysis in your response using this JSON format:
\`\`\`json
{
  "analysis": "Your insight about the graph structure or content",
  "suggestedNodes": [
    {
      "id": "unique_id",
      "label": "Node Label",
      "type": "Node Type",
      "properties": {"key": "value"}
    }
  ],
  "suggestedEdges": [
    {
      "source": "source_node_id",
      "target": "target_node_id",
      "label": "RELATIONSHIP_TYPE",
      "properties": {"key": "value"}
    }
  ]
}
\`\`\`

Always maintain a helpful, informative, and analytical tone. If you cannot answer a question based on the available graph data, explain what additional information would be needed.
`;

  // Add graph context if available
  if (graphContext && graphContext.nodes.length > 0) {
    systemMessage += `\n\nCurrent Graph Context:\n`;
    systemMessage += `- Nodes: ${graphContext.nodes.length}\n`;
    systemMessage += `- Edges: ${graphContext.edges.length}\n`;
    
    // Add node types summary
    const nodeTypes = new Map<string, number>();
    graphContext.nodes.forEach(node => {
      const count = nodeTypes.get(node.type) || 0;
      nodeTypes.set(node.type, count + 1);
    });
    
    systemMessage += `\nNode Types:\n`;
    nodeTypes.forEach((count, type) => {
      systemMessage += `- ${type}: ${count}\n`;
    });
    
    // Add edge types summary
    const edgeTypes = new Map<string, number>();
    graphContext.edges.forEach(edge => {
      const count = edgeTypes.get(edge.label) || 0;
      edgeTypes.set(edge.label, count + 1);
    });
    
    systemMessage += `\nRelationship Types:\n`;
    edgeTypes.forEach((count, type) => {
      systemMessage += `- ${type}: ${count}\n`;
    });
    
    // Add selected node context if available
    if (selectedNode) {
      systemMessage += `\nCurrently Selected Node:\n`;
      systemMessage += `- ID: ${selectedNode.id}\n`;
      systemMessage += `- Label: ${selectedNode.label}\n`;
      systemMessage += `- Type: ${selectedNode.type}\n`;
      
      if (selectedNode.properties && Object.keys(selectedNode.properties).length > 0) {
        systemMessage += `- Properties:\n`;
        Object.entries(selectedNode.properties).forEach(([key, value]) => {
          systemMessage += `  - ${key}: ${value}\n`;
        });
      }
      
      // Find connected nodes
      const connectedEdges = graphContext.edges.filter(
        edge => edge.source === selectedNode.id || edge.target === selectedNode.id
      );
      
      if (connectedEdges.length > 0) {
        systemMessage += `\nConnections:\n`;
        connectedEdges.forEach(edge => {
          const isOutgoing = edge.source === selectedNode.id;
          const connectedNodeId = isOutgoing ? edge.target : edge.source;
          const connectedNode = graphContext.nodes.find(n => n.id === connectedNodeId);
          
          if (connectedNode) {
            if (isOutgoing) {
              systemMessage += `- [${selectedNode.label}] --(${edge.label})--> [${connectedNode.label}]\n`;
            } else {
              systemMessage += `- [${connectedNode.label}] --(${edge.label})--> [${selectedNode.label}]\n`;
            }
          }
        });
      }
    }
  }
  
  return systemMessage;
}