import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Spinner, Chip } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import type { ActivityLog } from '../types/ActivityLog';
import { getInitials } from '../utils/stringUtils';

interface Props {
    projectId: string;
}

const getStatusColor = (status?: string) => {
    switch(status) {
        case 'DONE': return 'success';
        case 'IN_PROGRESS': return 'primary';
        case 'IN_REVIEW': return 'warning';
        case 'READY': return 'secondary';
        default: return 'default';
    }
};

const getUserColorClasses = (identifier: string) => {
    if (!identifier) return "bg-default/20 border-default text-default";
    const colors = [
        "bg-primary/20 border-primary text-primary",       
        "bg-secondary/20 border-secondary text-secondary", 
        "bg-success/20 border-success text-success",       
        "bg-warning/20 border-warning text-warning",       
        "bg-danger/20 border-danger text-danger",          
    ];
    let sum = 0;
    for (let i = 0; i < identifier.length; i++) { sum += identifier.charCodeAt(i) * (i + 1); }
    return colors[sum % colors.length];
};

export const ProjectActivity = ({ projectId }: Props) => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Traductor de temps al vol usant i18n
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return t('time_ago_seconds');
        if (minutes < 60) return t('time_ago_minutes', { count: minutes });
        if (hours < 24) return t('time_ago_hours', { count: hours });
        if (days === 1) return t('time_ago_yesterday');
        return t('time_ago_days', { count: days });
    };

    // Formatejador de noms traduït
    const formatDisplayName = (nameOrEmail?: string) => {
        if (!nameOrEmail) return t('unknown_user');
        if (nameOrEmail.includes('@')) {
            const namePart = nameOrEmail.split('@')[0]; 
            return namePart.charAt(0).toUpperCase() + namePart.slice(1); 
        }
        return nameOrEmail;
    };

    // Traductor dels missatges del backend "al vol"
    const translateBackendAction = (actionDesc: string) => {
        let translated = actionDesc;
        translated = translated.replace("ha creat la tasca", t('action_created_task'));
        translated = translated.replace("ha actualitzat el camp 'Estat' en", t('action_updated_status'));
        translated = translated.replace("ha eliminat la tasca", t('action_deleted_task'));
        translated = translated.replace("ha editat detalls de", t('action_edited_task'));
        return translated;
    };

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/activity`);
                setLogs(res.data);
            } catch (error) {
                console.error("Error carregant l'activitat", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchActivity();
    }, [projectId]);

    if (loading) return <div className="flex justify-center p-8"><Spinner color="primary" /></div>;

    return (
        <Card className="bg-content1 border border-divider shadow-sm w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                <h3 className="text-xl font-bold text-foreground">{t('recent_activity_title')}</h3>
                <p className="text-sm text-default-500">{t('recent_activity_desc')}</p>
            </CardHeader>
            <CardBody className="px-6 py-4">
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-default-500 italic">
                        {t('no_recent_activity')}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {logs.map((log) => {
                            const userIdentifier = log.userEmail || log.userName || "Unknown";
                            const avatarColors = getUserColorClasses(userIdentifier);
                            const cleanName = formatDisplayName(log.userName || log.userEmail);

                            return (
                                <div key={log.id} className="flex gap-4 items-start">
                                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 mt-1 ${avatarColors}`}>
                                        {getInitials(userIdentifier)}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="text-sm text-foreground leading-relaxed">
                                            <span className="font-semibold text-primary">{cleanName}</span>{' '}
                                            {translateBackendAction(log.actionDescription)}{' '}
                                            
                                            {log.taskTitle && (
                                                <div className="inline-flex items-center gap-2 bg-content2 border border-divider px-2 py-0.5 mx-1 rounded-md">
                                                    <span className="text-primary font-medium">{log.taskTitle}</span>
                                                    {log.taskStatus && (
                                                        <Chip size="sm" variant="flat" color={getStatusColor(log.taskStatus) as any} className="h-5 text-[10px]">
                                                            {log.taskStatus}
                                                        </Chip>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {log.newValue && (
                                                <span> {t('to_status')} <Chip size="sm" variant="dot" color="primary">{log.newValue}</Chip></span>
                                            )}
                                        </div>
                                        <span className="text-xs text-default-400">{timeAgo(log.timestamp)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};