import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { epicService } from '../services/epicService';
import type { Epic } from '../types/Epic';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    onEpicCreated: (epic: Epic) => void;
}

const EPIC_COLORS = [
    { value: '#006fee', label: 'Blau' },
    { value: '#9353d3', label: 'Lila' },
    { value: '#17c964', label: 'Verd' },
    { value: '#f5a524', label: 'Taronja' },
    { value: '#f31260', label: 'Vermell' }
];

export const CreateEpicModal = ({ isOpen, onOpenChange, projectId, onEpicCreated }: Props) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#9353d3'); 
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (onClose: () => void) => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const newEpic = await epicService.createEpic(projectId, { title, description, color });
            onEpicCreated(newEpic);
            
            setTitle('');
            setDescription('');
            setColor('#9353d3');
            
            toast.success(t('success_create_epic', { defaultValue: 'Èpica creada correctament!' }));
            onClose();
        } catch (error) {
            console.error("Error creant l'èpica", error);
            toast.error(t('error_create_epic', { defaultValue: "Error al crear l'Èpica" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <span className="text-xl">{t('create_epic_modal_title')}</span>
                            <span className="text-xs text-default-500 font-normal">{t('create_epic_modal_desc')}</span>
                        </ModalHeader>
                        <ModalBody>
                            <Input 
                                autoFocus 
                                label={t('epic_title_label')} 
                                placeholder={t('epic_title_placeholder')} 
                                value={title} 
                                onValueChange={setTitle} 
                                variant="bordered" 
                                isRequired
                            />
                            <Textarea 
                                label={t('epic_desc_label')} 
                                placeholder={t('epic_desc_placeholder')} 
                                value={description} 
                                onValueChange={setDescription} 
                                variant="bordered" 
                            />
                            
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-sm text-foreground">{t('epic_color_label')}</label>
                                <div className="flex gap-3">
                                    {EPIC_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setColor(c.value)}
                                            className={`w-8 h-8 rounded-full transition-transform ${color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-foreground' : 'opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>{t('cancel')}</Button>
                            <Button color="secondary" isLoading={loading} onPress={() => handleSubmit(onClose)}>
                                {t('submit_epic_btn')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};