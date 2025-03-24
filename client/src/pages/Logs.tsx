import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
    }
  });
  
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">API Logs</h1>
          
          <div className="flex items-center gap-4">
            <Select 
              value={operation || "all"} 
              onValueChange={(value) => setOperation(value === "all" ? undefined : value)}
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
            
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>
        </div>
        
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
              <Card key={log.id} className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {log.operation} - {log.type}
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
            
            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
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
          </>
        )}
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