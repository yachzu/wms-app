import apiClient from '../lib/api-client';

export interface Location {
  id: string;
  code: string;
  type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH';
  zoneId: string;
  zone?: Zone;
}

export interface Zone {
  id: string;
  name: string;
  warehouseId: string;
  locations: Location[];
  warehouse?: Warehouse;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  capacity?: number;
  zones: Zone[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  address?: string;
  capacity?: number;
}

export interface CreateZoneRequest {
  name: string;
  warehouseId: string;
}

export interface CreateLocationRequest {
  code: string;
  type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH';
  zoneId: string;
}

export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get('/warehouses');
    return response.data;
  },

  getOne: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  create: async (data: CreateWarehouseRequest): Promise<Warehouse> => {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateWarehouseRequest>): Promise<Warehouse> => {
    const response = await apiClient.patch(`/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}`);
  },

  // Zones
  createZone: async (data: CreateZoneRequest): Promise<Zone> => {
    const response = await apiClient.post('/warehouses/zones', data);
    return response.data;
  },

  updateZone: async (id: string, data: { name: string }): Promise<Zone> => {
    const response = await apiClient.patch(`/warehouses/zones/${id}`, data);
    return response.data;
  },

  deleteZone: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/zones/${id}`);
  },

  // Locations
  createLocation: async (data: CreateLocationRequest): Promise<Location> => {
    const response = await apiClient.post('/warehouses/locations', data);
    return response.data;
  },

  updateLocation: async (id: string, data: { code: string; type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH' }): Promise<Location> => {
    const response = await apiClient.patch(`/warehouses/locations/${id}`, data);
    return response.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/locations/${id}`);
  },
};
