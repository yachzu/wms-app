import apiClient from '../lib/api-client';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    barcode?: string;
    minStock: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    sku: string;
    name: string;
    description?: string;
    barcode?: string;
    minStock?: number;
}

export const productsApi = {
    getAll: async (): Promise<Product[]> => {
        const response = await apiClient.get('/products');
        return response.data;
    },

    getOne: async (id: string): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductRequest): Promise<Product> => {
        const response = await apiClient.post('/products', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateProductRequest>): Promise<Product> => {
        const response = await apiClient.patch(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    },
};
