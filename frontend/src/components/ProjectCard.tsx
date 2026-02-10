import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button } from "@heroui/react";
import type { Project } from "../types/Project";
import api from "../api/axios";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: number) => void; // <--- Callback per avisar al pare quan s'esborri
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {

  const handleDelete = async () => {
    // 1. Confirmació de seguretat (molt important)
    if (!window.confirm(`Estàs segur que vols esborrar el projecte "${project.title}"?`)) {
      return;
    }

    try {
      // 2. Cridem al Backend per esborrar
      await api.delete(`/projects/${project.id}`);
      
      // 3. Si tot va bé, avisem al Dashboard
      onDelete(project.id);
    } catch (error) {
      console.error("Error esborrant projecte:", error);
      alert("No s'ha pogut esborrar. Potser no ets el propietari?");
    }
  };

  return (
    <Card className="max-w-[400px] bg-zinc-900 border border-white/10">
      <CardHeader className="flex gap-3">
        <Image
          alt="Project Icon"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md font-bold text-white">{project.title}</p>
          <p className="text-small text-default-500">
            Owner: {project.owner?.username || "Desconegut"}
          </p>
        </div>
      </CardHeader>
      
      <Divider className="bg-white/10"/>
      
      <CardBody>
        <p className="text-gray-300 line-clamp-3">
          {project.description || "Sense descripció disponible."}
        </p>
      </CardBody>
      
      <Divider className="bg-white/10"/>
      
      <CardFooter className="flex justify-between items-center">
        <Link
          isExternal
          showAnchorIcon
          href="#"
          className="text-primary"
        >
          Veure Detalls
        </Link>
        
        {/* BOTÓ PAPERERA */}
        <Button 
            isIconOnly 
            color="danger" 
            variant="light" 
            aria-label="Esborrar projecte"
            onPress={handleDelete}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};