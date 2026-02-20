import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/Project";

interface Props {
    project: Project;
    // Afegim la funció que el Dashboard ens passarà per esborrar
    onDelete: (projectId: number) => void;
}

// Rebem 'onDelete' aquí a les props
export const ProjectCard = ({ project, onDelete }: Props) => {
    const navigate = useNavigate();

    const handleDeleteClick = () => {
        // Confirmació senzilla abans d'esborrar
        if (window.confirm(`Estàs segur que vols esborrar el projecte "${project.title}"? Aquesta acció no es pot desfer.`)) {
            onDelete(project.id);
        }
    };

    return (
        <Card className="max-w-[400px] bg-zinc-900 border border-white/10 font-sans">
            <CardHeader className="flex gap-3 justify-between">
                <div className="flex flex-col">
                    <p className="text-md font-bold text-white">{project.title}</p>
                    {/* Mantenim el <div> per evitar l'error d'hidratació */}
                    <div className="text-small text-default-500 flex items-center gap-1 mt-1">
                        Owner: <Chip size="sm" variant="dot" color="primary">{project.username || "Sense nom"}</Chip>
                    </div>
                </div>
            </CardHeader>
            <Divider className="bg-white/10"/>
            <CardBody>
                {/* 'line-clamp-3' talla el text si és molt llarg i posa '...' */}
                <p className="text-sm text-default-400 line-clamp-3">{project.description}</p>
            </CardBody>
            <Divider className="bg-white/10"/>
            
            {/* FOOTER AMB DOS BOTONS */}
            <CardFooter className="flex gap-2 justify-between">
                <Button 
                    color="danger" 
                    variant="light" 
                    isIconOnly // Fem que sigui només la icona per estalviar espai i que quedi més net
                    onPress={handleDeleteClick}
                    title="Esborrar Projecte"
                >
                    🗑️
                </Button>
                <Button 
                    color="primary" 
                    variant="flat" 
                    className="flex-1" // 'flex-1' fa que aquest botó ocupi tot l'espai sobrant
                    onClick={() => navigate(`/projects/${project.id}`)}
                >
                    Veure Detalls
                </Button>
            </CardFooter>
        </Card>
    );
};