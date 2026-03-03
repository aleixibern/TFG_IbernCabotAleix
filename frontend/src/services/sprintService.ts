import api from '../api/axios';
import type { Sprint } from '../types/Sprint';

export const sprintService = {
    createSprint: async (projectId: string, sprintData: { name: string, startDate: string, endDate: string }): Promise<Sprint> => {
        const response = await api.post(`/projects/${projectId}/sprints`, sprintData);
        return response.data;
    },
    
    getSprintsByProject: async (projectId: string): Promise<Sprint[]> => {
        const response = await api.get(`/projects/${projectId}/sprints`);
        return response.data;
    },

    startSprint: async (projectId: string, sprintId: number): Promise<Sprint> => {
        const response = await api.put(`/projects/${projectId}/sprints/${sprintId}/start`);
        return response.data;
    },

    completeSprint: async (projectId: string, sprintId: number): Promise<Sprint> => {
        const response = await api.put(`/projects/${projectId}/sprints/${sprintId}/complete`);
        return response.data;
    },

    getActiveSprint: async (projectId: string): Promise<Sprint | null> => {
        try {
            const response = await api.get(`/projects/${projectId}/sprints/active`);
            if (response.status === 204 || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Error obtenint el sprint actiu", error);
            return null;
        }
    },

    deleteSprint: async (projectId: string, sprintId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}/sprints/${sprintId}`);
    }
};