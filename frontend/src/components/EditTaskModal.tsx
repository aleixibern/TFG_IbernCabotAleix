import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Divider, Checkbox, Chip } from "@heroui/react";
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import type { Task } from '../types/Task';
import type { Comment } from '../types/Comment';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    task: Task | null;
    projectId: string;
    onTaskUpdated: (task: Task) => void;
    onTaskDeleted: (taskId: number) => void;
}

const getInitials = (name?: string) => {
    if (!name) return "?";
    const cleanName = name.trim();
    if (cleanName.includes('@')) return cleanName.substring(0, 2).toUpperCase();
    const words = cleanName.split(/[\s_-]+/);
    if (words.length >= 2) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
};

export const EditTaskModal = ({ isOpen, onOpenChange, task, projectId, onTaskUpdated, onTaskDeleted }: Props) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Estats Subtasques
    const [subtasks, setSubtasks] = useState<Task[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [loadingSubtask, setLoadingSubtask] = useState(false);

    // Estats Comentaris
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loadingComment, setLoadingComment] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setType(task.type || 'TASK');
            setPriority(task.priority || 'MEDIUM');
            setDueDate(task.dueDate || '');
            setAssigneeEmail(task.assigneeEmail || '');
            setSubtasks(task.subtasks || []);
            loadComments(task.id);
        }
    }, [task]);

    const loadComments = async (taskId: number) => {
        try {
            const data = await commentService.getCommentsByTask(taskId);
            setComments(data);
        } catch (error) {
            console.error("Error carregant comentaris", error);
        }
    };

    const handleUpdate = async (onClose: () => void) => {
        if (!task || !title) return;
        setLoading(true);
        try {
            // --- CANVI CLAU: Si esborrem el correu, enviem "UNASSIGNED" ---
            const finalAssigneeEmail = assigneeEmail === '' ? 'UNASSIGNED' : assigneeEmail;

            const updatedTask = await taskService.updateTask(task.id, {
                title, description, type, priority, 
                dueDate: dueDate || undefined, 
                assigneeEmail: finalAssigneeEmail 
            });
            onTaskUpdated(updatedTask);
            onClose();
        } catch (error) {
            console.error("Error actualitzant tasca", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (onClose: () => void) => {
        if (!task) return;
        if (confirm("Segur que vols esborrar aquesta tasca? (S'esborraran també les subtasques i comentaris)")) {
            setLoading(true);
            try {
                await taskService.deleteTask(task.id);
                onTaskDeleted(task.id);
                onClose();
            } catch (error) {
                console.error("Error esborrant tasca", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim() || !task) return;
        setLoadingSubtask(true);
        try {
            const newSub = await taskService.createTask(projectId, { title: newSubtaskTitle, parentTaskId: task.id, type: 'TASK' });
            const updatedList = [...subtasks, newSub];
            setSubtasks(updatedList);
            onTaskUpdated({ ...task, subtasks: updatedList } as Task);
            setNewSubtaskTitle('');
        } catch (error) {
            console.error("Error afegint subtasca", error);
        } finally {
            setLoadingSubtask(false);
        }
    };

    const handleToggleSubtask = async (subtaskId: number, currentStatus: string) => {
        if (!task) return;
        const newStatus = currentStatus === 'DONE' ? 'BACKLOG' : 'DONE';
        try {
            const updatedSub = await taskService.updateStatus(subtaskId, newStatus as any);
            const updatedList = subtasks.map(st => st.id === subtaskId ? updatedSub : st);
            setSubtasks(updatedList);
            onTaskUpdated({ ...task, subtasks: updatedList } as Task);
        } catch (error) {
            console.error("Error canviant estat", error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        if (!task) return;
        if (confirm("Esborrar aquesta subtasca?")) {
            try {
                await taskService.deleteTask(subtaskId);
                const updatedList = subtasks.filter(st => st.id !== subtaskId);
                setSubtasks(updatedList);
                onTaskUpdated({ ...task, subtasks: updatedList } as Task);
            } catch (error) {
                console.error("Error esborrant subtasca", error);
            }
        }
    };

    const handleAddComment = async () => {
        if (!newCommentText.trim() || !task) return;
        setLoadingComment(true);
        try {
            const newComment = await commentService.addComment(task.id, newCommentText);
            setComments([...comments, newComment]);
            setNewCommentText('');
        } catch (error) {
            console.error("Error enviant comentari", error);
        } finally {
            setLoadingComment(false);
        }
    };

    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="2xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>✏️ Editar Tasca</ModalHeader>
                        <ModalBody className="gap-4">
                            <Input label="Títol" value={title} onValueChange={setTitle} variant="bordered" />
                            <Textarea label="Descripció" value={description} onValueChange={setDescription} variant="bordered" />
                            
                            <div className="flex gap-4">
                                <Select label="Tipus" selectedKeys={[type]} onChange={(e) => setType(e.target.value)} variant="bordered">
                                    <SelectItem key="TASK">📝 Tasca</SelectItem>
                                    <SelectItem key="FEATURE">🚀 Feature</SelectItem>
                                    <SelectItem key="BUG">🐛 Bug</SelectItem>
                                </Select>
                                <Select label="Prioritat" selectedKeys={[priority]} onChange={(e) => setPriority(e.target.value)} variant="bordered">
                                    <SelectItem key="LOW">🟢 Baixa</SelectItem>
                                    <SelectItem key="MEDIUM">🟡 Mitjana</SelectItem>
                                    <SelectItem key="HIGH">🟠 Alta</SelectItem>
                                    <SelectItem key="URGENT">🔴 Urgent</SelectItem>
                                </Select>
                            </div>

                            <div className="flex gap-4">
                                <Input type="date" label="Data Límit" value={dueDate} onValueChange={setDueDate} variant="bordered" />
                                <Input label="Assignar a (Email)" placeholder="Deixa-ho buit per desassignar" value={assigneeEmail} onValueChange={setAssigneeEmail} variant="bordered" />
                            </div>

                            <Divider className="my-1" />
                            
                            {/* SUBTASQUES */}
                            <div className="flex flex-col gap-2">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    🗂️ Subtasques <Chip size="sm" variant="flat">{subtasks.length}</Chip>
                                </h4>
                                {subtasks.length > 0 && (
                                    <div className="flex flex-col gap-2 mb-2">
                                        {subtasks.map((st) => (
                                            <div key={st.id} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-white/5 hover:border-white/20">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox isSelected={st.status === 'DONE'} onValueChange={() => handleToggleSubtask(st.id, st.status)} color="success" size="sm" />
                                                    <span className={`text-sm ${st.status === 'DONE' ? 'line-through text-default-500' : 'text-white'}`}>{st.title}</span>
                                                </div>
                                                <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteSubtask(st.id)}>✕</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input size="sm" placeholder="Nova subtasca..." value={newSubtaskTitle} onValueChange={setNewSubtaskTitle} variant="bordered" onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} />
                                    <Button size="sm" color="secondary" variant="flat" onPress={handleAddSubtask} isLoading={loadingSubtask}>Afegir</Button>
                                </div>
                            </div>

                            <Divider className="my-1" />

                            {/* --- XAT DE COMENTARIS --- */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    💬 Comentaris <Chip size="sm" variant="flat">{comments.length}</Chip>
                                </h4>
                                
                                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
                                    {comments.length === 0 ? (
                                        <p className="text-xs text-default-500 text-center py-4">Cap comentari encara. Trenca el gel!</p>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment.id} className="flex gap-3 items-start">
                                                <div title={comment.authorName} className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-1">
                                                    {getInitials(comment.authorName)}
                                                </div>
                                                <div className="bg-zinc-800/80 rounded-xl rounded-tl-none p-3 border border-white/5 text-sm text-white w-full">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-xs text-primary">{comment.authorName}</span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex gap-2 items-end mt-2">
                                    <Textarea 
                                        minRows={1} 
                                        maxRows={3} 
                                        placeholder="Escriu un comentari..." 
                                        value={newCommentText} 
                                        onValueChange={setNewCommentText}
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                    <Button color="primary" onPress={handleAddComment} isLoading={loadingComment} className="mb-1">
                                        Enviar
                                    </Button>
                                </div>
                            </div>
                            {/* ------------------------- */}

                        </ModalBody>
                        <ModalFooter className="flex justify-between border-t border-white/10 pt-4 mt-2">
                            <Button color="danger" variant="flat" onPress={() => handleDelete(onClose)}>🗑️ Esborrar Tasca</Button>
                            <div className="flex gap-2">
                                <Button variant="flat" onPress={onClose}>Cancel·lar</Button>
                                <Button color="primary" isLoading={loading} onPress={() => handleUpdate(onClose)}>Guardar Canvis</Button>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};