import apiClient from '../lib/api-client';
import { Product } from './products.service';

export enum MovementType {
    IN = 'IN',
    OUT = 'OUT',
    TRANSFER = 'TRANSFER',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum OrderStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface OrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    type: MovementType;
    status: OrderStatus;
    partnerName?: string;
    expectedDate?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderItemRequest {
    productId: string;
    quantity: number;
}

export interface CreateOrderRequest {
    type: MovementType;
    partnerName?: string;
    expectedDate?: string;
    items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

export const ordersApi = {
    getAll: async (): Promise<Order[]> => {
        const response = await apiClient.get('/orders');
        return response.data;
    },

    getOne: async (id: string): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    create: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },

    updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
        const response = await apiClient.patch(`/orders/${id}/status`, data);
        return response.data;
    },
};
