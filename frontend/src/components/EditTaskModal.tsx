import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { taskService } from '../services/taskService';
import type { Task } from '../types/Task';

interface EditTaskModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    task: Task | null; 
    onTaskUpdated: (updatedTask: Task) => void;
    onTaskDeleted: (taskId: number) => void; 
}

export const EditTaskModal = ({ isOpen, onOpenChange, task, onTaskUpdated, onTaskDeleted }: EditTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        }
    }, [task]);

    const handleUpdate = async (onClose: () => void) => {
        if (!task || !title.trim()) return;
        setLoading(true);
        try {
            const updated = await taskService.updateTask(task.id, title, description);
            onTaskUpdated(updated);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error al guardar els canvis.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (onClose: () => void) => {
        if (!task || !window.confirm("Segur que vols esborrar aquesta tasca?")) return;
        setLoading(true);
        try {
            await taskService.deleteTask(task.id);
            onTaskDeleted(task.id);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error a l'esborrar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-white">Editar Tasca ✏️</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Títol"
                                variant="bordered"
                                value={title}
                                onValueChange={setTitle}
                            />
                            <Textarea
                                label="Descripció"
                                variant="bordered"
                                value={description}
                                onValueChange={setDescription}
                            />
                        </ModalBody>
                        <ModalFooter className="flex justify-between">
                            <Button color="danger" variant="light" onPress={() => handleDelete(onClose)}>
                                Esborrar 🗑️
                            </Button>
                            <div className="flex gap-2">
                                <Button color="default" variant="flat" onPress={onClose}>
                                    Tancar
                                </Button>
                                <Button color="primary" onPress={() => handleUpdate(onClose)} isLoading={loading}>
                                    Guardar
                                </Button>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};