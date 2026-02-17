import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { taskService } from '../services/taskService';
import type { Task } from '../types/Task';

interface CreateTaskModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    onTaskCreated: (newTask: Task) => void; // Funció per avisar al pare que hem acabat
}

export const CreateTaskModal = ({ isOpen, onOpenChange, projectId, onTaskCreated }: CreateTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (onClose: () => void) => {
        if (!title.trim()) return;
        
        setLoading(true);
        setError('');

        try {
            // Cridem al servei per crear la tasca
            const newTask = await taskService.createTask(projectId, title, description);
            
            // Avisem al tauler que hi ha una tasca nova
            onTaskCreated(newTask);
            
            // Netejem i tanquem
            setTitle('');
            setDescription('');
            onClose();
        } catch (err) {
            console.error(err);
            setError('Error al crear la tasca.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-white">Nova Tasca 📝</ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus
                                label="Títol de la tasca"
                                placeholder="Ex: Dissenyar la base de dades"
                                variant="bordered"
                                value={title}
                                onValueChange={setTitle}
                                isRequired
                            />
                            <Textarea
                                label="Descripció"
                                placeholder="Detalls de la tasca..."
                                variant="bordered"
                                value={description}
                                onValueChange={setDescription}
                            />
                            {error && <p className="text-danger text-small">{error}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel·lar
                            </Button>
                            <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={loading}>
                                Crear Tasca
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};