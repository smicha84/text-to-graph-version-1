import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Trash2, Database } from "lucide-react";

interface ApiLog {
  id: number;
  timestamp: string;
  type: string;
  operation: string;
  requestData: any;
  responseData: any;
  statusCode: number;
  processingTimeMs: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LogsResponse {
  data: ApiLog[];
  pagination: PaginationInfo;
}

export default function LogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [operation, setOperation] = useState<string | undefined>(undefined);
  const [liveMode, setLiveMode] = useState(false);
  const [newLogIds, setNewLogIds] = useState<number[]>([]);
  const [sessionLogCount, setSessionLogCount] = useState(0);
  const previousLogsRef = useRef<number[]>([]);
  const refreshIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Query to fetch API logs
  const { data, isLoading, error, refetch } = useQuery<LogsResponse>({
    queryKey: ['api-logs', currentPage, operation],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '20');
      if (operation) {
        queryParams.append('operation', operation);
      }
      
      const response = await apiRequest('GET', `/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch API logs');
      }
      return response.json();
    },
    refetchInterval: liveMode ? 2000 : false, // Refetch every 2 seconds in live mode
  });
  
  // Mutation to clear logs
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/logs');
      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setSessionLogCount(0);
      setNewLogIds([]);
      previousLogsRef.current = [];
      toast({
        title: "Logs cleared",
        description: "All API logs have been cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to clear logs: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle live mode toggle
  useEffect(() => {
    if (liveMode) {
      // Always show the first page in live mode to see the newest logs
      setCurrentPage(1);
      
      // Reset the new logs tracking
      setNewLogIds([]);
      previousLogsRef.current = [];
      
      // Show a toast notification when live mode is activated
      toast({
        title: "Live Mode Activated",
        description: "Automatically refreshing logs every 2 seconds",
      });
    }
  }, [liveMode, toast]);
  
  // Track new logs in live mode
  useEffect(() => {
    if (!data || !liveMode) return;
    
    const currentLogIds = data.data.map(log => log.id);
    
    // If this is our first load in live mode, just record the IDs
    if (previousLogsRef.current.length === 0) {
      previousLogsRef.current = currentLogIds;
      return;
    }
    
    // Find logs that are new since the last update
    const newIds = currentLogIds.filter(id => !previousLogsRef.current.includes(id));
    
    if (newIds.length > 0) {
      // Update session log counter
      setSessionLogCount(prev => prev + newIds.length);
      
      // Play a subtle sound when new logs are received
      if (newIds.length === 1) {
        toast({
          title: "New Log Received",
          description: `${newIds.length} new log entry detected`,
          variant: "default",
        });
      } else if (newIds.length > 1) {
        toast({
          title: "New Logs Received",
          description: `${newIds.length} new log entries detected`,
          variant: "default",
        });
      }
      
      // Update the new logs array - keep existing new logs highlighted for a while
      setNewLogIds(prev => [...prev, ...newIds]);
      
      // Remove the highlight after 5 seconds
      setTimeout(() => {
        setNewLogIds(prev => prev.filter(id => !newIds.includes(id)));
      }, 5000);
    }
    
    // Update the previous logs for the next comparison
    previousLogsRef.current = currentLogIds;
  }, [data, liveMode, toast]);
  
  // Effect to reset to page 1 when operation filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [operation]);
  
  // Handler for pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.pagination.totalPages)) return;
    setCurrentPage(newPage);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Format JSON for display
  const formatJson = (json: any) => {
    try {
      if (typeof json === 'string') {
        return json;
      }
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return 'Error formatting JSON';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">API Logs</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="live-mode" 
                  checked={liveMode}
                  onCheckedChange={setLiveMode}
                />
                <label
                  htmlFor="live-mode"
                  className="flex items-center text-sm font-medium gap-1 cursor-pointer"
                >
                  <Activity size={16} className={liveMode ? "text-green-500 animate-pulse" : "text-gray-500"} />
                  Live Mode
                </label>
              </div>
              
              <Select 
                value={operation || "all"} 
                onValueChange={(value) => setOperation(value === "all" ? undefined : value)}
                disabled={liveMode}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All operations</SelectItem>
                  <SelectItem value="generate_graph">Graph generation</SelectItem>
                  <SelectItem value="web_search">Web search</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => refetch()}
                disabled={liveMode}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Session Counter and Clear Logs */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md">
                <Database size={16} />
                <span>Session Logs: <strong>{sessionLogCount}</strong> captured</span>
              </div>
              {data && data.pagination.total > 0 && (
                <div className="text-gray-500 text-sm">
                  Total logs in database: {data.pagination.total}
                </div>
              )}
            </div>
            
            <Button 
              variant="outline"
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending || (data?.data.length === 0)}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} className="mr-2" />
              {clearLogsMutation.isPending ? "Clearing..." : "Clear All Logs"}
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-red-500">Error loading logs: {(error as Error).message}</p>
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">No logs found. Try making some API calls first.</p>
            </div>
          ) : (
            <>
              {data?.data.map((log) => (
                <Card 
                  key={log.id} 
                  className={`mb-6 transition-all duration-300 ${
                    newLogIds.includes(log.id) 
                      ? 'border-green-500 shadow-lg shadow-green-100 animate-pulse' 
                      : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {log.operation} - {log.type}
                          {newLogIds.includes(log.id) && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              NEW
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {formatTimestamp(log.timestamp)} • 
                          Status: {log.statusCode} • 
                          Processing time: {log.processingTimeMs}ms
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        log.type === 'error' 
                          ? 'bg-red-100 text-red-800' 
                          : log.type === 'request' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {log.type.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="request">
                      <TabsListWrapper>
                        <TabsListContent>
                          <TabsTrigger value="request">Request</TabsTrigger>
                          <TabsTrigger value="response">Response</TabsTrigger>
                        </TabsListContent>
                      </TabsListWrapper>
                      
                      <TabsContent value="request" className="mt-4">
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80 text-sm">
                          {formatJson(log.requestData)}
                        </pre>
                      </TabsContent>
                      
                      <TabsContent value="response" className="mt-4">
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80 text-sm">
                          {formatJson(log.responseData)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination - hidden in live mode */}
              {data && data.pagination.totalPages > 1 && !liveMode && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  <span className="mx-4">
                    Page {currentPage} of {data.pagination.totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    disabled={currentPage === data.pagination.totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
              
              {/* Live mode indicator */}
              {liveMode && (
                <div className="flex justify-center items-center mt-6">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-md">
                    <Activity size={16} className="animate-pulse" />
                    <span>Live Mode Active - Automatically refreshing every 2 seconds</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// These are styled wrapper components for the Tabs components
const TabsListWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b" {...props} />
);

const TabsListContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
    {props.children}
  </TabsList>
);