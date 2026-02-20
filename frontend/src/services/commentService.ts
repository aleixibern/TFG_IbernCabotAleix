import api from '../api/axios';
import type { Comment } from '../types/Comment';

export const commentService = {
    getCommentsByTask: async (taskId: number): Promise<Comment[]> => {
        const response = await api.get(`/tasks/${taskId}/comments`);
        return response.data;
    },
    
    addComment: async (taskId: number, text: string): Promise<Comment> => {
        const response = await api.post(`/tasks/${taskId}/comments`, { text });
        return response.data;
    }
};