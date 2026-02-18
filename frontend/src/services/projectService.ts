import api from '../api/axios';
import { type Project } from '../types/Project';

export interface Invitation {
    id: number;
    projectTitle: string;
    ownerName: string;
}

export const projectService = {
    getProjects: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },

    inviteMember: async (projectId: string, email: string) => {
        await api.post(`/projects/${projectId}/invite`, { email });
    },

    getMyInvitations: async () => {
        const response = await api.get<Invitation[]>('/projects/invitations');
        return response.data;
    },

    acceptInvitation: async (invitationId: number) => {
        await api.post(`/projects/invitations/${invitationId}/accept`);
    },

    declineInvitation: async (invitationId: number) => {
        await api.delete(`/projects/invitations/${invitationId}`);
    }
};