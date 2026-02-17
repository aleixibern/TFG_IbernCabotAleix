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
import { EditTaskModal } from '../components/EditTaskModal'; // <--- Import del modal d'edició

// Definim les columnes i colors
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
    
    // Control del Modal de CREAR
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    
    // Control del Modal d'EDITAR
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Càrrega inicial de dades
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

    // 2. Gestió de canvis visuals (Local State)
    const handleTaskCreated = (newTask: Task) => {
        setTasks([...tasks, newTask]); 
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleTaskDeleted = (taskId: number) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        onEditOpen();
    };

    // 3. Lògica del Drag & Drop
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const movedTaskId = Number(draggableId);
        const task = tasks.find(t => t.id === movedTaskId);
        if (!task) return;

        // Actualització Optimista
        const newStatus = destination.droppableId as TaskStatus;
        const updatedTasks = tasks.map(t => 
            t.id === movedTaskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // Actualització al Backend
        try {
            await taskService.updateStatus(movedTaskId, newStatus);
        } catch (error) {
            console.error("Error movent la tasca:", error);
            alert("Error al guardar el moviment.");
            // Si falla, podríem revertir l'estat aquí si volguéssim ser molt estrictes
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="flex flex-col h-full gap-6">
                
                {/* Capçalera del Projecte */}
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{project?.title}</h1>
                        <p className="text-default-500 text-sm">{project?.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button color="primary" variant="shadow" onPress={onCreateOpen}>
                            + Nova Tasca
                        </Button>
                        <Button color="default" variant="flat" onPress={() => navigate('/dashboard')}>
                            Sortir
                        </Button>
                    </div>
                </div>

                {/* AREA DRAG & DROP */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
                        {COLUMNS.map((column) => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="min-w-[280px] w-full bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col"
                                    >
                                        {/* Títol Columna */}
                                        <div className={`p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 rounded-t-xl`}>
                                            <h3 className="font-bold text-white">{column.title}</h3>
                                            <Chip size="sm" variant="flat" color={column.color as any}>
                                                {tasks.filter(t => t.status === column.id).length}
                                            </Chip>
                                        </div>

                                        {/* Llista de Tasques */}
                                        <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-grow min-h-[100px]">
                                            {tasks
                                                .filter(task => task.status === column.id)
                                                .map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{ 
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1 
                                                                }}
                                                                // --- CANVI CLAU 1: El click el posem aquí al div pare ---
                                                                onClick={() => {
                                                                    // Evitem que s'obri si estem arrossegant
                                                                    if (!snapshot.isDragging) {
                                                                        handleTaskClick(task);
                                                                    }
                                                                }}
                                                            >
                                                                <Card 
                                                                    // --- CANVI CLAU 2: Hem tret "isPressable" i "onPress" ---
                                                                    // Això permet que el Drag & Drop torni a funcionar
                                                                    className="bg-zinc-800 border border-white/10 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors"
                                                                >
                                                                    <CardHeader className="flex justify-between items-start pb-0">
                                                                        <span className="font-semibold text-white text-sm line-clamp-2 text-left select-none">
                                                                            {task.title}
                                                                        </span>
                                                                    </CardHeader>
                                                                    <CardBody className="pt-2 text-default-400 text-xs text-left select-none">
                                                                        <p className="line-clamp-3">{task.description}</p>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            }
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                {/* MODAL 1: CREAR TASCA */}
                <CreateTaskModal 
                    isOpen={isCreateOpen} 
                    onOpenChange={onCreateOpenChange} 
                    projectId={id!} 
                    onTaskCreated={handleTaskCreated}
                />

                {/* MODAL 2: EDITAR TASCA */}
                <EditTaskModal 
                    isOpen={isEditOpen} 
                    onOpenChange={onEditOpenChange}
                    task={selectedTask}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                />

            </div>
        </MainLayout>
    );
}