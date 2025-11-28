import api from '@/lib/api-client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export const usersApi = {
    getAll: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },
    updateRole: async (userId: string, role: string) => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data;
    },
};
