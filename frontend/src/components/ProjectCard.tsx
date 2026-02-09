import { Card, CardHeader, CardBody, CardFooter, Divider, Link } from "@heroui/react";
import type { Project } from "../types/Project";

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
    // Formategem la data perquè es vegi humana (Ex: 09/02/2026)
    const formattedDate = new Date(project.createdAt).toLocaleDateString();

    return (
        <Card className="max-w-[400px] border border-white/10 bg-[#18181b] hover:border-primary/50 transition-colors">
            <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                    <p className="text-md font-bold text-white">{project.title}</p>
                    <p className="text-small text-default-500">Creat el {formattedDate}</p>
                </div>
            </CardHeader>
            <Divider className="bg-white/10" />
            <CardBody>
                <p className="text-gray-400 line-clamp-3">
                    {project.description}
                </p>
            </CardBody>
            <Divider className="bg-white/10" />
            <CardFooter>
                <Link
                    isExternal
                    showAnchorIcon
                    href="#"
                    className="text-primary text-sm"
                >
                    Veure detalls
                </Link>
            </CardFooter>
        </Card>
    );
};