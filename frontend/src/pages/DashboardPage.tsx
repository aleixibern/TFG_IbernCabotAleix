import { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, CardHeader, Divider, Button, useDisclosure } from "@heroui/react";
import api from '../api/axios';
import type { User } from '../types/User';
import type { Project } from '../types/Project';
import { MainLayout } from '../layouts/MainLayout';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';

export default function DashboardPage() {
    
    // Control del Modal
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Carreguem usuari i projectes en paral·lel
                const [userRes, projectsRes] = await Promise.all([
                    api.get<User>('/users/me'),
                    api.get<Project[]>('/projects')
                ]);
                
                setUser(userRes.data);
                setProjects(projectsRes.data);
            } catch (error) {
                console.error("Error carregant dades", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Quan es crea un projecte nou, l'afegim a la llista
    const handleProjectCreated = (newProject: Project) => {
        setProjects([newProject, ...projects]);
    };

    // Quan s'esborra un projecte, el traiem de la llista (NOVA FUNCIÓ)
    const handleProjectDeleted = (deletedId: number) => {
        setProjects(projects.filter(p => p.id !== deletedId));
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <MainLayout username={user?.username} email={user?.email}>
            
            {/* Modal de Creació */}
            <CreateProjectModal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                onProjectCreated={handleProjectCreated}
            />

            <div className="flex flex-col gap-6 pb-10">
                {/* Capçalera */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Panell de Control</h1>
                        <p className="text-default-500">Benvingut de nou, {user?.username}.</p>
                    </div>
                    
                    <Button 
                        color="primary" 
                        variant="shadow" 
                        onPress={onOpen}
                        className="font-semibold"
                    >
                        + Nou Projecte
                    </Button>
                </div>

                {/* Resum Usuari */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-white/10 shadow-md bg-zinc-900">
                        <CardHeader className="pb-2">
                            <p className="text-md font-bold text-white">El meu Perfil</p>
                        </CardHeader>
                        <Divider className="bg-white/10"/>
                        <CardBody>
                            <p className="text-gray-300">Email: <span className="font-mono text-small text-primary">{user?.email}</span></p>
                            <p className="text-gray-300">Projectes totals: <span className="font-bold">{projects.length}</span></p>
                        </CardBody>
                    </Card>
                </div>

                {/* Llista de Projectes */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Els meus Projectes recents</h2>
                    
                    {projects.length === 0 ? (
                        <Card className="border border-white/10 bg-white/5 border-dashed">
                            <CardBody className="flex items-center justify-center py-12">
                                <p className="text-default-500">Encara no has creat cap projecte.</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <ProjectCard 
                                    key={proj.id} 
                                    project={proj} 
                                    onDelete={handleProjectDeleted} // <--- Passem la funció aquí
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </MainLayout>
    );
}