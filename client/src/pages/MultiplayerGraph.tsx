import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import { useToast } from '../hooks/use-toast';
import MultiplayerGraphPanel from '../components/MultiplayerGraphPanel';
import { Graph, Node, Edge } from '../types/graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Plus, LogIn, LogOut, X, Edit2 } from 'lucide-react';

interface User {
  userId: number;
  username: string;
  color?: string;
}

interface ChatMessage {
  user: User;
  message: string;
  timestamp: string;
}

interface RoomInfo {
  id: string;
  name: string;
  users: User[];
  createdBy: string;
  isPublic: boolean;
}

interface EditInfo {
  userId: number;
  username: string;
  elementId: string;
  elementType: 'node' | 'edge';
  isEditing: boolean;
}

export default function MultiplayerGraph() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [editingElements, setEditingElements] = useState<Record<string, EditInfo>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return;
    
    const newSocket = io('/', {
      auth: {
        token
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      
      // Identify the user
      newSocket.emit('identify', {
        userId: user.id,
        username: user.username
      });
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server. Please try again.',
        variant: 'destructive'
      });
    });
    
    newSocket.on('rooms', (roomsList: RoomInfo[]) => {
      setRooms(roomsList);
    });
    
    newSocket.on('roomJoined', (room: RoomInfo, initialGraph: Graph) => {
      setCurrentRoom(room);
      setGraph(initialGraph);
      setChatMessages([]); // Clear chat when joining a new room
      
      toast({
        title: 'Room Joined',
        description: `You have joined the room: ${room.name}`,
      });
    });
    
    newSocket.on('userJoined', (updatedRoom: RoomInfo) => {
      setCurrentRoom(updatedRoom);
      
      const newUser = updatedRoom.users.find(u => !currentRoom?.users.some(cu => cu.userId === u.userId));
      if (newUser) {
        toast({
          title: 'User Joined',
          description: `${newUser.username} has joined the room`,
        });
      }
    });
    
    newSocket.on('userLeft', (updatedRoom: RoomInfo) => {
      setCurrentRoom(updatedRoom);
      
      // Could show who left but we don't have that info directly
      toast({
        title: 'User Left',
        description: `A user has left the room`,
      });
    });
    
    newSocket.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    newSocket.on('graphUpdated', (updatedGraph: Graph) => {
      setGraph(updatedGraph);
    });
    
    newSocket.on('editingElement', (editInfo: EditInfo) => {
      setEditingElements(prev => {
        const newState = { ...prev };
        
        if (editInfo.isEditing) {
          newState[editInfo.elementId] = editInfo;
        } else {
          delete newState[editInfo.elementId];
        }
        
        return newState;
      });
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [user, token, toast]);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  const createRoom = useCallback(() => {
    if (!socket || !roomName.trim()) return;
    
    socket.emit('createRoom', { name: roomName, isPublic }, (success: boolean, roomData?: RoomInfo) => {
      if (success && roomData) {
        setRoomName('');
        setCreateRoomOpen(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create room. Please try again.',
          variant: 'destructive'
        });
      }
    });
  }, [socket, roomName, isPublic, toast]);
  
  const joinRoom = useCallback((roomId: string) => {
    if (!socket) return;
    
    socket.emit('joinRoom', roomId, (success: boolean) => {
      if (!success) {
        toast({
          title: 'Error',
          description: 'Failed to join room. Please try again.',
          variant: 'destructive'
        });
      }
    });
  }, [socket, toast]);
  
  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoom) return;
    
    socket.emit('leaveRoom', currentRoom.id);
    setCurrentRoom(null);
    setGraph({ nodes: [], edges: [] });
    setChatMessages([]);
    setEditingElements({});
  }, [socket, currentRoom]);
  
  const sendMessage = useCallback(() => {
    if (!socket || !currentRoom || !message.trim()) return;
    
    socket.emit('sendMessage', {
      roomId: currentRoom.id,
      message: message.trim()
    });
    
    setMessage('');
  }, [socket, currentRoom, message]);
  
  const handleUpdateGraph = useCallback((updatedGraph: Graph) => {
    if (!socket || !currentRoom) return;
    
    setGraph(updatedGraph);
    socket.emit('updateGraph', {
      roomId: currentRoom.id,
      graph: updatedGraph
    });
  }, [socket, currentRoom]);
  
  const handleElementEditStart = useCallback((id: string, type: 'node' | 'edge') => {
    if (!socket || !currentRoom) return;
    
    socket.emit('startEditing', {
      roomId: currentRoom.id,
      elementId: id,
      elementType: type
    });
  }, [socket, currentRoom]);
  
  const handleElementEditStop = useCallback((id: string, type: 'node' | 'edge') => {
    if (!socket || !currentRoom) return;
    
    socket.emit('stopEditing', {
      roomId: currentRoom.id,
      elementId: id,
      elementType: type
    });
  }, [socket, currentRoom]);
  
  const addNode = useCallback(() => {
    if (!graph) return;
    
    const newNode: Node = {
      id: `n${Date.now()}`,
      label: 'New Node',
      type: 'Default',
      properties: {},
      x: Math.random() * 800,
      y: Math.random() * 600
    };
    
    handleUpdateGraph({
      ...graph,
      nodes: [...graph.nodes, newNode]
    });
  }, [graph, handleUpdateGraph]);
  
  const addEdge = useCallback(() => {
    if (!graph || graph.nodes.length < 2) return;
    
    // Get two random nodes
    const sourceIndex = Math.floor(Math.random() * graph.nodes.length);
    let targetIndex = Math.floor(Math.random() * graph.nodes.length);
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * graph.nodes.length);
    }
    
    const source = graph.nodes[sourceIndex];
    const target = graph.nodes[targetIndex];
    
    const newEdge: Edge = {
      id: `e${Date.now()}`,
      source: source.id,
      target: target.id,
      label: 'connects to',
      properties: {}
    };
    
    handleUpdateGraph({
      ...graph,
      edges: [...graph.edges, newEdge]
    });
  }, [graph, handleUpdateGraph]);
  
  // Get the editing status info for a node/edge
  const getEditingInfo = (id: string) => {
    return editingElements[id];
  };
  
  if (!user || !token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please Log in</h1>
        <p>You need to be logged in to use the multiplayer graph feature.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Graph</h1>
      
      {!currentRoom ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Rooms</h2>
            
            <Dialog open={createRoomOpen} onOpenChange={setCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isPublic">Public room (visible to all users)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateRoomOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRoom} disabled={!roomName.trim()}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {rooms.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500">No public rooms available. Create a new room to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <Card key={room.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-500">Created by: {room.createdBy}</p>
                    </div>
                    <Badge variant={room.isPublic ? "default" : "outline"}>
                      {room.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{room.users.length} users connected</span>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => joinRoom(room.id)} className="w-full">
                      <LogIn className="mr-2 h-4 w-4" /> Join Room
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">{currentRoom.name}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-1 h-4 w-4" /> 
                  {currentRoom.users.length} users connected
                </div>
              </div>
              <Button variant="destructive" onClick={leaveRoom}>
                <LogOut className="mr-2 h-4 w-4" /> Leave Room
              </Button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button size="sm" onClick={addNode}>
                Add Node
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addEdge}
                disabled={graph.nodes.length < 2}
              >
                Add Edge
              </Button>
            </div>
            
            <div className="rounded-lg border overflow-hidden h-[600px] bg-white dark:bg-gray-950">
              <MultiplayerGraphPanel 
                graph={graph} 
                onGraphChange={handleUpdateGraph}
                onNodeEditStart={(id) => handleElementEditStart(id, 'node')}
                onNodeEditEnd={(id) => handleElementEditStop(id, 'node')}
                onEdgeEditStart={(id) => handleElementEditStart(id, 'edge')}
                onEdgeEditEnd={(id) => handleElementEditStop(id, 'edge')}
                getEditingInfo={getEditingInfo}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Tabs defaultValue="chat">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  <Users className="mr-2 h-4 w-4" /> Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-4">
                <Card className="h-[500px] flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-20">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: msg.user.color || 'currentColor' }}>
                                {msg.user.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="mt-1">{msg.message}</p>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={!message.trim()}>Send</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="mt-4">
                <Card className="h-[500px]">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {currentRoom.users.map(user => (
                        <div key={user.userId} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: user.color || '#888' }}
                            />
                            <span className="font-medium">{user.username}</span>
                          </div>
                          {user.userId === parseInt(currentRoom.createdBy) && (
                            <Badge>Owner</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>
            </Tabs>
            
            {Object.keys(editingElements).length > 0 && (
              <Card className="mt-4 p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Edit2 className="mr-2 h-4 w-4" /> Currently Editing
                </h3>
                <div className="space-y-2">
                  {Object.values(editingElements).map(info => (
                    <div key={info.elementId} className="flex items-center justify-between text-sm p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span style={{ color: currentRoom.users.find(u => u.userId === info.userId)?.color }}>
                          {info.username}
                        </span>
                        <span className="text-gray-500">is editing a {info.elementType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}