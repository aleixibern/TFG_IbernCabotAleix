export const TaskStatus = {
    BACKLOG: "BACKLOG",
    READY: "READY",
    IN_PROGRESS: "IN_PROGRESS",
    IN_REVIEW: "IN_REVIEW",
    DONE: "DONE"
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Interfície auxiliar per les dependències
export interface TaskDependency {
    id: number;
    title: string;
    status: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    
    type?: 'TASK' | 'FEATURE' | 'BUG';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    assigneeName?: string;
    assigneeEmail?: string;
    parentTaskId?: number;
    subtasks?: Task[];
    sprintId?: number | null;
    links?: string[];
    dependencies?: TaskDependency[]; 
}

export interface TaskRequest {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    dueDate?: string;
    assigneeEmail?: string;
    parentTaskId?: number;
    sprintId?: number;
    links?: string[];
    dependencyIds?: number[]; 
}