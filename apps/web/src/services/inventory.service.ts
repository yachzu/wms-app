import apiClient from '../lib/api-client';
import { Product } from './products.service';
import { Location } from './warehouses.service';

export enum MovementType {
    IN = 'IN',
    OUT = 'OUT',
    TRANSFER = 'TRANSFER',
    ADJUSTMENT = 'ADJUSTMENT',
}

export interface StockMovement {
    id: string;
    type: MovementType;
    productId: string;
    product?: Product;
    fromLocationId?: string;
    fromLocation?: Location;
    toLocationId?: string;
    toLocation?: Location;
    quantity: number;
    referenceId?: string;
    createdAt: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface InventoryItem {
    id: string;
    productId: string;
    product: Product;
    locationId: string;
    location: Location;
    quantity: number;
    batchNo?: string;
    expiryDate?: string;
}

export interface CreateStockMovementRequest {
    type: MovementType;
    productId: string;
    fromLocationId?: string;
    toLocationId?: string;
    quantity: number;
    referenceId?: string;
}

export const inventoryApi = {
    getBalance: async (productId?: string, locationId?: string): Promise<InventoryItem[]> => {
        const params = new URLSearchParams();
        if (productId) params.append('productId', productId);
        if (locationId) params.append('locationId', locationId);

        const response = await apiClient.get(`/inventory/balance?${params.toString()}`);
        return response.data;
    },

    getMovements: async (productId?: string, locationId?: string): Promise<StockMovement[]> => {
        const params = new URLSearchParams();
        if (productId) params.append('productId', productId);
        if (locationId) params.append('locationId', locationId);

        const response = await apiClient.get(`/inventory/movements?${params.toString()}`);
        return response.data;
    },

    createMovement: async (data: CreateStockMovementRequest): Promise<StockMovement> => {
        const response = await apiClient.post('/inventory/movements', data);
        return response.data;
    },
};
