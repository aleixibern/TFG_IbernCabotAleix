import api from '../api/axios';
import type { Epic } from '../types/Epic';

export const epicService = {
    createEpic: async (projectId: string | number, data: { title: string; description?: string; color: string }) => {
        const response = await api.post<Epic>(`/projects/${projectId}/epics`, data);
        return response.data;
    },
    
    getEpicsByProject: async (projectId: string | number) => {
        const response = await api.get<Epic[]>(`/projects/${projectId}/epics`);
        return response.data;
    }
};