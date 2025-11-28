import api from '@/lib/api-client';

export interface Stats {
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    totalValue: number;
}

export interface MovementTrend {
    date: string;
    type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
    count: number;
}

export interface WarehouseStock {
    name: string;
    stockCount: number;
}

export const analyticsApi = {
    getStats: async () => {
        const response = await api.get<Stats>('/analytics/stats');
        return response.data;
    },
    getMovementTrends: async () => {
        const response = await api.get<MovementTrend[]>('/analytics/movements-trend');
        return response.data;
    },
    getStockByWarehouse: async () => {
        const response = await api.get<WarehouseStock[]>('/analytics/stock-by-warehouse');
        return response.data;
    },
};
