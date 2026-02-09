import { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, CardHeader, Divider, Button, useDisclosure } from "@heroui/react";
import api from '../api/axios';
import type { User } from '../types/User';
import type { Project } from '../types/Project';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';

export default function DashboardPage() {
    const navigate = useNavigate();
    
    
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get<User>('/users/me');
                setUser(userRes.data);

                const projectsRes = await api.get<Project[]>('/projects');
                setProjects(projectsRes.data);
            } catch (error) {
                console.error("Error carregant dades", error);
                
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

   
    const handleProjectCreated = (newProject: Project) => {
        setProjects([newProject, ...projects]);
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
            
            
            <CreateProjectModal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                onProjectCreated={handleProjectCreated}
            />

            <div className="flex flex-col gap-6 pb-10">
               
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

                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-white/10 shadow-md bg-zinc-900">
                        <CardHeader className="flex gap-3 pb-2">
                            <div className="flex flex-col">
                                <p className="text-md font-bold text-white">El meu Perfil</p>
                            </div>
                        </CardHeader>
                        <Divider className="bg-white/10"/>
                        <CardBody>
                            <p className="text-gray-300">Email: <span className="font-mono text-small text-primary">{user?.email}</span></p>
                            <p className="text-gray-300">Projectes totals: <span className="font-bold">{projects.length}</span></p>
                        </CardBody>
                    </Card>
                </div>

               
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
                                <ProjectCard key={proj.id} project={proj} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </MainLayout>
    );
}