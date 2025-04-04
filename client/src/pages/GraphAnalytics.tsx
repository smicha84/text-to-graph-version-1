import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/auth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

// Type definitions
interface GraphAnalytic {
  id: number;
  graphId: number;
  graphType: 'user_graph' | 'multi_user_graph';
  metricType: 'centrality' | 'density' | 'clustering' | 'path_length' | 'communities';
  metricValue: any;
  timestamp: string;
  parameters?: Record<string, any>;
}

interface GraphSummary {
  id: number;
  name: string;
  nodeCount: number;
  edgeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: string;
}

// COLORS for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function GraphAnalytics() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedGraph, setSelectedGraph] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d', 'all'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's graphs
  const { data: userGraphs, isLoading: loadingGraphs } = useQuery({
    queryKey: ['/api/graphs/user'],
    enabled: !!isAuthenticated,
  });

  // Fetch analytics for the selected graph
  const { data: graphAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['/api/graphs/analytics', selectedGraph, timeRange],
    enabled: !!selectedGraph,
  });

  // Calculate mock data for demonstration (until real analytics are implemented)
  const generateMockAnalytics = (graphId: number) => {
    // This is a placeholder function that would be replaced with real API calls
    
    // For demo, we generate some sample analytics
    const centrality = [
      { name: 'Node 1', value: 0.85 },
      { name: 'Node 2', value: 0.72 },
      { name: 'Node 3', value: 0.68 },
      { name: 'Node 4', value: 0.63 },
      { name: 'Node 5', value: 0.42 },
    ];
    
    const nodeTypeCounts = [
      { name: 'Person', count: 12 },
      { name: 'Organization', count: 8 },
      { name: 'Location', count: 6 },
      { name: 'Event', count: 4 },
      { name: 'Concept', count: 7 },
    ];
    
    const relationshipCounts = [
      { name: 'WORKS_AT', count: 10 },
      { name: 'LOCATED_IN', count: 8 },
      { name: 'KNOWS', count: 15 },
      { name: 'ATTENDED', count: 6 },
      { name: 'RELATED_TO', count: 9 },
    ];
    
    const growthData = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        nodes: 10 + Math.floor(Math.random() * 5) + i,
        edges: 15 + Math.floor(Math.random() * 8) + i * 2,
      };
    });
    
    return {
      centrality,
      nodeTypeCounts,
      relationshipCounts,
      growthData,
      communityDetection: Math.random() > 0.5 ? 3 : 4, // Number of communities
      averagePathLength: (2 + Math.random() * 2).toFixed(2), // Between 2 and 4
      clusteringCoefficient: (0.3 + Math.random() * 0.4).toFixed(2), // Between 0.3 and 0.7
      density: (0.1 + Math.random() * 0.3).toFixed(2), // Between 0.1 and 0.4
    };
  };
  
  // Mock list of graphs (will be replaced with actual data)
  const mockGraphs: GraphSummary[] = [
    {
      id: 1,
      name: 'Project Organization',
      nodeCount: 42,
      edgeCount: 65,
      isPublic: true,
      createdAt: '2025-03-15T10:00:00Z',
      updatedAt: '2025-03-20T14:30:00Z',
    },
    {
      id: 2,
      name: 'Knowledge Base',
      nodeCount: 78,
      edgeCount: 124,
      isPublic: false,
      createdAt: '2025-02-25T09:15:00Z',
      updatedAt: '2025-04-01T11:20:00Z',
    },
    {
      id: 3,
      name: 'Research Network',
      nodeCount: 35,
      edgeCount: 47,
      isPublic: true,
      createdAt: '2025-03-28T16:45:00Z',
      updatedAt: '2025-04-02T13:10:00Z',
    }
  ];
  
  // Use real data when available, otherwise use mock data
  const graphs = userGraphs || mockGraphs;
  
  // Handle graph selection
  const handleGraphSelect = (graphId: number) => {
    setSelectedGraph(graphId);
  };
  
  // Generated analytics data
  const analyticsData = selectedGraph ? generateMockAnalytics(selectedGraph) : null;
  
  // Find the selected graph
  const currentGraph = graphs.find((g: GraphSummary) => g.id === selectedGraph);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Graph Analytics Dashboard</h1>
        <div className="text-sm text-gray-600">
          {isAuthenticated && user ? (
            <span>Welcome, {user.username}</span>
          ) : (
            <span>Please sign in to save your analytics</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Graph Selection */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Your Graphs</h2>
            {loadingGraphs ? (
              <div className="py-4 text-center text-gray-500">Loading graphs...</div>
            ) : (
              <div className="space-y-2">
                {graphs.map((graph: GraphSummary) => (
                  <div 
                    key={graph.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedGraph === graph.id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleGraphSelect(graph.id)}
                  >
                    <div className="font-medium">{graph.name}</div>
                    <div className="text-xs mt-1 flex justify-between">
                      <span>{graph.nodeCount} nodes</span>
                      <span>{graph.edgeCount} edges</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {selectedGraph && (
            <Card className="p-4 mt-4">
              <h3 className="font-medium">Time Range</h3>
              <div className="grid grid-cols-4 gap-1 mt-2">
                <button 
                  className={`px-2 py-1 text-xs rounded ${timeRange === '24h' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  onClick={() => setTimeRange('24h')}
                >
                  24h
                </button>
                <button 
                  className={`px-2 py-1 text-xs rounded ${timeRange === '7d' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  onClick={() => setTimeRange('7d')}
                >
                  7d
                </button>
                <button 
                  className={`px-2 py-1 text-xs rounded ${timeRange === '30d' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  onClick={() => setTimeRange('30d')}
                >
                  30d
                </button>
                <button 
                  className={`px-2 py-1 text-xs rounded ${timeRange === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  onClick={() => setTimeRange('all')}
                >
                  All
                </button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {!selectedGraph ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Graph</h3>
              <p className="text-gray-500">Choose a graph from the sidebar to view analytics</p>
            </div>
          ) : (
            <>
              <Card className="p-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{currentGraph?.name}</h2>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    Last updated: {new Date(currentGraph?.updatedAt || '').toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm">Nodes</div>
                    <div className="text-2xl font-bold">{currentGraph?.nodeCount}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm">Edges</div>
                    <div className="text-2xl font-bold">{currentGraph?.edgeCount}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-sm">Density</div>
                    <div className="text-2xl font-bold">{analyticsData?.density}</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="text-amber-600 text-sm">Communities</div>
                    <div className="text-2xl font-bold">{analyticsData?.communityDetection}</div>
                  </div>
                </div>
              </Card>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="structure">Structure Analysis</TabsTrigger>
                  <TabsTrigger value="centrality">Centrality</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Growth Chart */}
                    <Card className="p-4 col-span-2">
                      <h3 className="text-lg font-medium mb-4">Graph Growth</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={analyticsData?.growthData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="nodes" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="edges" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                    
                    {/* Node Types */}
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Node Types</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={analyticsData?.nodeTypeCounts}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                    
                    {/* Relationship Types */}
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Relationship Types</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={analyticsData?.relationshipCounts}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="structure">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-medium mb-3">Network Properties</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Density</span>
                            <span className="font-medium">{analyticsData?.density}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${parseFloat(analyticsData?.density || '0') * 100 * 2.5}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Ratio of actual connections to possible connections
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Clustering Coefficient</span>
                            <span className="font-medium">{analyticsData?.clusteringCoefficient}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${parseFloat(analyticsData?.clusteringCoefficient || '0') * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Measure of how nodes tend to cluster together
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Path Length</span>
                            <span className="font-medium">{analyticsData?.averagePathLength}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${parseFloat(analyticsData?.averagePathLength || '0') * 25}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Average number of steps along the shortest paths
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h3 className="text-lg font-medium mb-3">Community Detection</h3>
                      <div className="flex items-center justify-center h-[200px]">
                        <div className="relative w-48 h-48">
                          <div className="absolute w-full h-full rounded-full border border-dashed border-gray-300"></div>
                          
                          {/* This would be replaced with actual visualization of communities */}
                          <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs">
                            8 nodes
                          </div>
                          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-xs">
                            12 nodes
                          </div>
                          <div className="absolute bottom-1/4 right-1/4 w-14 h-14 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-xs">
                            10 nodes
                          </div>
                          {analyticsData?.communityDetection === 4 && (
                            <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs">
                              6 nodes
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="font-medium">
                          {analyticsData?.communityDetection} Communities Detected
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Groups of nodes with dense connections internally and sparser connections between groups
                        </p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="centrality">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Node Centrality</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Nodes with higher centrality scores are more influential in the network
                      </p>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={analyticsData?.centrality}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 1]} />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Top Influencers</h3>
                      <div className="space-y-4">
                        {analyticsData?.centrality.slice(0, 3).map((node, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-200 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">{node.name}</div>
                              <div className="text-sm text-gray-600 mt-1">Centrality: {node.value.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800">Interpretation</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          These nodes serve as critical connectors in your graph. Removing them would significantly
                          fragment the network.
                        </p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="distribution">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Node Type Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analyticsData?.nodeTypeCounts}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData?.nodeTypeCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Relationship Type Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analyticsData?.relationshipCounts}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData?.relationshipCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                    
                    <Card className="p-4 col-span-2">
                      <h3 className="text-lg font-medium mb-4">Connectivity Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800">Node Degree Distribution</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            Your graph follows a power-law distribution, typical of scale-free networks.
                            A small number of nodes have many connections, while most have few.
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800">Isolated Components</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            There {analyticsData?.communityDetection === 3 ? 'are no' : 'is one'} isolated component in your graph.
                            {analyticsData?.communityDetection === 4 && ' This suggests some nodes may not be well-integrated.'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800">Small World Properties</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            With high clustering ({analyticsData?.clusteringCoefficient}) and 
                            low average path length ({analyticsData?.averagePathLength}),
                            your graph exhibits small-world network characteristics.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}