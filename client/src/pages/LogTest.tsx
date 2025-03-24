import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useApiOperationStatus, useRecentApiLogs } from "@/hooks/use-api-logs";

export default function LogTest() {
  const { toast } = useToast();
  
  // Use the API operation status hook to track web search operations
  const { 
    status, 
    metrics,
    lastActivity 
  } = useApiOperationStatus('web_search');
  
  // Get recent logs
  const { data: logsData, isLoading, error, refetch } = useRecentApiLogs('web_search', 5);
  
  const handleCreateTestLog = async () => {
    try {
      const response = await fetch('/api/create-test-log');
      if (!response.ok) {
        throw new Error('Failed to create test log');
      }
      
      toast({
        title: 'Test Log Created',
        description: 'Successfully created test web search log',
      });
      
      // Refetch logs after creating a new one
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create test log: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold my-4">API Logs Test Page</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateTestLog}>
                Create Test Web Search Log
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                This will create two test logs (request and response) for the web search operation
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Operation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prompt Tokens:</span>
                  <span className="font-medium">{metrics.promptTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Tokens:</span>
                  <span className="font-medium">{metrics.completionTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tokens:</span>
                  <span className="font-medium">{metrics.totalTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-medium">{metrics.processingTimeMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Activity:</span>
                  <span className="font-medium">{lastActivity?.message || 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading logs...</p>
              ) : error ? (
                <p className="text-red-500">Error loading logs: {error instanceof Error ? error.message : 'Unknown error'}</p>
              ) : logsData && logsData.data.length > 0 ? (
                <div className="space-y-4">
                  {logsData.data.map((log) => (
                    <div key={log.id} className="border p-4 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{log.operation} - {log.type}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <p><strong>Status:</strong> {log.statusCode}</p>
                        <p><strong>Processing Time:</strong> {log.processingTimeMs}ms</p>
                      </div>
                      <div className="mt-2">
                        <details>
                          <summary className="cursor-pointer">Request Data</summary>
                          <pre className="bg-gray-100 p-2 mt-2 text-xs rounded overflow-auto max-h-40">
                            {JSON.stringify(log.requestData, null, 2)}
                          </pre>
                        </details>
                      </div>
                      <div className="mt-2">
                        <details>
                          <summary className="cursor-pointer">Response Data</summary>
                          <pre className="bg-gray-100 p-2 mt-2 text-xs rounded overflow-auto max-h-40">
                            {JSON.stringify(log.responseData, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No logs found</p>
              )}
              
              <div className="mt-4">
                <Button onClick={() => refetch()}>
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}