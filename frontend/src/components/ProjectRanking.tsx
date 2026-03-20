import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Spinner, Progress, Avatar } from "@heroui/react";
import api from '../api/axios';
import { getInitials } from '../utils/stringUtils';
import type { MemberRanking } from '../types/Ranking';
import { useTranslation } from 'react-i18next';

interface Props {
    projectId: string;
}

export const ProjectRanking = ({ projectId }: Props) => {
    const { t } = useTranslation();
    const [ranking, setRanking] = useState<MemberRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/ranking`);
                setRanking(res.data);
            } catch (error) {
                console.error("Error carregant el rànquing", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchRanking();
    }, [projectId]);

    if (loading) return <div className="flex justify-center p-4"><Spinner size="sm" color="warning" /></div>;

    const getMedal = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return <span className="text-default-400 font-bold text-sm w-5 text-center">{index + 1}</span>;
    };

    return (
        <Card className="bg-content1 border border-divider shadow-sm w-full h-full">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                    🏆 Rànquing del Projecte
                </h4>
                <small className="text-default-500">Qui està aportant més a l'equip?</small>
            </CardHeader>
            <CardBody className="overflow-visible py-4 px-4">
                <div className="flex flex-col gap-4">
                    {ranking.map((member, index) => (
                        <div key={member.email} className="flex items-center gap-3 p-3 rounded-xl bg-content2 border border-divider hover:border-warning/50 transition-colors">
                            {/* Posició i Medalla */}
                            <div className="w-6 flex justify-center text-xl">
                                {getMedal(index)}
                            </div>

                            <Avatar
                                isBordered
                                color={index === 0 ? "warning" : index === 1 ? "default" : index === 2 ? "danger" : "primary"}
                                size="sm"
                                showFallback
                                fallback={<span className="font-bold text-foreground">{getInitials(member.username || member.email)}</span>}
                            />

                            <div className="flex-grow flex flex-col gap-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-foreground truncate">{member.username}</span>
                                    <span className="text-xs font-black text-warning">Lvl {member.level}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Progress
                                        size="sm"
                                        color="warning"
                                        value={member.xp}
                                        classNames={{
                                            indicator: "bg-gradient-to-r from-warning to-danger",
                                            track: "bg-default-200"
                                        }}
                                    />
                                    <span className="text-[10px] text-default-400 w-8 text-right font-mono">{member.xp}XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};