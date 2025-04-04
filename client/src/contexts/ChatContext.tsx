import React, { createContext, useContext, useState, ReactNode } from 'react';

// Import types from the shared schema
interface Node {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  subgraphIds?: string[];
  labelDetail?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
  subgraphIds?: string[];
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
  subgraphCounter?: number;
  metadata?: Record<string, any>;
}

// Define the chat message structure
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  graphAnalysis?: any;
}

// Define the context structure
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  graphContext: Graph | null;
  selectedNode: any | null;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setGraphContext: (graph: Graph | null) => void;
  setSelectedNode: (node: any | null) => void;
  applyChangesToGraph: (changes: any) => void;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Create a provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [graphContext, setGraphContext] = useState<Graph | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Add a new message to the chat
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Send a message to the API
  const sendMessage = async (content: string) => {
    // Add user message to chat
    addMessage({ role: 'user', content });
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send request to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          graphContext,
          selectedNodeContext: selectedNode,
          promptSource: 'graph_explorer',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Add assistant message to chat
      addMessage({
        role: 'assistant',
        content: data.message,
        graphAnalysis: data.graphAnalysis,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      addMessage({
        role: 'system',
        content: `Error: Failed to get a response. ${error}`,
      });
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };

  // Apply changes to the graph (if needed)
  const applyChangesToGraph = (changes: any) => {
    if (!graphContext) return;
    
    // This is a placeholder for graph modification logic
    // In a real implementation, you would handle merging suggested nodes/edges into the graph
    console.log('Applying changes to graph:', changes);
    
    // Notify user that changes are applied
    addMessage({
      role: 'system',
      content: 'Changes applied to the graph.',
    });
  };

  // Create the context value
  const value = {
    messages,
    isLoading,
    graphContext,
    selectedNode,
    addMessage,
    sendMessage,
    clearMessages,
    setGraphContext,
    setSelectedNode,
    applyChangesToGraph,
  };

  // Provide the context to children
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Create a custom hook to use the context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}