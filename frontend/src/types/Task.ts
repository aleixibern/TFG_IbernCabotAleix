export const TaskStatus = {
    BACKLOG: "BACKLOG",
    READY: "READY",
    IN_PROGRESS: "IN_PROGRESS",
    IN_REVIEW: "IN_REVIEW",
    DONE: "DONE"
} as const; 

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
}