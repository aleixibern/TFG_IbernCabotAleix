import api from '../api/axios';
import { type Task, type TaskStatus } from '../types/Task';

export const taskService = {
    getTasksByProject: async (projectId: string): Promise<Task[]> => {
        const response = await api.get(`/projects/${projectId}/tasks`);
        return response.data;
    },
    
    createTask: async (projectId: string, taskData: any): Promise<Task> => {
        const response = await api.post(`/projects/${projectId}/tasks`, taskData);
        return response.data;
    },

    updateStatus: async (taskId: number, status: TaskStatus): Promise<Task> => {
        const response = await api.put(`/tasks/${taskId}/status`, { status });
        return response.data;
    },

    updateTask: async (taskId: number, taskData: any): Promise<Task> => {
        const response = await api.put(`/tasks/${taskId}`, taskData);
        return response.data;
    },

    deleteTask: async (taskId: number): Promise<void> => {
        await api.delete(`/tasks/${taskId}`);
    }
};