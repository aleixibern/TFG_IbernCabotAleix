export interface ActivityLog {
    id: number;
    userName: string;
    userEmail: string;
    actionDescription: string;
    taskId?: number;
    taskTitle?: string;
    taskStatus?: string;
    oldValue?: string;
    newValue?: string;
    timestamp: string;
}