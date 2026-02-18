import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { projectService } from '../services/projectService';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
}

export const InviteMemberModal = ({ isOpen, onOpenChange, projectId }: Props) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvite = async (onClose: () => void) => {
        if (!email) return;
        setLoading(true);
        try {
            await projectService.inviteMember(projectId, email);
            alert("Invitació enviada amb èxit!");
            setEmail('');
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || "Error enviant la invitació");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Convidar Membre 👥</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Email de l'usuari"
                                placeholder="usuari@exemple.com"
                                value={email}
                                onValueChange={setEmail}
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>Cancel·lar</Button>
                            <Button color="primary" isLoading={loading} onPress={() => handleInvite(onClose)}>
                                Enviar Invitació
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};