import { useEffect, useState, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
// Import all types from client/src/types/graph.ts
import { 
  Graph, 
  Node, 
  Edge, 
  ExportOptions, 
  ExportFormat, 
  GraphGenerationOptions,
  WebSearchOptions
} from '@/types/graph';
import GraphPanel from '@/components/GraphPanel';
import InputPanel from '@/components/InputPanel';
import PropertyPanel from '@/components/PropertyPanel';
import ActivityTracker from '@/components/ActivityTracker';
import ExportModal from '@/components/ExportModal';
import { apiRequest } from '@/lib/queryClient';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Users } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface ActiveUser extends User {
  lastActive: Date;
  isTyping?: boolean;
  color?: string;
  selectedNodeId?: string | null;
}

// Use the GraphGenerationOptions and WebSearchOptions from @/types/graph

interface TextSegment {
  text: string;
  start: number;
  end: number;
}

export default function MultiPlayerGraph() {
  const { toast } = useToast();
  const socket = useRef<Socket | null>(null);
  
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedElements, setSelectedElements] = useState<{nodes: Node[], edges: Edge[]}>({ nodes: [], edges: [] });
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [chatMessages, setChatMessages] = useState<{user: string, message: string, timestamp: Date}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [options, setOptions] = useState<GraphGenerationOptions>({
    extractEntities: true,
    extractRelations: true,
    inferProperties: true,
    mergeEntities: true,
    generateOntology: true,
    generateTaxonomies: true,
    model: 'claude',
    useEntityMergingLLM: true,
    useEntityTypeLLM: true,
    useRelationInferenceLLM: true
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Initialize the socket connection
  useEffect(() => {
    // Setup the socket connection
    const newSocket = io('/');
    socket.current = newSocket;
    
    // Setup socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server socket');
      // Add a random username for demo purposes
      const username = `User_${Math.floor(Math.random() * 10000)}`;
      newSocket.emit('join', { username });
    });
    
    newSocket.on('user-joined', (userData: ActiveUser) => {
      toast({
        title: "User joined",
        description: `${userData.username} has joined the session`,
      });
      setActiveUsers(prev => [...prev, userData]);
    });
    
    newSocket.on('user-left', (userId: number) => {
      setActiveUsers(prev => prev.filter(user => user.id !== userId));
    });
    
    newSocket.on('graph-update', (updatedGraph: Graph) => {
      setGraph(updatedGraph);
    });
    
    newSocket.on('user-typing', (userId: number, isTyping: boolean) => {
      setActiveUsers(prev => 
        prev.map(user => user.id === userId ? { ...user, isTyping } : user)
      );
    });
    
    newSocket.on('chat-message', (username: string, message: string) => {
      setChatMessages(prev => [...prev, { 
        user: username, 
        message, 
        timestamp: new Date() 
      }]);
    });
    
    newSocket.on('select-node', (userId: number, nodeId: string | null) => {
      setActiveUsers(prev => 
        prev.map(user => user.id === userId ? { ...user, selectedNodeId: nodeId } : user)
      );
    });
    
    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [toast]);
  
  // Scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // API mutations
  const generateMutation = useMutation({
    mutationFn: async (data: { text: string, options: GraphGenerationOptions }) => {
      const response = await apiRequest('/api/generate-graph', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data: Graph, variables) => {
      setGraph(data);
      toast({
        title: "Graph generated",
        description: `Successfully generated graph with ${data.nodes.length} nodes and ${data.edges.length} edges`,
      });
      
      // Emit the graph update to all clients
      if (socket.current) {
        socket.current.emit('graph-update', data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating graph",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const exportMutation = useMutation({
    mutationFn: async ({ format, includeProperties, includeStyles }: ExportOptions) => {
      if (!graph) throw new Error("No graph available to export");
      
      const response = await apiRequest('/api/export-graph', {
        method: 'POST',
        body: JSON.stringify({
          graph,
          options: { format, includeProperties, includeStyles }
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Handle export success, e.g. download the file
      const blob = new Blob([data.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `graph-export.${data.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: `Graph exported successfully as ${data.format.toUpperCase()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const webSearchMutation = useMutation({
    mutationFn: async ({ nodeId, query }: WebSearchOptions) => {
      const response = await apiRequest('/api/web-search', {
        method: 'POST',
        body: JSON.stringify({
          nodeId,
          query,
          existingGraph: graph
        }),
      });
      return response.json();
    },
    onSuccess: (data: Graph) => {
      setGraph(data);
      toast({
        title: "Graph expanded",
        description: `Successfully expanded graph with web search results`,
      });
      
      // Emit the graph update to all clients
      if (socket.current) {
        socket.current.emit('graph-update', data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Web search failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  const handleGenerateGraph = (text: string, options: GraphGenerationOptions, segments?: TextSegment[]) => {
    generateMutation.mutate({ text, options });
  };
  
  const handleExportGraph = (options: ExportOptions) => {
    exportMutation.mutate(options);
  };
  
  const handleWebSearch = (nodeId: string, query: string) => {
    webSearchMutation.mutate({ nodeId, query });
  };
  
  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !socket.current) return;
    
    socket.current.emit('chat-message', chatInput);
    setChatInput('');
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };
  
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    
    // Handle typing indicator
    if (!isTyping && socket.current) {
      setIsTyping(true);
      socket.current.emit('user-typing', true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.current) {
        setIsTyping(false);
        socket.current.emit('user-typing', false);
      }
    }, 1000);
  };
  
  const handleElementSelect = (element: Node | Edge | null) => {
    if (element) {
      if ('source' in element) {
        // It's an edge
        setSelectedElements({ 
          nodes: [], 
          edges: [element as Edge] 
        });
      } else {
        // It's a node
        setSelectedElements({ 
          nodes: [element as Node], 
          edges: [] 
        });
        
        // Send the selected node to other users
        if (socket.current) {
          socket.current.emit('select-node', element.id);
        }
      }
    } else {
      // No selection
      setSelectedElements({ nodes: [], edges: [] });
      
      // Clear selection for other users
      if (socket.current) {
        socket.current.emit('select-node', null);
      }
    }
  };
  
  return (
    <div className="h-screen overflow-hidden">
      <div className="container mx-auto px-4 pt-5 h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Multi Player Graph</h1>
            
            <div className="flex items-center space-x-2">
              {/* User avatars with tooltips */}
              {activeUsers.map((user, idx) => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white relative"
                        style={{
                          backgroundColor: user.color || `hsl(${(idx * 137) % 360}, 70%, 60%)`,
                          outline: user.isTyping ? "2px solid #10b981" : "none",
                          outlineOffset: "2px"
                        }}
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{user.username}</p>
                      {user.selectedNodeId && graph?.nodes && <p className="text-xs opacity-70">Looking at: {
                        graph.nodes.find((n: Node) => n.id === user.selectedNodeId)?.label || 'Unknown node'
                      }</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            <Badge variant="outline" className="bg-white shadow-sm">
              <Users size={12} className="mr-1" /> {activeUsers.length} online
            </Badge>
          </div>
          
          <div className="flex flex-col h-full">
            {/* Graph panel */}
            <div className="flex-1 overflow-auto">
              <GraphPanel 
                graph={graph}
                isLoading={generateMutation.isPending || webSearchMutation.isPending}
                onElementSelect={handleElementSelect}
                onShowExportModal={() => setShowExportModal(true)}
                onWebSearch={handleWebSearch}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Export modal */}
      {showExportModal && (
        <ExportModal 
          graph={graph}
          onExport={handleExportGraph}
          onClose={() => setShowExportModal(false)}
          isExporting={exportMutation.isPending}
        />
      )}
    </div>
  );
}