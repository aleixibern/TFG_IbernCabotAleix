import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import type { Project } from "../types/Project";
import { ConfirmModal } from "./ConfirmModal";
interface Props {
    project: Project;
    onDelete: (projectId: number) => void;
}

export const ProjectCard = ({ project, onDelete }: Props) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteConfirm = () => {
        onDelete(project.id);
    };

    return (
        <>
            <Card className="max-w-[400px] bg-content1 border border-divider font-sans shadow-sm">
                <CardHeader className="flex gap-3 justify-between">
                    <div className="flex flex-col">
                        <p className="text-md font-bold text-foreground">{project.title}</p>
                        
                        {project.subject && (
                            <div className="text-small text-default-500 flex items-center gap-1 mt-1">
                                <Chip size="sm" variant="flat" color="secondary">📚 {project.subject}</Chip>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <Divider className="bg-divider"/>
                <CardBody>
                    <p className="text-sm text-default-500 line-clamp-3">{project.description}</p>
                </CardBody>
                <Divider className="bg-divider"/>
                
                <CardFooter className="flex gap-2 justify-between">
                    <Button 
                        color="danger" 
                        variant="light" 
                        isIconOnly 
                        onPress={() => setIsConfirmOpen(true)}
                        title={t('delete_project_tooltip')}
                    >
                        🗑️
                    </Button>
                    <Button 
                        color="primary" 
                        variant="flat" 
                        className="flex-1 font-semibold"
                        onPress={() => navigate(`/project/${project.id}`)}
                    >
                        {t('view_details')}
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title={t('confirm_delete_project_title', { defaultValue: 'Esborrar Projecte' })}
                message={`${t('confirm_delete_project')} "${project.title}"?`}
                onConfirm={handleDeleteConfirm}
                cancelText={t('cancel')}
                confirmText={t('delete', { defaultValue: 'Esborrar' })}
                color="danger"
            />
        </>
    );
};