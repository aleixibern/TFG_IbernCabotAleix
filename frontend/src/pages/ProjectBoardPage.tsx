import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Button, Card, CardHeader, CardBody, Chip, useDisclosure } from "@heroui/react";
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../api/axios';
import { taskService } from '../services/taskService';
import type { Project } from '../types/Project';
import type { User } from '../types/User';
import { type Task, TaskStatus } from '../types/Task';
import { MainLayout } from '../layouts/MainLayout';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { InviteMemberModal } from '../components/InviteMemberModal'; // <--- IMPORT IMPORTANT

const COLUMNS = [
    { id: TaskStatus.BACKLOG, title: "Backlog 💡", color: "default" },
    { id: TaskStatus.READY, title: "Ready 🔥", color: "secondary" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress 🚀", color: "primary" },
    { id: TaskStatus.IN_REVIEW, title: "In Review 👀", color: "warning" },
    { id: TaskStatus.DONE, title: "Done ✅", color: "success" }
];

export default function ProjectBoardPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // Gestió dels Modals
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onOpenChange: onInviteOpenChange } = useDisclosure(); // <--- ESTAT PEL BOTÓ

    // Estats de dades
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Càrrega inicial
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [projectRes, userRes, tasksRes] = await Promise.all([
                    api.get<Project>(`/projects/${id}`),
                    api.get<User>('/users/me'),
                    taskService.getTasksByProject(id)
                ]);
                
                setProject(projectRes.data);
                setUser(userRes.data);
                setTasks(tasksRes);
            } catch (error) {
                console.error("Error carregant dades", error);
                navigate('/dashboard'); 
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // Lògica Drag & Drop
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const movedTaskId = Number(draggableId);
        const newStatus = destination.droppableId as TaskStatus;
        
        // Actualització optimista
        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, status: newStatus } : t));

        try {
            await taskService.updateStatus(movedTaskId, newStatus);
        } catch (error) {
            console.error("Error movent tasca", error);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Spinner size="lg" /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="flex flex-col h-full gap-6">
                
                {/* CAPÇALERA */}
                <div className="flex justify-between items-center px-2 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">{project?.title}</h1>
                        <div className="flex gap-2 items-center text-default-500">
                            <span>{project?.description}</span>
                            {project?.username !== user?.username && (
                                <Chip size="sm" variant="flat" color="warning">Owner: {project?.username}</Chip>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* --- AQUEST ÉS EL BOTÓ QUE ET FALTAVA --- */}
                        <Button color="secondary" variant="flat" onPress={onInviteOpen}>
                            👥 Convidar
                        </Button>
                        {/* ---------------------------------------- */}
                        
                        <Button color="primary" variant="shadow" onPress={onCreateOpen}>
                            + Nova Tasca
                        </Button>
                        <Button color="default" variant="flat" onPress={() => navigate('/dashboard')}>
                            Sortir
                        </Button>
                    </div>
                </div>

                {/* TAULER KANBAN */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
                        {COLUMNS.map((column) => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[280px] w-full bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col">
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/90 rounded-t-xl">
                                            <h3 className="font-bold text-white">{column.title}</h3>
                                            <Chip size="sm" variant="flat" color={column.color as any}>
                                                {tasks.filter(t => t.status === column.id).length}
                                            </Chip>
                                        </div>
                                        <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-grow">
                                            {tasks.filter(t => t.status === column.id).map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                             onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                            <Card className="bg-zinc-800 border border-white/10 hover:border-primary/50 cursor-grab">
                                                                <CardHeader className="pb-0 text-white font-semibold text-sm">{task.title}</CardHeader>
                                                                <CardBody className="pt-2 text-default-400 text-xs">
                                                                    <p className="line-clamp-2">{task.description}</p>
                                                                    {task.assigneeName && (
                                                                        <Chip size="sm" variant="dot" color="primary" className="mt-2">
                                                                            {task.assigneeName}
                                                                        </Chip>
                                                                    )}
                                                                </CardBody>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
                
                {/* MODALS */}
                <CreateTaskModal 
                    isOpen={isCreateOpen} 
                    onOpenChange={onCreateOpenChange} 
                    projectId={id!} 
                    onTaskCreated={(t) => setTasks([...tasks, t])} 
                />
                
                <EditTaskModal 
                    isOpen={isEditOpen} 
                    onOpenChange={onEditOpenChange} 
                    task={selectedTask} 
                    onTaskUpdated={(ut) => setTasks(tasks.map(t => t.id === ut.id ? ut : t))} 
                    onTaskDeleted={(tid) => setTasks(tasks.filter(t => t.id !== tid))} 
                />
                
                <InviteMemberModal 
                    isOpen={isInviteOpen} 
                    onOpenChange={onInviteOpenChange} 
                    projectId={id!} 
                />
            </div>
        </MainLayout>
    );
}