export interface Project {
    id: number;
    title: string;
    description: string;
    // Aquests són els camps que et donen error en vermell:
    username: string; 
    email: string;
    members: string[];
}