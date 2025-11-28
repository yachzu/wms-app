// Centralized React Query configuration for optimal caching and performance

export const queryConfig = {
    defaultOptions: {
        queries: {
            // How long data stays fresh before refetch (5 minutes for most data)
            staleTime: 1000 * 60 * 5,

            // How long unused data stays in cache (10 minutes)
            cacheTime: 1000 * 60 * 10,

            // Don't refetch when window regains focus for better UX
            refetchOnWindowFocus: false,

            // Retry failed requests once
            retry: 1,

            // More aggressive retry delay
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
        },
    },
};

// Custom stale times for different data types
export const STALE_TIMES = {
    // Stats change frequently, refresh after 30 seconds
    DASHBOARD_STATS: 1000 * 30,

    // Products don't change often, keep fresh for 10 minutes
    PRODUCTS: 1000 * 60 * 10,

    // Warehouses are very stable, keep fresh for 15 minutes
    WAREHOUSES: 1000 * 60 * 15,

    // Inventory changes frequently, refresh after 1 minute
    INVENTORY: 1000 * 60,

    // Stock movements are historical, very long stale time
    STOCK_MOVEMENTS: 1000 * 60 * 30,

    // Orders change moderately, 5 minutes
    ORDERS: 1000 * 60 * 5,
};
