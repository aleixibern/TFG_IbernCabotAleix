import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    onTaskCreated: (task: any) => void;
    sprintId?: number | null;
}

export const CreateTaskModal = ({ isOpen, onOpenChange, projectId, onTaskCreated, sprintId }: Props) => {
    const { t } = useTranslation();

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
                sprintId: sprintId || undefined
            });
            onTaskCreated(newTask);
            
            setTitle(''); 
            setDescription(''); 
            setType('TASK'); 
            setPriority('MEDIUM'); 
            setDueDate(''); 
            setAssigneeEmail('');
            
            onClose();
        } catch (error) {
            console.error("Error creant tasca", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            backdrop="blur" 
            size="2xl" 
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
                        <ModalHeader>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">{t('new_task_modal_title')}</span>
                                {sprintId && <span className="text-xs text-primary">{t('task_added_to_active_sprint')}</span>}
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-4 py-6">
                            <Input label={t('task_title')} value={title} onValueChange={setTitle} isRequired variant="bordered" classNames={{ inputWrapper: "border-divider" }} />
                            <Textarea label={t('task_description')} value={description} onValueChange={setDescription} variant="bordered" classNames={{ inputWrapper: "border-divider" }} />
                            
                            <div className="flex gap-4">
                                <Select 
                                    label={t('filter_type')} 
                                    selectedKeys={new Set([type])} 
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        if (selectedKey) setType(selectedKey);
                                    }}
                                    variant="bordered"
                                    classNames={{ trigger: "border-divider" }}
                                >
                                    {/* AFEGIT textValue A TOTS ELS SELECTITEMS */}
                                    <SelectItem key="TASK" textValue={`📝 ${t('type_task')}`}>📝 {t('type_task')}</SelectItem>
                                    <SelectItem key="FEATURE" textValue={`🚀 ${t('type_feature')}`}>🚀 {t('type_feature')}</SelectItem>
                                    <SelectItem key="BUG" textValue={`🐛 ${t('type_bug')}`}>🐛 {t('type_bug')}</SelectItem>
                                </Select>
                                
                                <Select 
                                    label={t('task_priority')} 
                                    selectedKeys={new Set([priority])} 
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        if (selectedKey) setPriority(selectedKey);
                                    }} 
                                    variant="bordered"
                                    classNames={{ trigger: "border-divider" }}
                                >
                                    {/* AFEGIT textValue A TOTS ELS SELECTITEMS */}
                                    <SelectItem key="LOW" textValue={`🟢 ${t('priority_low')}`}>🟢 {t('priority_low')}</SelectItem>
                                    <SelectItem key="MEDIUM" textValue={`🟡 ${t('priority_medium')}`}>🟡 {t('priority_medium')}</SelectItem>
                                    <SelectItem key="HIGH" textValue={`🟠 ${t('priority_high')}`}>🟠 {t('priority_high')}</SelectItem>
                                    <SelectItem key="URGENT" textValue={`🔴 ${t('priority_urgent')}`}>🔴 {t('priority_urgent')}</SelectItem>
                                </Select>
                            </div>

                            <div className="flex gap-4">
                                <Input type="date" label={t('task_due_date')} value={dueDate} onValueChange={setDueDate} variant="bordered" classNames={{ inputWrapper: "border-divider" }} />
                                <Input label={t('task_assignee')} placeholder="usuari@exemple.com" value={assigneeEmail} onValueChange={setAssigneeEmail} variant="bordered" classNames={{ inputWrapper: "border-divider" }} />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>{t('cancel')}</Button>
                            <Button color="primary" isLoading={loading} onPress={() => handleCreate(onClose)}>{t('create_task_btn')}</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};