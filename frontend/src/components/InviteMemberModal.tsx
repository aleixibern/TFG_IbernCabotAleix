import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Chip, Divider } from "@heroui/react";
import { projectService } from '../services/projectService';
import api from '../api/axios'; 

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
}

export const InviteMemberModal = ({ isOpen, onOpenChange, projectId }: Props) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<string[]>([]); 

    useEffect(() => {
        if (isOpen && projectId) {
            api.get(`/projects/${projectId}`).then(res => {
                setMembers(res.data.members || []);
            });
        }
    }, [isOpen, projectId]);

    const handleInvite = async (onClose: () => void) => {
        if (!email) return;
        
        if (members.includes(email)) {
            alert("Aquest usuari ja és membre del projecte!");
            return;
        }

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
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            backdrop="blur"
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
                        <ModalHeader>Gestió de l'Equip 👥</ModalHeader>
                        <ModalBody className="py-6">
                            <div className="mb-4">
                                <p className="text-small text-default-500 mb-2">Membres actuals:</p>
                                <div className="flex flex-wrap gap-2">
                                    {members.length > 0 ? (
                                        members.map((member, index) => (
                                            <Chip key={index} size="sm" color="primary" variant="flat">
                                                {member}
                                            </Chip>
                                        ))
                                    ) : (
                                        <p className="text-xs text-default-400">Només tu estàs al projecte.</p>
                                    )}
                                </div>
                            </div>
                            
                            <Divider className="my-2 bg-divider"/>

                            <Input
                                label="Convidar nou membre (Email)"
                                placeholder="amic@exemple.com"
                                value={email}
                                onValueChange={setEmail}
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>Tancar</Button>
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