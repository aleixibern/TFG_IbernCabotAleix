import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Button, Card, CardHeader, CardBody, Chip, useDisclosure, Select, SelectItem, Tabs, Tab } from "@heroui/react";
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
import { ProjectAnalytics } from '../components/ProjectAnalytics';

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
    
    const [activeTab, setActiveTab] = useState("tablero");
    const [startingSprint, setStartingSprint] = useState<number | null>(null);

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

    const handleStartSprint = async (sprintId: number) => {
        if (!id) return;
        setStartingSprint(sprintId);
        try {
            const updatedSprint = await sprintService.startSprint(id, sprintId);
            setSprints(prevSprints => prevSprints.map(s => s.id === sprintId ? updatedSprint : s));
            setActiveTab("tablero");
        } catch (error: any) {
            alert(error.response?.data?.message || "No s'ha pogut iniciar l'sprint.");
        } finally {
            setStartingSprint(null);
        }
    };

    const handleDeleteSprint = async (sprintId: number) => {
        if (!id) return;
        if (confirm("Segur que vols esborrar aquest Sprint? Les tasques que contingui tornaran al Backlog.")) {
            try {
                await sprintService.deleteSprint(id, sprintId);
                // L'esborrem de la llista visual
                setSprints(prev => prev.filter(s => s.id !== sprintId));
                // I refresquem les tasques forçant el backend o simplement actualitzant l'estat local
                setTasks(prev => prev.map(t => t.sprintId === sprintId ? { ...t, sprintId: null } : t));
            } catch (error) {
                console.error("Error esborrant sprint", error);
                alert("No s'ha pogut esborrar l'sprint.");
            }
        }
    };

    const handleCompleteSprint = async (sprintId: number) => {
        if (!id) return;
        if (confirm("Segur que vols completar aquest Sprint? Les tasques no esborrades es quedaran on estan.")) {
            try {
                const updatedSprint = await sprintService.completeSprint(id, sprintId);
                setSprints(prev => prev.map(s => s.id === sprintId ? updatedSprint : s));
                setActiveTab("backlog");
                alert("Sprint completat amb èxit! 🎉");
            } catch (error) {
                console.error("Error completant sprint", error);
            }
        }
    };

    const onDragEndTablero = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        const movedTaskId = Number(draggableId);
        const newStatus = destination.droppableId as TaskStatus;
        
        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, status: newStatus } : t));
        try { await taskService.updateStatus(movedTaskId, newStatus); } 
        catch (error) { console.error("Error movent tasca", error); }
    };

    const onDragEndBacklog = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const movedTaskId = Number(draggableId);
        const isDestBacklog = destination.droppableId === "backlog";
        const targetSprintId = isDestBacklog ? null : Number(destination.droppableId.replace('sprint-', ''));

        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, sprintId: targetSprintId } : t));
        try { await taskService.updateTask(movedTaskId, { sprintId: targetSprintId === null ? -1 : targetSprintId }); } 
        catch (error) { console.error("Error movent tasca de sprint", error); }
    };

    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    const uniqueAssignees = Array.from(new Set(tasks.filter(t => t.assigneeEmail).map(t => t.assigneeEmail)));

    const tableroTasks = tasks.filter(task => {
        const matchSprint = task.sprintId === activeSprint?.id;
        const matchType = filterType === "ALL" || task.type === filterType;
        const matchAssignee = filterAssignee === "ALL" || task.assigneeEmail === filterAssignee;
        return matchSprint && matchType && matchAssignee;
    });

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Spinner size="lg" /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="flex flex-col h-full gap-5">
                
                <div className="flex justify-between items-center px-2 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">{project?.title}</h1>
                        <div className="flex gap-2 items-center text-default-500">
                            <span>{project?.description}</span>
                            {project?.subject && <Chip size="sm" variant="flat" color="secondary">📚 {project.subject}</Chip>}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button color="secondary" variant="flat" onPress={onInviteOpen}>👥 Convidar</Button>
                        <Button color="primary" variant="shadow" onPress={onCreateOpen}>+ Nova Tasca</Button>
                    </div>
                </div>

                <div className="px-2">
                    <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)} color="primary" variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-white/10",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12 text-default-500",
                            tabContent: "group-data-[selected=true]:text-white font-semibold"
                        }}>
                        <Tab key="backlog" title={<div className="flex items-center space-x-2"><span>📚 Backlog & Planificació</span></div>} />
                        <Tab key="tablero" title={<div className="flex items-center space-x-2"><span>🚀 Tablero Actiu</span></div>} />
                        <Tab key="estadistiques" title={<div className="flex items-center space-x-2"><span>📊 Estadístiques</span></div>} />
                    </Tabs>
                </div>

                {activeTab === "backlog" && (
                    <DragDropContext onDragEnd={onDragEndBacklog}>
                        <div className="flex flex-col gap-6 p-2 pb-10 h-[calc(100vh-250px)] overflow-y-auto">
                            
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Sprints Planificats</h2>
                                <Button color="warning" variant="flat" size="sm" onPress={onSprintOpen}>+ Nou Sprint</Button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {sprints.filter(s => s.status !== 'CLOSED').map(sprint => (
                                    <div key={sprint.id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-white font-bold text-lg">⏱️ {sprint.name}</h4>
                                                <Chip size="sm" color={sprint.status === 'ACTIVE' ? 'success' : 'warning'} variant="flat">{sprint.status}</Chip>
                                                <span className="text-xs text-default-400">
                                                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {sprint.status === 'PLANNED' && (
                                                    <Button size="sm" color="primary" variant="flat" isLoading={startingSprint === sprint.id} onPress={() => handleStartSprint(sprint.id)}>
                                                        Iniciar Sprint
                                                    </Button>
                                                )}
                                                <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDeleteSprint(sprint.id)} title="Esborrar Sprint">
                                                    🗑️
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <Droppable droppableId={`sprint-${sprint.id}`}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[60px] bg-black/50 p-3 rounded-lg border border-white/5 border-dashed">
                                                    {tasks.filter(t => t.sprintId === sprint.id).map((task, index) => (
                                                        <Draggable key={`sp-${task.id}`} draggableId={task.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                    className="bg-zinc-800 p-3 rounded-lg border border-white/10 flex justify-between items-center mb-2 hover:border-primary/50 cursor-grab"
                                                                    onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                    <span className="text-sm text-white font-medium">{task.title}</span>
                                                                    <Chip size="sm" variant="flat">{task.status}</Chip>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {tasks.filter(t => t.sprintId === sprint.id).length === 0 && (
                                                        <p className="text-center text-default-500 text-sm py-2">Arrossega tasques aquí per planificar-les</p>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-white mb-4">Tasques sense assignar (Backlog)</h2>
                                <Droppable droppableId="backlog">
                                    {(provided) => {
                                        const backlogTasks = tasks.filter(t => 
                                            !t.parentTaskId && (!t.sprintId || sprints.find(s => s.id === t.sprintId)?.status === 'CLOSED')
                                        );

                                        return (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="bg-zinc-900 border border-white/10 rounded-xl p-4 min-h-[150px]">
                                                {backlogTasks.map((task, index) => (
                                                    <Draggable key={`bl-${task.id}`} draggableId={task.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                className="bg-zinc-800 p-3 rounded-lg border border-white/10 flex justify-between items-center mb-2 hover:border-primary/50 cursor-grab"
                                                                onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                <span className="text-sm text-white font-medium">{task.title}</span>
                                                                <div className="flex gap-2 items-center">
                                                                    {task.assigneeName && <Chip size="sm" variant="dot" color="primary">{task.assigneeName}</Chip>}
                                                                    <Chip size="sm" variant="flat">{task.status}</Chip>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {backlogTasks.length === 0 && (
                                                    <p className="text-center text-default-500 text-sm italic py-4">No hi ha tasques al Backlog.</p>
                                                )}
                                            </div>
                                        );
                                    }}
                                </Droppable>
                            </div>

                        </div>
                    </DragDropContext>
                )}

                {activeTab === "tablero" && (
                    <div className="flex flex-col h-full gap-5">
                        <div className="px-2">
                            {activeSprint ? (
                                <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🚀</span>
                                        <div>
                                            <h3 className="font-bold text-lg">Sprint Actiu: {activeSprint.name}</h3>
                                            <p className="text-xs opacity-80">
                                                {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" color="success" variant="flat" className="font-bold" onPress={() => handleCompleteSprint(activeSprint.id)}>
                                        ✅ Completar Sprint
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-zinc-900/80 border border-white/5 text-default-500 px-4 py-3 rounded-xl flex items-center gap-3">
                                    <span>ℹ️</span><p className="text-sm">No hi ha cap Sprint actiu actualment. Pots iniciar-ne un des de la pestanya Backlog.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-white/10 shrink-0 mx-2">
                            <span className="text-white font-bold text-sm">🔍 Filtres:</span>
                            <Select label="Tipus" selectedKeys={[filterType]} onChange={(e) => setFilterType(e.target.value)} size="sm" className="w-32" variant="bordered">
                                <SelectItem key="ALL">Tots</SelectItem>
                                <SelectItem key="TASK">📝 Tasca</SelectItem>
                                <SelectItem key="FEATURE">🚀 Feature</SelectItem>
                                <SelectItem key="BUG">🐛 Bug</SelectItem>
                            </Select>
                            <Select label="Assignat a" selectedKeys={[filterAssignee]} onChange={(e) => setFilterAssignee(e.target.value)} size="sm" className="w-48" variant="bordered">
                                {["ALL", ...uniqueAssignees].map((email) => (
                                    <SelectItem key={email as string}>{email === "ALL" ? "Tothom" : (email as string)}</SelectItem>
                                ))}
                            </Select>
                            {(filterType !== "ALL" || filterAssignee !== "ALL") && (
                                <Button size="sm" color="danger" variant="flat" onPress={() => { setFilterType("ALL"); setFilterAssignee("ALL"); }}>Netejar</Button>
                            )}
                        </div>

                        <DragDropContext onDragEnd={onDragEndTablero}>
                            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-340px)] px-2">
                                {COLUMNS.map((column) => (
                                    <Droppable key={column.id} droppableId={column.id}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[280px] w-full bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col">
                                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/90 rounded-t-xl">
                                                    <h3 className="font-bold text-white">{column.title}</h3>
                                                    <Chip size="sm" variant="flat" color={column.color as any}>
                                                        {tableroTasks.filter(t => t.status === column.id).length}
                                                    </Chip>
                                                </div>
                                                <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-grow">
                                                    {tableroTasks.filter(t => t.status === column.id && !t.parentTaskId).map((task, index) => {
                                                        const taskType = task.type || 'TASK';
                                                        const taskPriority = task.priority || 'MEDIUM';
                                                        const typeStyle = TYPE_STYLES[taskType as keyof typeof TYPE_STYLES];
                                                        const priorityStyle = PRIORITY_STYLES[taskPriority as keyof typeof PRIORITY_STYLES];
                                                        const finalNameToShow = task.assigneeName || task.assigneeEmail;

                                                        return (
                                                            <Draggable key={`t-${task.id}`} draggableId={task.id.toString()} index={index}>
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                         onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                        <Card className="bg-zinc-800 border border-white/10 hover:border-primary/50 cursor-grab">
                                                                            <CardHeader className="pb-0 text-white font-semibold text-sm">{task.title}</CardHeader>
                                                                            <CardBody className="pt-3 pb-3 text-xs">
                                                                                <div className="flex justify-between items-center w-full mt-2">
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        <Chip size="sm" variant="flat" color={typeStyle?.color as any || "default"}>
                                                                                            {typeStyle?.icon} {typeStyle?.label}
                                                                                        </Chip>
                                                                                        <Chip size="sm" variant="flat" color={priorityStyle?.color as any || "default"}>{priorityStyle?.icon}</Chip>
                                                                                    </div>
                                                                                    {finalNameToShow && (
                                                                                        <div title={finalNameToShow} className="w-7 h-7 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0 ml-2">
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
                    </div>
                )}

                {activeTab === "estadistiques" && (
                    <div className="flex-grow overflow-y-auto">
                        <ProjectAnalytics tasks={tasks} />
                    </div>
                )}
                
                <CreateTaskModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} projectId={id!} onTaskCreated={(t) => setTasks([...tasks, t])} />
                <EditTaskModal isOpen={isEditOpen} onOpenChange={onEditOpenChange} task={selectedTask} projectId={id!} onTaskUpdated={(ut) => setTasks(tasks.map(t => t.id === ut.id ? ut : t))} onTaskDeleted={(tid) => setTasks(tasks.filter(t => t.id !== tid))} />
                <InviteMemberModal isOpen={isInviteOpen} onOpenChange={onInviteOpenChange} projectId={id!} />
                
                <CreateSprintModal isOpen={isSprintOpen} onOpenChange={onSprintOpenChange} projectId={id!} onSprintCreated={(newSprint) => setSprints([...sprints, newSprint])} />
            </div>
        </MainLayout>
    );
}