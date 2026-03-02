export interface Sprint {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    projectId: number;
    status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
}