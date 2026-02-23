export interface Project {
    id: number;
    title: string;
    description: string;
    username: string; 
    email: string;
    members: string[];
    subject?: string;
}