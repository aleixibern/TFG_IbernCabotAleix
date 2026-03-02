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
            // Netegem els camps
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" placement="top-center">
            <ModalContent className="bg-zinc-900 border border-white/10 text-white">
                {(onClose) => (
                    <>
                        <ModalHeader className="font-bold text-xl">🏃‍♂️ Nou Sprint</ModalHeader>
                        <ModalBody>
                            <Input 
                                autoFocus 
                                label="Nom del Sprint" 
                                placeholder="Ex: Sprint 1 - MVP" 
                                value={name} 
                                onValueChange={setName} 
                                variant="bordered" 
                                classNames={{ input: "text-white", label: "text-white/70" }} 
                            />
                            <div className="flex gap-4 mt-2">
                                <Input 
                                    type="date" 
                                    label="Data d'inici" 
                                    value={startDate} 
                                    onValueChange={setStartDate} 
                                    variant="bordered" 
                                    classNames={{ input: "text-white", label: "text-white/70" }} 
                                />
                                <Input 
                                    type="date" 
                                    label="Data final" 
                                    value={endDate} 
                                    onValueChange={setEndDate} 
                                    variant="bordered" 
                                    classNames={{ input: "text-white", label: "text-white/70" }} 
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