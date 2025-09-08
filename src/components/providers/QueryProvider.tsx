"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
                        gcTime: 1000 * 60 * 30, // 30 minutes - keep in memory longer
                        retry: (failureCount, error: any) => {
                            // Don't retry on 401/403 errors
                            if (
                                error?.status === 401 ||
                                error?.status === 403
                            ) {
                                return false;
                            }
                            return failureCount < 2;
                        },
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                        refetchOnMount: false, // Don't refetch if data exists
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
