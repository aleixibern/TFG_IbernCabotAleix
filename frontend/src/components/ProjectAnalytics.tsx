import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import type { Task } from '../types/Task';

interface Props {
    tasks: Task[];
}

export const ProjectAnalytics = ({ tasks }: Props) => {
    const { t } = useTranslation();
    const { theme } = useTheme(); 

    const mainTasks = tasks.filter(t => !t.parentTaskId);

    const statusData = useMemo(() => {
        const counts = { BACKLOG: 0, READY: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        
        mainTasks.forEach(t => { 
            if (counts[t.status as keyof typeof counts] !== undefined) {
                counts[t.status as keyof typeof counts]++; 
            }
        });
        
        const backlogColor = theme === 'dark' ? '#3f3f46' : '#a1a1aa';

        return [
            { name: t('column_backlog').replace(' 💡', ''), value: counts.BACKLOG, color: backlogColor }, 
            { name: t('column_ready').replace(' 🔥', ''), value: counts.READY, color: '#9353d3' }, 
            { name: t('column_in_progress').replace(' 🚀', ''), value: counts.IN_PROGRESS, color: '#006fee' }, 
            { name: t('column_in_review').replace(' 👀', ''), value: counts.IN_REVIEW, color: '#f5a524' },
            { name: t('column_done').replace(' ✅', ''), value: counts.DONE, color: '#17c964' } 
        ].filter(d => d.value > 0); 
    }, [mainTasks, theme, t]);

    const assigneeData = useMemo(() => {
        const counts: Record<string, number> = {};
        
        mainTasks.forEach(task => {
            const name = task.assigneeName || task.assigneeEmail || t('unassigned');
            counts[name] = (counts[name] || 0) + 1;
        });
        
        return Object.keys(counts).map(key => ({
            nom: key,
            Tasques: counts[key]
        })).sort((a, b) => b.Tasques - a.Tasques); 
    }, [mainTasks, t]);

    if (mainTasks.length === 0) {
        return (
            <div className="text-center p-8 text-default-500">
                {t('no_data_stats')}
            </div>
        );
    }

    // Configuració dinàmica dels colors del Tooltip (Caixa d'informació de la gràfica)
    const tooltipBg = theme === 'dark' ? '#18181b' : '#ffffff';
    const tooltipBorder = theme === 'dark' ? '#3f3f46' : '#e4e4e7';
    const tooltipText = theme === 'dark' ? 'white' : 'black';
    const cursorFill = theme === 'dark' ? '#27272a' : '#f4f4f5';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            
            <Card className="bg-content1 border border-divider shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <h4 className="font-bold text-lg text-foreground">{t('global_status')}</h4>
                    <small className="text-default-500">{t('status_distribution', { count: mainTasks.length })}</small>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                    itemStyle={{ color: tooltipText }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: tooltipText }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-content1 border border-divider shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <h4 className="font-bold text-lg text-foreground">{t('workload_per_member')}</h4>
                    <small className="text-default-500">{t('tasks_assigned_to_user')}</small>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assigneeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="nom" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: cursorFill }}
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                />
                                <Bar dataKey="Tasques" fill="#006fee" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

        </div>
    );
};