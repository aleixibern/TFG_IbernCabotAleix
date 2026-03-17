import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    color?: "danger" | "primary" | "warning" | "success";
}

export const ConfirmModal = ({ 
    isOpen, 
    onOpenChange, 
    title, 
    message, 
    onConfirm, 
    confirmText = "Confirmar", 
    cancelText = "Cancel·lar", 
    color = "danger" 
}: Props) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            size="sm" 
            backdrop="blur" 
            classNames={{ base: "bg-content1 text-foreground border border-divider shadow-lg" }}
            style={{ zIndex: 9999 }} 
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>
                            <p className="text-sm text-default-500">{message}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>{cancelText}</Button>
                            <Button color={color} onPress={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};