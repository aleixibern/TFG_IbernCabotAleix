import api from '../api/axios';
import { type Task, TaskStatus } from '../types/Task';

export const taskService = {
    getTasksByProject: async (projectId: string) => {
        const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
        return response.data;
    },

    createTask: async (projectId: string, title: string, description: string) => {
        const response = await api.post<Task>(`/projects/${projectId}/tasks`, {
            title,
            description
        });
        return response.data;
    },

    updateStatus: async (taskId: number, status: TaskStatus) => {
        const response = await api.put<Task>(`/tasks/${taskId}/status`, { status });
        return response.data;
    },
    updateTask: async (taskId: number, title: string, description: string) => {
        const response = await api.put<Task>(`/tasks/${taskId}`, {
            title,
            description
        });
        return response.data;
    },

    deleteTask: async (taskId: number) => {
        await api.delete(`/tasks/${taskId}`);
    }
};