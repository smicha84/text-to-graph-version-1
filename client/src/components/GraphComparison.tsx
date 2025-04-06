import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Graph } from '@/types/graph';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRightLeft, Clock, User, Users } from 'lucide-react';
import GraphPanel from '@/components/GraphPanel';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface GraphComparisonProps {
  currentGraph: Graph | null;
  userId?: string;
  sessionId?: string;
}

interface GraphSnapshot {
  id: string;
  name: string;
  createdAt: string;
  userId?: string;
  graph: Graph;
}

export default function GraphComparison({ currentGraph, userId, sessionId }: GraphComparisonProps) {
  const { toast } = useToast();
  const [selectedGraphA, setSelectedGraphA] = useState<Graph | null>(currentGraph);
  const [selectedGraphB, setSelectedGraphB] = useState<Graph | null>(null);
  const [graphSnapshots, setGraphSnapshots] = useState<GraphSnapshot[]>([]);
  const [userGraphs, setUserGraphs] = useState<GraphSnapshot[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [comparisonTab, setComparisonTab] = useState<string>('side-by-side');
  
  // Fetch historic graph snapshots
  const fetchGraphSnapshots = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/graph/snapshots', {
        method: 'GET'
      });
      return response.json();
    },
    onSuccess: (data: GraphSnapshot[]) => {
      setGraphSnapshots(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error fetching graph snapshots',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Fetch personal user graphs
  const fetchUserGraphs = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/graph/user', {
        method: 'GET'
      });
      return response.json();
    },
    onSuccess: (data: GraphSnapshot[]) => {
      setUserGraphs(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error fetching user graphs',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Save current graph as a snapshot
  const saveGraphSnapshot = useMutation({
    mutationFn: async () => {
      if (!currentGraph) return null;
      
      const response = await apiRequest('/api/graph/snapshots', {
        method: 'POST',
        body: JSON.stringify({
          name: snapshotName || `Snapshot ${new Date().toLocaleString()}`,
          graph: currentGraph
        })
      });
      return response.json();
    },
    onSuccess: (data: GraphSnapshot) => {
      toast({
        title: 'Snapshot saved',
        description: `Graph snapshot "${data.name}" saved successfully`
      });
      setSaveDialogOpen(false);
      setSnapshotName('');
      // Refresh snapshots
      fetchGraphSnapshots.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving snapshot',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Load graph to comparison slot
  const loadGraphSnapshot = (graph: Graph, slot: 'A' | 'B') => {
    if (slot === 'A') {
      setSelectedGraphA(graph);
    } else {
      setSelectedGraphB(graph);
    }
  };
  
  useEffect(() => {
    fetchGraphSnapshots.mutate();
    fetchUserGraphs.mutate();
    
    // Always keep current graph updated in slot A if that's selected
    if (!selectedGraphB) {
      setSelectedGraphA(currentGraph);
    }
  }, [currentGraph]);
  
  // Comparison stats between two graphs
  const comparisonStats = () => {
    if (!selectedGraphA || !selectedGraphB) return null;
    
    const graphA = selectedGraphA;
    const graphB = selectedGraphB;
    
    // Basic counts
    const nodesA = graphA.nodes.length;
    const nodesB = graphB.nodes.length;
    const edgesA = graphA.edges.length;
    const edgesB = graphB.edges.length;
    
    // Node overlap
    const nodeIdsA = new Set(graphA.nodes.map(n => n.id));
    const nodeIdsB = new Set(graphB.nodes.map(n => n.id));
    const nodeIdsAArray = Array.from(nodeIdsA);
    const commonNodeIds = new Set(nodeIdsAArray.filter(id => nodeIdsB.has(id)));
    
    // Edge overlap (by matching source-target-label)
    const edgeKeysA = new Set(graphA.edges.map(e => `${e.source}-${e.target}-${e.label}`));
    const edgeKeysB = new Set(graphB.edges.map(e => `${e.source}-${e.target}-${e.label}`));
    const edgeKeysAArray = Array.from(edgeKeysA);
    const commonEdgeKeys = new Set(edgeKeysAArray.filter(key => edgeKeysB.has(key)));
    
    // Unique nodes and edges
    const uniqueNodesA = nodesA - commonNodeIds.size;
    const uniqueNodesB = nodesB - commonNodeIds.size;
    const uniqueEdgesA = edgesA - commonEdgeKeys.size;
    const uniqueEdgesB = edgesB - commonEdgeKeys.size;
    
    return {
      nodesA,
      nodesB,
      edgesA,
      edgesB,
      commonNodes: commonNodeIds.size,
      commonEdges: commonEdgeKeys.size,
      uniqueNodesA,
      uniqueNodesB,
      uniqueEdgesA,
      uniqueEdgesB,
      // Node type distribution between graphs could also be added
    };
  };
  
  const stats = comparisonStats();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Graph Comparison</CardTitle>
        <CardDescription>
          Compare the current graph with historical snapshots or personal graphs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Controls for selecting graphs to compare */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Graph A</Label>
              <Select 
                value="current" 
                onValueChange={(value) => {
                  if (value === 'current') {
                    setSelectedGraphA(currentGraph);
                  } else {
                    const [source, id] = value.split(':');
                    const snapshot = source === 'snapshot' 
                      ? graphSnapshots.find(s => s.id === id)
                      : userGraphs.find(s => s.id === id);
                    
                    if (snapshot) {
                      loadGraphSnapshot(snapshot.graph, 'A');
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select graph A" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Working Graph</SelectItem>
                  <SelectItem value="empty" disabled>
                    --- Session Snapshots ---
                  </SelectItem>
                  {graphSnapshots.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={`snapshot:${snapshot.id}`}>
                      {snapshot.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="empty2" disabled>
                    --- Your Personal Graphs ---
                  </SelectItem>
                  {userGraphs.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={`user:${snapshot.id}`}>
                      {snapshot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Graph B</Label>
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value === 'current') {
                    setSelectedGraphB(currentGraph);
                  } else {
                    const [source, id] = value.split(':');
                    const snapshot = source === 'snapshot' 
                      ? graphSnapshots.find(s => s.id === id)
                      : userGraphs.find(s => s.id === id);
                    
                    if (snapshot) {
                      loadGraphSnapshot(snapshot.graph, 'B');
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select graph B" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Working Graph</SelectItem>
                  <SelectItem value="empty" disabled>
                    --- Session Snapshots ---
                  </SelectItem>
                  {graphSnapshots.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={`snapshot:${snapshot.id}`}>
                      {snapshot.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="empty2" disabled>
                    --- Your Personal Graphs ---
                  </SelectItem>
                  {userGraphs.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={`user:${snapshot.id}`}>
                      {snapshot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Save Current Graph as Snapshot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Graph Snapshot</DialogTitle>
                    <DialogDescription>
                      Enter a name for this graph snapshot
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="snapshot-name">Snapshot Name</Label>
                      <Input
                        id="snapshot-name"
                        placeholder="e.g., Project Milestone 1"
                        value={snapshotName}
                        onChange={(e) => setSnapshotName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveGraphSnapshot.mutate()}
                      disabled={saveGraphSnapshot.isPending}
                    >
                      {saveGraphSnapshot.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Snapshot'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  // Swap A and B
                  const temp = selectedGraphA;
                  setSelectedGraphA(selectedGraphB);
                  setSelectedGraphB(temp);
                }}
                disabled={!selectedGraphB}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* No graph B selected */}
          {!selectedGraphB && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Select a second graph in "Graph B" to enable comparison
              </p>
            </div>
          )}
          
          {/* Comparison View */}
          {selectedGraphB && (
            <>
              <Tabs value={comparisonTab} onValueChange={setComparisonTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                  <TabsTrigger value="stats">Comparison Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="side-by-side" className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-2">
                      <h3 className="font-semibold mb-2">Graph A</h3>
                      <div className="h-[400px]">
                        {selectedGraphA && (
                          <GraphPanel 
                            graph={selectedGraphA}
                            isLoading={false}
                            onElementSelect={() => {}}
                            onShowExportModal={() => {}}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-2">
                      <h3 className="font-semibold mb-2">Graph B</h3>
                      <div className="h-[400px]">
                        {selectedGraphB && (
                          <GraphPanel 
                            graph={selectedGraphB}
                            isLoading={false}
                            onElementSelect={() => {}}
                            onShowExportModal={() => {}}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="pt-4">
                  {stats && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="py-2">
                            <CardTitle className="text-lg">Graph A</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">Nodes: <span className="font-bold">{stats.nodesA}</span></div>
                              <div className="text-sm">Edges: <span className="font-bold">{stats.edgesA}</span></div>
                              <div className="text-sm">Unique Nodes: <span className="font-bold">{stats.uniqueNodesA}</span></div>
                              <div className="text-sm">Unique Edges: <span className="font-bold">{stats.uniqueEdgesA}</span></div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="py-2">
                            <CardTitle className="text-lg">Graph B</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">Nodes: <span className="font-bold">{stats.nodesB}</span></div>
                              <div className="text-sm">Edges: <span className="font-bold">{stats.edgesB}</span></div>
                              <div className="text-sm">Unique Nodes: <span className="font-bold">{stats.uniqueNodesB}</span></div>
                              <div className="text-sm">Unique Edges: <span className="font-bold">{stats.uniqueEdgesB}</span></div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-lg">Overlap Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm">Common Nodes: <span className="font-bold">{stats.commonNodes}</span></div>
                              <div className="text-sm">Common Edges: <span className="font-bold">{stats.commonEdges}</span></div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                Node Overlap: <span className="font-bold">
                                  {stats.nodesA > 0 
                                    ? ((stats.commonNodes / stats.nodesA) * 100).toFixed(1) 
                                    : 0}%
                                </span>
                              </div>
                              <div className="text-sm">
                                Edge Overlap: <span className="font-bold">
                                  {stats.edgesA > 0 
                                    ? ((stats.commonEdges / stats.edgesA) * 100).toFixed(1) 
                                    : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}