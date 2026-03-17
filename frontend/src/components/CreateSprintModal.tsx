import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { sprintService } from "../services/sprintService";
import type { Sprint } from "../types/Sprint";

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    projectId: string;
    onSprintCreated: (sprint: Sprint) => void;
}

export const CreateSprintModal = ({ isOpen, onOpenChange, projectId, onSprintCreated }: Props) => {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (onClose: () => void) => {
        if (!name.trim() || !startDate || !endDate) return;
        setLoading(true);
        try {
            const newSprint = await sprintService.createSprint(projectId, { name, startDate, endDate });
            onSprintCreated(newSprint);
            setName("");
            setStartDate("");
            setEndDate("");
            onClose();
        } catch (error) {
            console.error("Error creant sprint", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            backdrop="blur" 
            placement="top-center"
            classNames={{
                base: "bg-content1 text-foreground border border-divider shadow-lg",
                header: "border-b border-divider",
                footer: "border-t border-divider",
                closeButton: "hover:bg-default-100 active:bg-default-200"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="font-bold text-xl">🏃‍♂️ Nou Sprint</ModalHeader>
                        <ModalBody className="py-6 gap-4">
                            <Input 
                                autoFocus 
                                label="Nom del Sprint" 
                                placeholder="Ex: Sprint 1 - MVP" 
                                value={name} 
                                onValueChange={setName} 
                                variant="bordered" 
                            />
                            <div className="flex gap-4">
                                <Input 
                                    type="date" 
                                    label="Data d'inici" 
                                    value={startDate} 
                                    onValueChange={setStartDate} 
                                    variant="bordered" 
                                />
                                <Input 
                                    type="date" 
                                    label="Data final" 
                                    value={endDate} 
                                    onValueChange={setEndDate} 
                                    variant="bordered" 
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel·lar
                            </Button>
                            <Button color="primary" isLoading={loading} onPress={() => handleSubmit(onClose)}>
                                Crear Sprint
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};