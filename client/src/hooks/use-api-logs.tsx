import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LogsResponse {
  data: ApiLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiLog {
  id: number;
  timestamp: string;
  type: string;
  operation: string;
  requestData: any;
  responseData: any;
  statusCode: number;
  processingTimeMs: number;
}

/**
 * Hook to fetch the most recent API logs for a specific operation
 */
export function useRecentApiLogs(operation: string, limit: number = 5, enabled: boolean = true) {
  const query = useQuery<LogsResponse>({
    queryKey: ['recent-api-logs', operation, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1');
      queryParams.append('limit', limit.toString());
      queryParams.append('operation', operation);
      
      const response = await apiRequest('GET', `/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch API logs');
      }
      return response.json();
    },
    refetchInterval: enabled ? 2000 : false, // Refetch every 2 seconds if enabled
    enabled,
  });

  return query;
}

/**
 * Hook to track API operation status
 */
export function useApiOperationStatus(operation: string) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const [metrics, setMetrics] = useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    processingTimeMs: 0,
    model: ''
  });
  const [lastActivity, setLastActivity] = useState<{
    timestamp: string;
    message: string;
  } | null>(null);

  // Query recent logs for this operation
  const { data, isLoading, error, dataUpdatedAt } = useRecentApiLogs(operation, 2, true);

  // Process logs to determine current status and metrics
  useEffect(() => {
    if (!data || data.data.length === 0) {
      setStatus('idle');
      return;
    }

    const logs = data.data;
    const requests = logs.filter(log => log.type === 'request');
    const responses = logs.filter(log => log.type === 'response');
    const errors = logs.filter(log => log.type === 'error');

    // Check if there's an active request without a corresponding response
    const hasActiveRequest = requests.some(req => 
      !responses.some(res => 
        res.timestamp > req.timestamp && 
        res.requestData?.query === req.requestData?.query
      )
    );

    if (hasActiveRequest) {
      setStatus('loading');
      const latestRequest = requests.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      setLastActivity({
        timestamp: latestRequest.timestamp,
        message: `Processing query: "${latestRequest.requestData?.query || 'Unknown query'}"`
      });
    } else if (errors.length > 0 && errors[0].timestamp > (responses[0]?.timestamp || '')) {
      setStatus('error');
      setLastActivity({
        timestamp: errors[0].timestamp,
        message: `Error: ${errors[0].requestData?.error || 'Unknown error'}`
      });
    } else if (responses.length > 0) {
      setStatus('complete');
      const latestResponse = responses.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      setMetrics({
        promptTokens: latestResponse.responseData?.prompt_tokens || 0,
        completionTokens: latestResponse.responseData?.completion_tokens || 0,
        totalTokens: (latestResponse.responseData?.prompt_tokens || 0) + (latestResponse.responseData?.completion_tokens || 0),
        processingTimeMs: latestResponse.processingTimeMs || 0,
        model: latestResponse.responseData?.model || 'Unknown model'
      });
      
      setLastActivity({
        timestamp: latestResponse.timestamp,
        message: `Query completed in ${latestResponse.processingTimeMs}ms`
      });
    }
  }, [data, dataUpdatedAt]);

  return {
    status,
    metrics,
    lastActivity,
    isLoading,
    error
  };
}