import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from "@heroui/react";
import { useTranslation } from 'react-i18next'; // <-- AFEGIT
import api from '../api/axios';
import { projectService, type Invitation } from '../services/projectService';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { MainLayout } from '../layouts/MainLayout';
import type { Project } from '../types/Project';
import type { User } from '../types/User';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { t } = useTranslation(); // <-- AFEGIT
    
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [userRes, projectsRes, invitesRes] = await Promise.all([
                api.get<User>('/users/me'),
                projectService.getProjects(),
                projectService.getMyInvitations()
            ]);
            setUser(userRes.data);
            setProjects(projectsRes);
            setInvitations(invitesRes);
        } catch (error) {
            console.error(error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAccept = async (id: number) => {
        await projectService.acceptInvitation(id);
        fetchData();
    };

    const handleDecline = async (id: number) => {
        await projectService.declineInvitation(id);
        setInvitations(invitations.filter(i => i.id !== id));
    };

    const handleDeleteProject = async (projectId: number) => {
        try {
            await projectService.deleteProject(projectId);
            setProjects(projects.filter(p => p.id !== projectId));
        } catch (error) {
            console.error("Error esborrant projecte", error);
            alert(t('error_delete_project')); // <-- TRADUÏT
        }
    };

    // CANVI DE COLOR: Eliminat bg-black per bg-background
    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Spinner /></div>;

    return (
        <MainLayout username={user?.username} email={user?.email}>
            <div className="max-w-5xl mx-auto p-4">
                
                {/* LLISTA D'INVITACIONS */}
                {invitations.length > 0 && (
                    <div className="mb-10 p-4 border-2 border-primary/50 bg-primary/5 rounded-xl">
                        {/* TRADUÏT I COLOR FONS CANVIAT */}
                        <h2 className="text-foreground font-bold mb-4">📩 {t('pending_invitations')}</h2>
                        <div className="flex flex-col gap-2">
                            {invitations.map(inv => (
                                // CANVI COLOR: bg-content1 i border-divider
                                <div key={inv.id} className="bg-content1 p-3 rounded-lg flex justify-between items-center border border-divider shadow-sm">
                                    <span className="text-foreground"><b>{inv.ownerName}</b> {t('invites_you_to')} <b>{inv.projectTitle}</b></span>
                                    <div className="flex gap-2">
                                        <Button size="sm" color="success" onPress={() => handleAccept(inv.id)}>{t('accept')}</Button>
                                        <Button size="sm" color="danger" variant="flat" onPress={() => handleDecline(inv.id)}>{t('decline')}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    {/* CANVI COLOR I TRADUCCIÓ */}
                    <h1 className="text-3xl font-bold text-foreground">{t('my_projects')}</h1>
                    <Button color="primary" onPress={() => setIsModalOpen(true)}>{t('new_project_button')}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard 
                            key={project.id} 
                            project={project} 
                            onDelete={handleDeleteProject}
                        />
                    ))}
                </div>

                <CreateProjectModal 
                    isOpen={isModalOpen} 
                    onOpenChange={() => setIsModalOpen(!isModalOpen)} 
                    onProjectCreated={fetchData} 
                />
            </div>
        </MainLayout>
    );
}