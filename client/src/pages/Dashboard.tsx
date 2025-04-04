import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuthStore } from '../stores/auth';
import { 
  PlusCircle, 
  BarChart2, 
  Share2, 
  Users, 
  Clock,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// For demo purposes - would be replaced with real data from the API
interface GraphSummary {
  id: number;
  name: string;
  nodeCount: number;
  edgeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: string;
  sharedWith?: string[];
  thumbnail?: string;
}

// Mock data
const mockMyGraphs: GraphSummary[] = [
  {
    id: 1,
    name: "AI Research Map",
    nodeCount: 48,
    edgeCount: 62,
    isPublic: false,
    createdAt: "2025-03-28T14:22:36Z",
    updatedAt: "2025-04-02T09:15:22Z"
  },
  {
    id: 2,
    name: "Product Strategy",
    nodeCount: 28,
    edgeCount: 35,
    isPublic: false,
    createdAt: "2025-03-25T10:12:06Z",
    updatedAt: "2025-04-01T16:44:12Z",
    sharedWith: ["Team Alpha", "Marketing"]
  },
  {
    id: 3,
    name: "Market Analysis 2025",
    nodeCount: 72,
    edgeCount: 98,
    isPublic: true,
    createdAt: "2025-03-15T08:47:29Z",
    updatedAt: "2025-03-30T12:22:18Z"
  }
];

const mockSharedGraphs: GraphSummary[] = [
  {
    id: 4,
    name: "Competitive Landscape",
    nodeCount: 56,
    edgeCount: 78,
    isPublic: false,
    createdAt: "2025-03-20T11:36:47Z",
    updatedAt: "2025-04-03T08:14:55Z",
    owner: "Sarah J."
  },
  {
    id: 5,
    name: "Project Dependencies",
    nodeCount: 34,
    edgeCount: 41,
    isPublic: false,
    createdAt: "2025-03-22T14:28:11Z",
    updatedAt: "2025-03-29T15:32:08Z",
    owner: "Mike T."
  }
];

const mockPublicGraphs: GraphSummary[] = [
  {
    id: 6,
    name: "COVID-19 Research Network",
    nodeCount: 128,
    edgeCount: 215,
    isPublic: true,
    createdAt: "2025-03-05T09:12:47Z",
    updatedAt: "2025-04-01T10:28:33Z",
    owner: "Research Team"
  },
  {
    id: 7,
    name: "Global Supply Chain Map",
    nodeCount: 86,
    edgeCount: 112,
    isPublic: true,
    createdAt: "2025-03-12T16:35:22Z",
    updatedAt: "2025-03-28T11:47:09Z",
    owner: "Industry Consortium"
  },
  {
    id: 8,
    name: "Technology Trend Analysis",
    nodeCount: 64,
    edgeCount: 93,
    isPublic: true,
    createdAt: "2025-03-18T08:44:15Z",
    updatedAt: "2025-03-31T14:22:41Z",
    owner: "Tech Analysts Group"
  }
];

// Graph card component for reuse
const GraphCard = ({ graph, showOwner = false }: { graph: GraphSummary, showOwner?: boolean }) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{graph.name}</h3>
          {showOwner && graph.owner && (
            <p className="text-sm text-gray-500 mt-0.5">Created by {graph.owner}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/graph-v2?id=${graph.id}`}>Open Graph</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/analytics?id=${graph.id}`}>View Analytics</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex gap-3 mt-3 text-sm text-gray-500">
        <div>{graph.nodeCount} nodes</div>
        <div>{graph.edgeCount} edges</div>
        {graph.isPublic && <div className="text-green-600">Public</div>}
        {!graph.isPublic && graph.sharedWith && <div className="text-blue-600">Shared</div>}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>Updated {timeAgo(graph.updatedAt)}</span>
        </div>
        
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" asChild className="h-7 px-2">
            <Link href={`/graph-v2?id=${graph.id}`}>
              Open
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-7 px-2">
            <Link href={`/analytics?id=${graph.id}`}>
              <BarChart2 size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-graphs');

  // Filter graphs based on search query
  const filteredMyGraphs = mockMyGraphs.filter(graph => 
    graph.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSharedGraphs = mockSharedGraphs.filter(graph => 
    graph.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPublicGraphs = mockPublicGraphs.filter(graph => 
    graph.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth?tab=login';
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in to access your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.username || 'User'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/graph-v2">
              <PlusCircle size={16} className="mr-2" />
              New Graph
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/analytics">
              <BarChart2 size={16} className="mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar - Stats summary */}
        <div className="md:col-span-1">
          <Card className="p-4 mb-4">
            <h2 className="font-semibold mb-4">Your Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Total Graphs</div>
                <div className="font-medium">{mockMyGraphs.length}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Shared With You</div>
                <div className="font-medium">{mockSharedGraphs.length}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Public Graphs</div>
                <div className="font-medium">{mockPublicGraphs.length}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Total Nodes</div>
                <div className="font-medium">
                  {mockMyGraphs.reduce((sum, graph) => sum + graph.nodeCount, 0)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Total Edges</div>
                <div className="font-medium">
                  {mockMyGraphs.reduce((sum, graph) => sum + graph.edgeCount, 0)}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-gray-700">Sarah shared "Project Dependencies" with you</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-green-700" />
                </div>
                <div>
                  <p className="text-gray-700">You updated "AI Research Map"</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={14} className="text-purple-700" />
                </div>
                <div>
                  <p className="text-gray-700">New analytics available for "Market Analysis 2025"</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main content - Graphs */}
        <div className="md:col-span-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search graphs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter size={14} className="mr-1" />
                Filter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort By: Recent
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem>Oldest</DropdownMenuItem>
                  <DropdownMenuItem>Alphabetical (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Most Nodes</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs 
            defaultValue="my-graphs" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="my-graphs">My Graphs</TabsTrigger>
              <TabsTrigger value="shared">Shared With Me</TabsTrigger>
              <TabsTrigger value="public">Public Graphs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-graphs" className="space-y-4">
              {filteredMyGraphs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <PlusCircle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No graphs found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery 
                      ? `No results for "${searchQuery}"`
                      : "Create your first graph to get started"}
                  </p>
                  <Button asChild>
                    <Link href="/graph-v2">
                      Create New Graph
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMyGraphs.map(graph => (
                    <GraphCard key={graph.id} graph={graph} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="space-y-4">
              {filteredSharedGraphs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Share2 size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No shared graphs</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery 
                      ? `No results for "${searchQuery}"`
                      : "Graphs shared with you will appear here"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSharedGraphs.map(graph => (
                    <GraphCard key={graph.id} graph={graph} showOwner={true} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="public" className="space-y-4">
              {filteredPublicGraphs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No public graphs</h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery 
                      ? `No results for "${searchQuery}"`
                      : "Public graphs from the community will appear here"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPublicGraphs.map(graph => (
                    <GraphCard key={graph.id} graph={graph} showOwner={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}