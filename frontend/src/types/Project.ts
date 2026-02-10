import type { User } from "./User";

export interface Project {
    id: number;
    title: string;
    description?: string;
    createdAt?: string;
    owner?: User;

}