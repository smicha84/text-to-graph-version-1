import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<TResponse = any>(
  url: string,
  options: {
    method?: string;
    body?: any;
  } = {}
): Promise<TResponse> {
  const { method = "GET", body: data } = options;
  
  // More detailed logging of outgoing request
  console.log(`API Request [${method} ${url}]`, data ? JSON.stringify(data, null, 2) : 'No data');
  
  try {
    // If data is complex, explicitly log it for debugging
    if (data && (typeof data === 'object') && Object.keys(data).length > 0) {
      console.log('Request payload details:', {
        textLength: data.text ? data.text.length : 0,
        hasOptions: !!data.options,
        optionsKeys: data.options ? Object.keys(data.options) : [],
        appendMode: data.appendMode,
        hasExistingGraph: !!data.existingGraph,
        graphStats: data.existingGraph ? {
          nodes: data.existingGraph.nodes?.length || 0,
          edges: data.existingGraph.edges?.length || 0
        } : null
      });
    }

    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // Enhanced response status logging
    console.log(`API Response [${method} ${url}]: Status ${res.status} ${res.statusText}`);
    
    // Clone the response for potential error handling
    const resClone = res.clone();
    
    try {
      await throwIfResNotOk(res);
      
      // Only try to parse JSON if there's a response body
      if (res.status !== 204) { // 204 No Content
        const responseData = await res.json();
        // Log detailed information about the response structure
        console.log(`API Response data [${method} ${url}]:`, {
          dataType: typeof responseData,
          isArray: Array.isArray(responseData),
          hasNodes: responseData && responseData.nodes ? true : false,
          hasEdges: responseData && responseData.edges ? true : false,
          nodeCount: responseData && responseData.nodes ? responseData.nodes.length : 0,
          edgeCount: responseData && responseData.edges ? responseData.edges.length : 0
        });
        return responseData;
      }
      
      return {} as TResponse;
    } catch (error) {
      // If the error is due to JSON parsing, try to get the raw text
      if (error instanceof SyntaxError) {
        const rawText = await resClone.text();
        console.error('JSON parsing error, raw response:', rawText.substring(0, 500) + (rawText.length > 500 ? '...(truncated)' : ''));
      }
      throw error;
    }
  } catch (error) {
    console.error(`API Request Error [${method} ${url}]:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
