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
  
  // Log outgoing request for debugging
  console.log(`API Request [${method} ${url}]`, data ? 'With data' : 'No data');
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // Log response status for debugging
    console.log(`API Response [${method} ${url}]: Status ${res.status}`);
    
    await throwIfResNotOk(res);
    
    // Only try to parse JSON if there's a response body
    if (res.status !== 204) { // 204 No Content
      const responseData = await res.json();
      console.log(`API Response data [${method} ${url}]:`, responseData ? 'Data received' : 'No data');
      return responseData;
    }
    
    return {} as TResponse;
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
