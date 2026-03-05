import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { taskService } from '../services/taskService';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    onTaskCreated: (task: any) => void;
    // NOU: Permetem rebre l'ID de l'Sprint per defecte
    sprintId?: number | null;
}

export const CreateTaskModal = ({ isOpen, onOpenChange, projectId, onTaskCreated, sprintId }: Props) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (onClose: () => void) => {
        if (!title) return;
        setLoading(true);
        try {
            const newTask = await taskService.createTask(projectId, {
                title,
                description,
                type,
                priority,
                dueDate: dueDate || undefined,
                assigneeEmail: assigneeEmail || undefined,
                // NOU: Si tenim un SprintId, l'enviem a la base de dades
                sprintId: sprintId || undefined
            });
            onTaskCreated(newTask);
            
            // Netejar el formulari
            setTitle(''); setDescription(''); setType('TASK'); setPriority('MEDIUM'); setDueDate(''); setAssigneeEmail('');
            onClose();
        } catch (error) {
            console.error("Error creant tasca", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <div className="flex flex-col gap-1">
                                <span>✨ Nova Tasca</span>
                                {/* Afegim un petit avís visual perquè l'usuari s'adoni on va la tasca */}
                                {sprintId && <span className="text-xs text-primary">Aquesta tasca s'afegirà a l'Sprint actiu</span>}
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-4">
                            <Input label="Títol" value={title} onValueChange={setTitle} isRequired variant="bordered" />
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
                                <Input label="Assignar a (Email)" placeholder="usuari@exemple.com" value={assigneeEmail} onValueChange={setAssigneeEmail} variant="bordered" />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>Cancel·lar</Button>
                            <Button color="primary" isLoading={loading} onPress={() => handleCreate(onClose)}>Crear Tasca</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};