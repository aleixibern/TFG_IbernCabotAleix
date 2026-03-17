import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Divider, Checkbox, Chip } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import type { Task } from '../types/Task';
import type { Comment } from '../types/Comment';
import { ConfirmModal } from './ConfirmModal'; 

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
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const [links, setLinks] = useState<string[]>([]);
    const [newLink, setNewLink] = useState('');

    const [subtasks, setSubtasks] = useState<Task[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [loadingSubtask, setLoadingSubtask] = useState(false);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loadingComment, setLoadingComment] = useState(false);

    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [dependencyIds, setDependencyIds] = useState<Set<string>>(new Set());

    const [confirmData, setConfirmData] = useState<{
        isOpen: boolean, 
        title: string, 
        message: string, 
        action: () => void,
        color: "danger" | "warning" | "primary" | "success"
    } | null>(null);

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title);
            setDescription(task.description || '');
            setType(task.type || 'TASK');
            setPriority(task.priority || 'MEDIUM');
            setDueDate(task.dueDate || '');
            setAssigneeEmail(task.assigneeEmail || '');
            setSubtasks(task.subtasks || []);
            setLinks(task.links || []);
            
            if (task.dependencies) {
                setDependencyIds(new Set(task.dependencies.map(d => d.id.toString())));
            } else {
                setDependencyIds(new Set());
            }

            loadComments(task.id);
            loadAvailableTasks(task.id);
        }
    }, [task, isOpen]);

    const loadComments = async (taskId: number) => {
        try {
            const data = await commentService.getCommentsByTask(taskId);
            setComments(data);
        } catch (error) {
            console.error("Error carregant comentaris", error);
        }
    };

    const loadAvailableTasks = async (currentTaskId: number) => {
        try {
            const allTasks = await taskService.getTasksByProject(projectId);
            const filteredTasks = allTasks.filter(t => t.id !== currentTaskId && t.parentTaskId !== currentTaskId);
            setAvailableTasks(filteredTasks);
        } catch (error) {
            console.error("Error carregant tasques per a dependències", error);
        }
    };

    const handleAddLink = () => {
        if (!newLink.trim()) return;
        if (!links.includes(newLink.trim())) {
            setLinks([...links, newLink.trim()]);
        }
        setNewLink('');
    };

    const handleRemoveLink = (linkToRemove: string) => {
        setLinks(links.filter(l => l !== linkToRemove));
    };

    const handleUpdate = async (onClose: () => void) => {
        if (!task || !title) return;
        setLoading(true);
        try {
            const finalAssigneeEmail = assigneeEmail === '' ? 'UNASSIGNED' : assigneeEmail;
            const finalDependencyIds = Array.from(dependencyIds).map(id => Number(id));

            const updatedTask = await taskService.updateTask(task.id, {
                title, 
                description, 
                type, 
                priority, 
                dueDate: dueDate || undefined, 
                assigneeEmail: finalAssigneeEmail,
                links: links,
                dependencyIds: finalDependencyIds 
            });
            onTaskUpdated(updatedTask);
            onClose();
        } catch (error) {
            console.error("Error actualitzant tasca", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (onCloseEdit: () => void) => {
        if (!task) return;
        setConfirmData({
            isOpen: true,
            title: t('delete_task_btn', { defaultValue: 'Esborrar Tasca' }),
            message: t('confirm_delete_task'),
            color: "danger",
            action: async () => {
                setLoading(true);
                try {
                    await taskService.deleteTask(task.id);
                    onTaskDeleted(task.id);
                    onCloseEdit(); 
                } catch (error) {
                    console.error("Error esborrant tasca", error);
                } finally {
                    setLoading(false);
                }
            }
        });
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

    const handleDeleteSubtask = (subtaskId: number) => {
        if (!task) return;
        setConfirmData({
            isOpen: true,
            title: t('delete_subtask_btn', { defaultValue: 'Esborrar Subtasca' }),
            message: t('confirm_delete_subtask'),
            color: "danger",
            action: async () => {
                try {
                    await taskService.deleteTask(subtaskId);
                    const updatedList = subtasks.filter(st => st.id !== subtaskId);
                    setSubtasks(updatedList);
                    onTaskUpdated({ ...task, subtasks: updatedList } as Task);
                } catch (error) {
                    console.error("Error esborrant subtasca", error);
                }
            }
        });
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
        <>
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
                backdrop="blur" 
                size="2xl" 
                scrollBehavior="inside"
                classNames={{
                    base: "bg-content1 text-foreground border border-divider shadow-lg",
                    header: "border-b border-divider",
                    footer: "border-t border-divider bg-content1",
                    closeButton: "hover:bg-default-100 active:bg-default-200"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>✏️ {t('edit_task_title')}</ModalHeader>
                            <ModalBody className="gap-4 py-6">
                                <Input label={t('task_title')} value={title} onValueChange={setTitle} variant="bordered" />
                                <Textarea label={t('task_description')} value={description} onValueChange={setDescription} variant="bordered" />
                                
                                <div className="flex gap-4">
                                    <Select 
                                        label={t('filter_type')} 
                                        selectedKeys={new Set([type])} 
                                        onSelectionChange={(keys) => {
                                            const selectedKey = Array.from(keys)[0] as string;
                                            if (selectedKey) setType(selectedKey);
                                        }} 
                                        variant="bordered"
                                    >
                                        <SelectItem key="TASK" textValue={`📝 ${t('type_task')}`}>📝 {t('type_task')}</SelectItem>
                                        <SelectItem key="FEATURE" textValue={`🚀 ${t('type_feature')}`}>🚀 {t('type_feature')}</SelectItem>
                                        <SelectItem key="BUG" textValue={`🐛 ${t('type_bug')}`}>🐛 {t('type_bug')}</SelectItem>
                                    </Select>

                                    <Select 
                                        label={t('task_priority')} 
                                        selectedKeys={new Set([priority])} 
                                        onSelectionChange={(keys) => {
                                            const selectedKey = Array.from(keys)[0] as string;
                                            if (selectedKey) setPriority(selectedKey);
                                        }} 
                                        variant="bordered"
                                    >
                                        <SelectItem key="LOW" textValue={`🟢 ${t('priority_low')}`}>🟢 {t('priority_low')}</SelectItem>
                                        <SelectItem key="MEDIUM" textValue={`🟡 ${t('priority_medium')}`}>🟡 {t('priority_medium')}</SelectItem>
                                        <SelectItem key="HIGH" textValue={`🟠 ${t('priority_high')}`}>🟠 {t('priority_high')}</SelectItem>
                                        <SelectItem key="URGENT" textValue={`🔴 ${t('priority_urgent')}`}>🔴 {t('priority_urgent')}</SelectItem>
                                    </Select>
                                </div>

                                <div className="flex gap-4">
                                    <Input type="date" label={t('task_due_date')} value={dueDate} onValueChange={setDueDate} variant="bordered" />
                                    <Input label={t('task_assignee')} placeholder={t('assignee_placeholder')} value={assigneeEmail} onValueChange={setAssigneeEmail} variant="bordered" />
                                </div>

                                <Divider className="my-1 bg-divider" />

                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        🔗 {t('depends_on')}
                                    </h4>
                                    <Select 
                                        label={t('blocking_tasks')} 
                                        placeholder={t('blocking_tasks_placeholder')}
                                        selectionMode="multiple" 
                                        selectedKeys={dependencyIds} 
                                        onSelectionChange={(keys) => setDependencyIds(new Set(Array.from(keys).map(String)))}
                                        variant="bordered"
                                    >
                                        {availableTasks.map((t) => (
                                            <SelectItem key={t.id.toString()} textValue={t.title}>
                                                <div className="flex justify-between items-center w-full">
                                                    <span>{t.title}</span>
                                                    <Chip size="sm" variant="flat" className="ml-2">{t.status}</Chip>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    {dependencyIds.size > 0 && (
                                        <p className="text-xs text-warning">{t('task_blocked_by', { count: dependencyIds.size })}</p>
                                    )}
                                </div>

                                <Divider className="my-1 bg-divider" />
                                
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        🗂️ {t('subtasks')} <Chip size="sm" variant="flat">{subtasks.length}</Chip>
                                    </h4>
                                    {subtasks.length > 0 && (
                                        <div className="flex flex-col gap-2 mb-2">
                                            {subtasks.map((st) => (
                                                <div key={st.id} className="flex justify-between items-center bg-content2 p-2 rounded-lg border border-divider hover:border-primary/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox isSelected={st.status === 'DONE'} onValueChange={() => handleToggleSubtask(st.id, st.status)} color="success" size="sm" />
                                                        <span className={`text-sm ${st.status === 'DONE' ? 'line-through text-default-500' : 'text-foreground'}`}>{st.title}</span>
                                                    </div>
                                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteSubtask(st.id)}>✕</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input size="sm" placeholder={t('new_subtask_placeholder')} value={newSubtaskTitle} onValueChange={setNewSubtaskTitle} variant="bordered" onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} />
                                        <Button size="sm" color="secondary" variant="flat" onPress={handleAddSubtask} isLoading={loadingSubtask}>{t('add')}</Button>
                                    </div>
                                </div>

                                <Divider className="my-1 bg-divider" />

                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        📎 {t('attached_links')} <Chip size="sm" variant="flat" color="warning">{links.length}</Chip>
                                    </h4>
                                    {links.length > 0 && (
                                        <div className="flex flex-col gap-2 mb-2">
                                            {links.map((link, index) => (
                                                <div key={index} className="flex justify-between items-center bg-content2 p-2 rounded-lg border border-divider">
                                                    <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate flex-1 mr-2">
                                                        {link}
                                                    </a>
                                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleRemoveLink(link)}>✕</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input 
                                            size="sm" 
                                            placeholder={t('add_link_placeholder')} 
                                            value={newLink} 
                                            onValueChange={setNewLink} 
                                            variant="bordered" 
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()} 
                                        />
                                        <Button size="sm" color="warning" variant="flat" onPress={handleAddLink}>+ Link</Button>
                                    </div>
                                </div>

                                <Divider className="my-1 bg-divider" />

                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        💬 {t('comments')} <Chip size="sm" variant="flat">{comments.length}</Chip>
                                    </h4>
                                    
                                    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
                                        {comments.length === 0 ? (
                                            <p className="text-xs text-default-500 text-center py-4">{t('no_comments')}</p>
                                        ) : (
                                            comments.map(comment => (
                                                <div key={comment.id} className="flex gap-3 items-start">
                                                    <div title={comment.authorName} className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-1">
                                                        {getInitials(comment.authorName)}
                                                    </div>
                                                    <div className="bg-content2 rounded-xl rounded-tl-none p-3 border border-divider text-sm text-foreground w-full">
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
                                            placeholder={t('write_comment_placeholder')} 
                                            value={newCommentText} 
                                            onValueChange={setNewCommentText}
                                            variant="bordered"
                                            className="flex-1"
                                        />
                                        <Button color="primary" onPress={handleAddComment} isLoading={loadingComment} className="mb-1">
                                            {t('send')}
                                        </Button>
                                    </div>
                                </div>

                            </ModalBody>
                            <ModalFooter className="flex justify-between">
                                <Button color="danger" variant="flat" onPress={() => handleDelete(onClose)}>🗑️ {t('delete_task_btn')}</Button>
                                <div className="flex gap-2">
                                    <Button variant="flat" onPress={onClose}>{t('cancel')}</Button>
                                    <Button color="primary" isLoading={loading} onPress={() => handleUpdate(onClose)}>{t('save_changes_btn')}</Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {confirmData && (
                <ConfirmModal
                    isOpen={confirmData.isOpen}
                    onOpenChange={(isOpen) => setConfirmData(isOpen ? confirmData : null)}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.action}
                    cancelText={t('cancel')}
                    confirmText={t('delete', { defaultValue: "Esborrar" })}
                    color={confirmData.color}
                />
            )}
        </>
    );
};