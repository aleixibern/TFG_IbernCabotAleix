import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Button, Card, CardHeader, CardBody, Chip, useDisclosure, Select, SelectItem, Tabs, Tab } from "@heroui/react";
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next'; 
import toast from 'react-hot-toast';
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
import { ConfirmModal } from '../components/ConfirmModal';
import { getInitials } from '../utils/stringUtils';
import { ProjectAnalytics } from '../components/ProjectAnalytics';

const COLUMNS_KEYS = [
    { id: TaskStatus.BACKLOG, titleKey: "column_backlog", color: "default" },
    { id: TaskStatus.READY, titleKey: "column_ready", color: "secondary" },
    { id: TaskStatus.IN_PROGRESS, titleKey: "column_in_progress", color: "primary" },
    { id: TaskStatus.IN_REVIEW, titleKey: "column_in_review", color: "warning" },
    { id: TaskStatus.DONE, titleKey: "column_done", color: "success" }
];

const TYPE_STYLES = {
    TASK: { icon: "📝", color: "primary", labelKey: "type_task" },
    FEATURE: { icon: "🚀", color: "secondary", labelKey: "type_feature" },
    BUG: { icon: "🐛", color: "danger", labelKey: "type_bug" }
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
    const { t } = useTranslation(); 
    
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

    const [confirmData, setConfirmData] = useState<{
        isOpen: boolean, 
        title: string, 
        message: string, 
        action: () => void, 
        color: "danger" | "success"
    } | null>(null);

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
            toast.success(t('success_start_sprint', { defaultValue: 'Sprint iniciat!' })); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('error_start_sprint')); 
        } finally {
            setStartingSprint(null);
        }
    };

    const handleDeleteSprint = (sprintId: number) => {
        if (!id) return;
        setConfirmData({
            isOpen: true,
            title: t('delete_sprint_title', { defaultValue: 'Esborrar Sprint' }),
            message: t('confirm_delete_sprint'),
            color: "danger",
            action: async () => {
                try {
                    await sprintService.deleteSprint(id, sprintId);
                    setSprints(prev => prev.filter(s => s.id !== sprintId));
                    setTasks(prev => prev.map(t => t.sprintId === sprintId ? { ...t, sprintId: null } : t));
                    toast.success(t('success_delete_sprint', { defaultValue: 'Sprint esborrat correctament' }));
                } catch (error) {
                    console.error("Error esborrant sprint", error);
                    toast.error(t('error_delete_sprint')); 
                }
            }
        });
    };

    const handleCompleteSprint = (sprintId: number) => {
        if (!id) return;
        setConfirmData({
            isOpen: true,
            title: t('complete_sprint_title', { defaultValue: 'Completar Sprint' }),
            message: t('confirm_complete_sprint'),
            color: "success",
            action: async () => {
                try {
                    const updatedSprint = await sprintService.completeSprint(id, sprintId);
                    setSprints(prev => prev.map(s => s.id === sprintId ? updatedSprint : s));
                    setActiveTab("backlog");
                    toast.success(t('success_complete_sprint'));
                } catch (error) {
                    console.error("Error completant sprint", error);
                    toast.error(t('error_complete_sprint', { defaultValue: "No s'ha pogut completar l'sprint." }));
                }
            }
        });
    };

    const onDragEndTablero = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        const movedTaskId = Number(draggableId);
        const newStatus = destination.droppableId as TaskStatus;
        
        const previousTasks = [...tasks];
        
        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, status: newStatus } : t));
        
        try { 
            await taskService.updateStatus(movedTaskId, newStatus); 
        } catch (error: any) { 
            console.error("Error movent tasca", error);
            setTasks(previousTasks);
            toast.error(error.response?.data?.message || t('error_move_task')); 
        }
    };

    const onDragEndBacklog = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const movedTaskId = Number(draggableId);
        const isDestBacklog = destination.droppableId === "backlog";
        const targetSprintId = isDestBacklog ? null : Number(destination.droppableId.replace('sprint-', ''));

        setTasks(prev => prev.map(t => t.id === movedTaskId ? { ...t, sprintId: targetSprintId } : t));
        try { 
            await taskService.updateTask(movedTaskId, { sprintId: targetSprintId === null ? -1 : targetSprintId }); 
            toast.success(isDestBacklog ? 'Tasca moguda al Backlog' : 'Tasca afegida a l\'Sprint');
        } 
        catch (error) { 
            console.error("Error movent tasca de sprint", error); 
            toast.error("Error movent la tasca de l'Sprint");
        }
    };

    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    const uniqueAssignees = Array.from(new Set(tasks.filter(t => t.assigneeEmail).map(t => t.assigneeEmail)));

    const tableroTasks = tasks.filter(task => {
        const matchSprint = task.sprintId === activeSprint?.id;
        const matchType = filterType === "ALL" || task.type === filterType;
        const matchAssignee = filterAssignee === "ALL" || task.assigneeEmail === filterAssignee;
        return matchSprint && matchType && matchAssignee;
    });

    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Spinner size="lg" /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="flex flex-col h-full gap-5">
                
                <div className="flex justify-between items-center px-2 text-foreground">
                    <div>
                        <h1 className="text-3xl font-bold">{project?.title}</h1>
                        <div className="flex gap-2 items-center text-default-500">
                            <span>{project?.description}</span>
                            {project?.subject && <Chip size="sm" variant="flat" color="secondary">📚 {project.subject}</Chip>}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button color="secondary" variant="flat" onPress={onInviteOpen}>👥 {t('invite_button')}</Button>
                        <Button color="primary" variant="shadow" onPress={onCreateOpen}>{t('new_task_button')}</Button>
                    </div>
                </div>

                <div className="px-2">
                    <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)} color="primary" variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12 text-default-500",
                            tabContent: "group-data-[selected=true]:text-foreground font-semibold"
                        }}>
                        <Tab key="backlog" title={<div className="flex items-center space-x-2"><span>📚 {t('tab_backlog')}</span></div>} />
                        <Tab key="tablero" title={<div className="flex items-center space-x-2"><span>🚀 {t('tab_board')}</span></div>} />
                        <Tab key="estadistiques" title={<div className="flex items-center space-x-2"><span>📊 {t('tab_stats')}</span></div>} />
                    </Tabs>
                </div>

                {activeTab === "backlog" && (
                    <DragDropContext onDragEnd={onDragEndBacklog}>
                        <div className="flex flex-col gap-6 p-2 pb-10 h-[calc(100vh-250px)] overflow-y-auto">
                            
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-foreground">{t('planned_sprints')}</h2>
                                <Button color="warning" variant="flat" size="sm" onPress={onSprintOpen}>{t('new_sprint_button')}</Button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {sprints.filter(s => s.status !== 'CLOSED').map(sprint => (
                                    <div key={sprint.id} className="bg-content1 border border-divider rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-foreground font-bold text-lg">⏱️ {sprint.name}</h4>
                                                <Chip size="sm" color={sprint.status === 'ACTIVE' ? 'success' : 'warning'} variant="flat">{sprint.status}</Chip>
                                                <span className="text-xs text-default-400">
                                                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {sprint.status === 'PLANNED' && (
                                                    <Button size="sm" color="primary" variant="flat" isLoading={startingSprint === sprint.id} onPress={() => handleStartSprint(sprint.id)}>
                                                        {t('start_sprint_button')}
                                                    </Button>
                                                )}
                                                <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDeleteSprint(sprint.id)} title={t('delete_sprint_tooltip')}>
                                                    🗑️
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <Droppable droppableId={`sprint-${sprint.id}`}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[60px] bg-default-50 p-3 rounded-lg border border-divider border-dashed">
                                                    {tasks.filter(t => t.sprintId === sprint.id).map((task, index) => (
                                                        <Draggable key={`sp-${task.id}`} draggableId={task.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                    className="bg-content2 p-3 rounded-lg border border-divider flex justify-between items-center mb-2 hover:border-primary/50 cursor-grab shadow-sm"
                                                                    onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm text-foreground font-medium">{task.title}</span>
                                                                        {task.links && task.links.length > 0 && (
                                                                            <span className="text-xs opacity-50" title={`${task.links.length} enllaços`}>🔗</span>
                                                                        )}
                                                                    </div>
                                                                    <Chip size="sm" variant="flat">{task.status}</Chip>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {tasks.filter(t => t.sprintId === sprint.id).length === 0 && (
                                                        <p className="text-center text-default-500 text-sm py-2">{t('drag_tasks_here')}</p>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-foreground mb-4">{t('unassigned_tasks')}</h2>
                                <Droppable droppableId="backlog">
                                    {(provided) => {
                                        const backlogTasks = tasks.filter(t => 
                                            !t.parentTaskId && 
                                            (!t.sprintId || sprints.find(s => s.id === t.sprintId)?.status === 'CLOSED') &&
                                            t.status === 'BACKLOG' 
                                        );
                                        return (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="bg-content1 border border-divider rounded-xl p-4 min-h-[150px] shadow-sm">
                                                {backlogTasks.map((task, index) => (
                                                    <Draggable key={`bl-${task.id}`} draggableId={task.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                className="bg-content2 p-3 rounded-lg border border-divider flex justify-between items-center mb-2 hover:border-primary/50 cursor-grab shadow-sm"
                                                                onClick={() => { setSelectedTask(task); onEditOpen(); }}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-foreground font-medium">{task.title}</span>
                                                                    {task.links && task.links.length > 0 && (
                                                                        <span className="text-xs opacity-50" title={`${task.links.length} enllaços`}>🔗</span>
                                                                    )}
                                                                </div>
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
                                                    <p className="text-center text-default-500 text-sm italic py-4">{t('empty_backlog')}</p>
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
                                            <h3 className="font-bold text-lg">{t('active_sprint')} {activeSprint.name}</h3>
                                            <p className="text-xs opacity-80">
                                                {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" color="success" variant="flat" className="font-bold" onPress={() => handleCompleteSprint(activeSprint.id)}>
                                        {t('complete_sprint_button')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-content2/80 border border-divider text-default-500 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                                    <span>ℹ️</span><p className="text-sm">{t('no_active_sprint')}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 items-center bg-content1 p-4 rounded-xl border border-divider shrink-0 mx-2 shadow-sm">
                            <span className="text-foreground font-bold text-sm">{t('filters_label')}</span>
                            
                            <Select 
                                label={t('filter_type')} 
                                selectedKeys={new Set([filterType])} 
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    if (selected) setFilterType(selected);
                                }}
                                size="sm" 
                                className="w-32" 
                                variant="bordered"
                            >
                                <SelectItem key="ALL" textValue={t('filter_all') as string}>{t('filter_all')}</SelectItem>
                                <SelectItem key="TASK" textValue={`📝 ${t('type_task')}`}>📝 {t('type_task')}</SelectItem>
                                <SelectItem key="FEATURE" textValue={`🚀 ${t('type_feature')}`}>🚀 {t('type_feature')}</SelectItem>
                                <SelectItem key="BUG" textValue={`🐛 ${t('type_bug')}`}>🐛 {t('type_bug')}</SelectItem>
                            </Select>
                            
                            <Select 
                                label={t('filter_assignee')} 
                                selectedKeys={new Set([filterAssignee])} 
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    if (selected) setFilterAssignee(selected);
                                }}
                                size="sm" 
                                className="w-48" 
                                variant="bordered"
                            >
                                {["ALL", ...uniqueAssignees].map((email) => (
                                    <SelectItem 
                                        key={email as string} 
                                        textValue={email === "ALL" ? (t('filter_everyone') as string) : (email as string)}
                                    >
                                        {email === "ALL" ? t('filter_everyone') : (email as string)}
                                    </SelectItem>
                                ))}
                            </Select>
                            
                            {(filterType !== "ALL" || filterAssignee !== "ALL") && (
                                <Button size="sm" color="danger" variant="flat" onPress={() => { setFilterType("ALL"); setFilterAssignee("ALL"); }}>{t('clear_filters')}</Button>
                            )}
                        </div>

                        <DragDropContext onDragEnd={onDragEndTablero}>
                            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-340px)] px-2">
                                {COLUMNS_KEYS.map((column) => (
                                    <Droppable key={column.id} droppableId={column.id}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[280px] w-full bg-default-50/50 rounded-xl border border-divider flex flex-col shadow-sm">
                                                <div className="p-4 border-b border-divider flex justify-between items-center bg-content2 rounded-t-xl">
                                                    <h3 className="font-bold text-foreground">{t(column.titleKey)}</h3>
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
                                                                        <Card className="bg-content1 border border-divider hover:border-primary/50 cursor-grab shadow-sm">
                                                                            <CardHeader className="pb-0 text-foreground font-semibold text-sm">{task.title}</CardHeader>
                                                                            <CardBody className="pt-3 pb-3 text-xs">
                                                                                <div className="flex justify-between items-center w-full mt-2">
                                                                                    <div className="flex flex-wrap gap-1 items-center">
                                                                                        <Chip size="sm" variant="flat" color={typeStyle?.color as any || "default"}>
                                                                                            {typeStyle?.icon} {t(typeStyle?.labelKey)}
                                                                                        </Chip>
                                                                                        <Chip size="sm" variant="flat" color={priorityStyle?.color as any || "default"}>
                                                                                            {priorityStyle?.icon}
                                                                                        </Chip>
                                                                                        
                                                                                        {task.links && task.links.length > 0 && (
                                                                                            <span className="ml-1 text-[10px] text-default-400 font-bold bg-default-100 px-1.5 py-0.5 rounded-md" title={`${task.links.length} enllaços adjunts`}>
                                                                                                🔗 {task.links.length}
                                                                                            </span>
                                                                                        )}
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
                        <ProjectAnalytics tasks={tasks} sprints={sprints} />
                    </div>
                )}
                
                <CreateTaskModal 
                    isOpen={isCreateOpen} 
                    onOpenChange={onCreateOpenChange} 
                    projectId={id!} 
                    onTaskCreated={(t) => {
                        setTasks([...tasks, t]);
                        toast.success(t('task_created_success', { defaultValue: 'Tasca creada amb èxit!' })); 
                    }} 
                    sprintId={activeTab === "tablero" ? activeSprint?.id : null}
                />                
                
                <EditTaskModal 
                    isOpen={isEditOpen} 
                    onOpenChange={onEditOpenChange} 
                    task={selectedTask} 
                    projectId={id!} 
                    onTaskUpdated={(ut) => {
                        setTasks(tasks.map(t => t.id === ut.id ? ut : t));
                        toast.success(t('task_updated_success', { defaultValue: 'Tasca actualitzada!' })); 
                    }} 
                    onTaskDeleted={(tid) => {
                        setTasks(tasks.filter(t => t.id !== tid));
                        toast.success(t('task_deleted_success', { defaultValue: 'Tasca esborrada' })); 
                    }} 
                />
                
                <InviteMemberModal isOpen={isInviteOpen} onOpenChange={onInviteOpenChange} projectId={id!} />
                
                <CreateSprintModal 
                    isOpen={isSprintOpen} 
                    onOpenChange={onSprintOpenChange} 
                    projectId={id!} 
                    onSprintCreated={(newSprint) => {
                        setSprints([...sprints, newSprint]);
                        toast.success(t('sprint_created_success', { defaultValue: 'Nou Sprint planificat!' })); 
                    }} 
                />

                {confirmData && (
                    <ConfirmModal
                        isOpen={confirmData.isOpen}
                        onOpenChange={(isOpen) => setConfirmData(isOpen ? confirmData : null)}
                        title={confirmData.title}
                        message={confirmData.message}
                        onConfirm={confirmData.action}
                        cancelText={t('cancel')}
                        confirmText={t('confirm', { defaultValue: "Confirmar" })}
                        color={confirmData.color}
                    />
                )}

            </div>
        </MainLayout>
    );
}