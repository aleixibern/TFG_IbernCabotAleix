import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Button, Card, CardHeader, CardBody, Chip, useDisclosure, Select, SelectItem } from "@heroui/react";
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../api/axios';
import { taskService } from '../services/taskService';
import { sprintService } from '../services/sprintService';
import type { Project } from '../types/Project';
import type { User } from '../types/User';
import { type Task, TaskStatus } from '../types/Task';
import type { Sprint } from '../types/Sprint'; 
import { MainLayout } from '../layouts/MainLayout';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { CreateSprintModal } from '../components/CreateSprintModal'; 
import { getInitials } from '../utils/stringUtils';

const COLUMNS = [
    { id: TaskStatus.BACKLOG, title: "Backlog 💡", color: "default" },
    { id: TaskStatus.READY, title: "Ready 🔥", color: "secondary" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress 🚀", color: "primary" },
    { id: TaskStatus.IN_REVIEW, title: "In Review 👀", color: "warning" },
    { id: TaskStatus.DONE, title: "Done ✅", color: "success" }
];

const TYPE_STYLES = {
    TASK: { icon: "📝", color: "primary", label: "Tasca" },
    FEATURE: { icon: "🚀", color: "secondary", label: "Feature" },
    BUG: { icon: "🐛", color: "danger", label: "Bug" }
};

const PRIORITY_STYLES = {
    LOW: { icon: "🟢", color: "success" },
    MEDIUM: { icon: "🟡", color: "warning" },
    HIGH: { icon: "🟠", color: "warning" },
    URGENT: { icon: "🔴", color: "danger" }
};

export default function ProjectBoardPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onOpenChange: onInviteOpenChange } = useDisclosure();
    const { isOpen: isSprintOpen, onOpen: onSprintOpen, onOpenChange: onSprintOpenChange } = useDisclosure(); 

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]); 
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState<string>("ALL");
    const [filterAssignee, setFilterAssignee] = useState<string>("ALL");

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [projectRes, userRes, tasksRes, sprintsRes] = await Promise.all([
                    api.get<Project>(`/projects/${id}`),
                    api.get<User>('/users/me'),
                    taskService.getTasksByProject(id),
                    sprintService.getSprintsByProject(id)
                ]);
                
                setProject(projectRes.data);
                setUser(userRes.data);
                setTasks(tasksRes);
                setSprints(sprintsRes); 
            } catch (error) {
                console.error("Error carregant dades", error);
                navigate('/dashboard'); 
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const movedTaskId = Number(draggableId);
        const newStatus = destination.droppableId as TaskStatus;
        
        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, status: newStatus } : t));

        try {
            await taskService.updateStatus(movedTaskId, newStatus);
        } catch (error) {
            console.error("Error movent tasca", error);
        }
    };

    const uniqueAssignees = Array.from(new Set(tasks.filter(t => t.assigneeEmail).map(t => t.assigneeEmail)));

    const filteredTasks = tasks.filter(task => {
        const matchType = filterType === "ALL" || task.type === filterType;
        const matchAssignee = filterAssignee === "ALL" || task.assigneeEmail === filterAssignee;
        return matchType && matchAssignee;
    });

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Spinner size="lg" /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="flex flex-col h-full gap-5">
                
                {/* --- CAPÇALERA --- */}
                <div className="flex justify-between items-center px-2 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">{project?.title}</h1>
                        <div className="flex gap-2 items-center text-default-500">
                            <span>{project?.description}</span>
                            {project?.subject && (
                                <Chip size="sm" variant="flat" color="secondary">📚 {project.subject}</Chip>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button color="secondary" variant="flat" onPress={onInviteOpen}>
                            👥 Convidar
                        </Button>
                        <Button color="warning" variant="flat" onPress={onSprintOpen}> 
                            🏃‍♂️ Nou Sprint
                        </Button>
                        <Button color="primary" variant="shadow" onPress={onCreateOpen}>
                            + Nova Tasca
                        </Button>
                    </div>
                </div>

                {sprints.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 px-2">
                        {sprints.map(sprint => (
                            <div key={sprint.id} className="bg-warning/10 border border-warning/30 rounded-lg p-3 min-w-[220px] shrink-0 flex flex-col gap-1">
                                <h4 className="text-warning font-bold text-sm flex items-center gap-2">
                                    ⏱️ {sprint.name}
                                </h4>
                                <p className="text-xs text-default-400">
                                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-white/10 shrink-0">
                    <span className="text-white font-bold text-sm">🔍 Filtres:</span>
                    
                    <Select label="Tipus de Tasca" selectedKeys={[filterType]} onChange={(e) => setFilterType(e.target.value)} size="sm" className="w-48" variant="bordered">
                        <SelectItem key="ALL">Tots</SelectItem>
                        <SelectItem key="TASK">📝 Tasca</SelectItem>
                        <SelectItem key="FEATURE">🚀 Feature</SelectItem>
                        <SelectItem key="BUG">🐛 Bug</SelectItem>
                    </Select>

                    <Select label="Assignat a" selectedKeys={[filterAssignee]} onChange={(e) => setFilterAssignee(e.target.value)} size="sm" className="w-48" variant="bordered">
                        {["ALL", ...uniqueAssignees].map((email) => (
                            <SelectItem key={email as string}>
                                {email === "ALL" ? "Tothom" : (email as string)}
                            </SelectItem>
                        ))}
                    </Select>

                    {(filterType !== "ALL" || filterAssignee !== "ALL") && (
                        <Button size="sm" color="danger" variant="flat" onPress={() => { setFilterType("ALL"); setFilterAssignee("ALL"); }}>
                            Netejar Filtres
                        </Button>
                    )}
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-340px)]">
                        {COLUMNS.map((column) => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[280px] w-full bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col">
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/90 rounded-t-xl">
                                            <h3 className="font-bold text-white">{column.title}</h3>
                                            <Chip size="sm" variant="flat" color={column.color as any}>
                                                {filteredTasks.filter(t => t.status === column.id).length}
                                            </Chip>
                                        </div>
                                        <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-grow">
                                            {filteredTasks.filter(t => t.status === column.id && !t.parentTaskId).map((task, index) => {
                                                const taskType = task.type || 'TASK';
                                                const taskPriority = task.priority || 'MEDIUM';
                                                const typeStyle = TYPE_STYLES[taskType as keyof typeof TYPE_STYLES];
                                                const priorityStyle = PRIORITY_STYLES[taskPriority as keyof typeof PRIORITY_STYLES];
                                                
                                                const finalNameToShow = task.assigneeName || task.assigneeEmail;

                                                return (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                 onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                
                                                                <Card className="bg-zinc-800 border border-white/10 hover:border-primary/50 cursor-grab">
                                                                    <CardHeader className="pb-0 text-white font-semibold text-sm">
                                                                        {task.title}
                                                                    </CardHeader>
                                                                    
                                                                    <CardBody className="pt-3 pb-3 text-xs">
                                                                        <div className="flex justify-between items-center w-full mt-2">
                                                                            <div className="flex flex-wrap gap-1">
                                                                                <Chip size="sm" variant="flat" color={typeStyle?.color as any || "default"}>
                                                                                    {typeStyle?.icon} {typeStyle?.label}
                                                                                </Chip>
                                                                                <Chip size="sm" variant="flat" color={priorityStyle?.color as any || "default"}>
                                                                                    {priorityStyle?.icon}
                                                                                </Chip>
                                                                            </div>
                                                                            
                                                                            {finalNameToShow && (
                                                                                <div 
                                                                                    title={finalNameToShow} 
                                                                                    className="w-7 h-7 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0 ml-2"
                                                                                >
                                                                                    {getInitials(finalNameToShow)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
                
                <CreateTaskModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} projectId={id!} onTaskCreated={(t) => setTasks([...tasks, t])} />
                <EditTaskModal isOpen={isEditOpen} onOpenChange={onEditOpenChange} task={selectedTask} projectId={id!} onTaskUpdated={(ut) => setTasks(tasks.map(t => t.id === ut.id ? ut : t))} onTaskDeleted={(tid) => setTasks(tasks.filter(t => t.id !== tid))} />
                <InviteMemberModal isOpen={isInviteOpen} onOpenChange={onInviteOpenChange} projectId={id!} />
                
                <CreateSprintModal 
                    isOpen={isSprintOpen} 
                    onOpenChange={onSprintOpenChange} 
                    projectId={id!} 
                    onSprintCreated={(newSprint) => setSprints([...sprints, newSprint])} 
                />
            </div>
        </MainLayout>
    );
}