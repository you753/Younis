import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // محاولة تحليل JSON للحصول على رسالة الخطأ المفصلة
    try {
      const errorData = JSON.parse(text);
      // إذا كانت هناك رسالة مفصلة، استخدمها
      const errorMessage = errorData.message || errorData.error || text;
      const error: any = new Error(errorMessage);
      error.status = res.status;
      error.data = errorData;
      throw error;
    } catch {
      // إذا لم يكن JSON، استخدم النص العادي
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response>;
export async function apiRequest(options: {
  method: string;
  url: string;
  body?: unknown | undefined;
}): Promise<Response>;
export async function apiRequest(
  methodOrOptions: string | { method: string; url: string; body?: unknown },
  url?: string,
  data?: unknown | undefined,
): Promise<Response> {
  let method: string;
  let requestUrl: string;
  let requestData: unknown;

  if (typeof methodOrOptions === 'string') {
    method = methodOrOptions;
    requestUrl = url!;
    requestData = data;
  } else {
    method = methodOrOptions.method;
    requestUrl = methodOrOptions.url;
    requestData = methodOrOptions.body;
  }

  const res = await fetch(requestUrl, {
    method,
    headers: requestData ? { "Content-Type": "application/json" } : {},
    body: requestData ? JSON.stringify(requestData) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
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
