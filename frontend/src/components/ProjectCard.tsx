import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/Project";

interface Props {
    project: Project;
    onDelete: (projectId: number) => void;
}

export const ProjectCard = ({ project, onDelete }: Props) => {
    const navigate = useNavigate();

    const handleDeleteClick = () => {
        if (window.confirm(`Estàs segur que vols esborrar el projecte "${project.title}"? Aquesta acció no es pot desfer.`)) {
            onDelete(project.id);
        }
    };

    return (
        <Card className="max-w-[400px] bg-zinc-900 border border-white/10 font-sans">
            <CardHeader className="flex gap-3 justify-between">
                <div className="flex flex-col">
                    <p className="text-md font-bold text-white">{project.title}</p>
                    
                    {project.subject && (
                        <div className="text-small text-default-500 flex items-center gap-1 mt-1">
                            <Chip size="sm" variant="flat" color="secondary">📚 {project.subject}</Chip>
                        </div>
                    )}
                </div>
            </CardHeader>
            <Divider className="bg-white/10"/>
            <CardBody>
                <p className="text-sm text-default-400 line-clamp-3">{project.description}</p>
            </CardBody>
            <Divider className="bg-white/10"/>
            
            <CardFooter className="flex gap-2 justify-between">
                <Button 
                    color="danger" 
                    variant="light" 
                    isIconOnly 
                    onPress={handleDeleteClick}
                    title="Esborrar Projecte"
                >
                    🗑️
                </Button>
                <Button 
                    color="primary" 
                    variant="flat" 
                    className="flex-1"
                    onPress={() => navigate(`/project/${project.id}`)}
                >
                    Veure Detalls
                </Button>
            </CardFooter>
        </Card>
    );
};