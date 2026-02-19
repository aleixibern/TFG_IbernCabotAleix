import { useState, useEffect } from 'react';
// IMPORT CORREGIT: Hem afegit 'Chip' aquí
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Divider, Checkbox, Chip } from "@heroui/react";
import { taskService } from '../services/taskService';
import type { Task } from '../types/Task';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    task: Task | null;
    projectId: string;
    onTaskUpdated: (task: Task) => void;
    onTaskDeleted: (taskId: number) => void;
}

export const EditTaskModal = ({ isOpen, onOpenChange, task, projectId, onTaskUpdated, onTaskDeleted }: Props) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const [subtasks, setSubtasks] = useState<Task[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [loadingSubtask, setLoadingSubtask] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setType(task.type || 'TASK');
            setPriority(task.priority || 'MEDIUM');
            setDueDate(task.dueDate || '');
            setAssigneeEmail(task.assigneeEmail || '');
            setSubtasks(task.subtasks || []);
        }
    }, [task]);

    const handleUpdate = async (onClose: () => void) => {
        if (!task || !title) return;
        setLoading(true);
        try {
            const updatedTask = await taskService.updateTask(task.id, {
                title, description, type, priority, 
                dueDate: dueDate || undefined, assigneeEmail: assigneeEmail || undefined
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
        if (confirm("Segur que vols esborrar aquesta tasca? (S'esborraran també les subtasques)")) {
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
            const newSub = await taskService.createTask(projectId, {
                title: newSubtaskTitle,
                parentTaskId: task.id,
                type: 'TASK'
            });
            const updatedList = [...subtasks, newSub];
            setSubtasks(updatedList);
            // CORRECCIÓ TYPESCRIPT: Afegit 'as Task'
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
            // CORRECCIÓ TYPESCRIPT: Afegit 'as Task'
            onTaskUpdated({ ...task, subtasks: updatedList } as Task);
        } catch (error) {
            console.error("Error canviant estat de la subtasca", error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        if (!task) return;
        if (confirm("Esborrar aquesta subtasca?")) {
            try {
                await taskService.deleteTask(subtaskId);
                const updatedList = subtasks.filter(st => st.id !== subtaskId);
                setSubtasks(updatedList);
                // CORRECCIÓ TYPESCRIPT: Afegit 'as Task'
                onTaskUpdated({ ...task, subtasks: updatedList } as Task);
            } catch (error) {
                console.error("Error esborrant subtasca", error);
            }
        }
    };

    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>✏️ Editar Tasca</ModalHeader>
                        <ModalBody className="gap-4">
                            <Input label="Títol" value={title} onValueChange={setTitle} variant="bordered" />
                            <Textarea label="Descripció" value={description} onValueChange={setDescription} variant="bordered" />
                            
                            <div className="flex gap-4">
                                {/* CORRECCIÓ: Hem tret els value="..." */}
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
                                <Input label="Assignar a (Email)" placeholder="usuari@exemple.com" value={assigneeEmail} onValueChange={setAssigneeEmail} variant="bordered" />
                            </div>

                            <Divider className="my-1" />
                            
                            <div className="flex flex-col gap-2">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    🗂️ Subtasques <Chip size="sm" variant="flat">{subtasks.length}</Chip>
                                </h4>
                                
                                {subtasks.length > 0 && (
                                    <div className="flex flex-col gap-2 mb-2 max-h-40 overflow-y-auto pr-1">
                                        {subtasks.map((st) => (
                                            <div key={st.id} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox 
                                                        isSelected={st.status === 'DONE'} 
                                                        onValueChange={() => handleToggleSubtask(st.id, st.status)}
                                                        color="success" 
                                                        size="sm"
                                                    />
                                                    <span className={`text-sm ${st.status === 'DONE' ? 'line-through text-default-500' : 'text-white'}`}>
                                                        {st.title}
                                                    </span>
                                                </div>
                                                <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteSubtask(st.id)}>
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Input 
                                        size="sm" 
                                        placeholder="Escriu una nova subtasca i prem Enter..." 
                                        value={newSubtaskTitle} 
                                        onValueChange={setNewSubtaskTitle}
                                        variant="bordered"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                    />
                                    <Button size="sm" color="secondary" variant="flat" onPress={handleAddSubtask} isLoading={loadingSubtask}>
                                        Afegir
                                    </Button>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex justify-between">
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