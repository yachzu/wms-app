import apiClient from '../lib/api-client';

export interface DashboardStats {
    totalProducts: number;
    totalWarehouses: number;
    totalMovements: number;
    lowStockItems: number;
}

export const dashboardApi = {
    getStats: async () => {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },
};
