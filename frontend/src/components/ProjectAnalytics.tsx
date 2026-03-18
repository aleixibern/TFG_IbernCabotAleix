import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import type { Task } from '../types/Task';
import type { Sprint } from '../types/Sprint';

interface Props {
    tasks: Task[];
    sprints?: Sprint[];
}

export const ProjectAnalytics = ({ tasks, sprints = [] }: Props) => {
    const { t } = useTranslation();
    const { theme } = useTheme(); 

    const mainTasks = tasks.filter(t => !t.parentTaskId);

    // 1. DADES FORMATGET
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

    // 2. DADES BARRES
    const assigneeData = useMemo(() => {
        const counts: Record<string, number> = {};
        
        mainTasks.forEach(task => {
            const name = task.assigneeName || task.assigneeEmail || t('unassigned', { defaultValue: 'Sense assignar' });
            counts[name] = (counts[name] || 0) + 1;
        });
        
        // Fem servir una clau fixa "tasques" perquè TypeScript pugui fer matemàtiques
        return Object.keys(counts).map(key => ({
            nom: key,
            tasques: counts[key]
        })).sort((a, b) => b.tasques - a.tasques); 
    }, [mainTasks, t]);

    // 3. DADES REPORT SPRINTS
    const sprintReportData = useMemo(() => {
        if (!sprints || sprints.length === 0) return [];

        const sortedSprints = [...sprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return sortedSprints.map(sprint => {
            const sprintTasks = mainTasks.filter(task => task.sprintId === sprint.id);
            
            let pendents = 0; 
            let enCurs = 0;   
            let acabades = 0; 

            sprintTasks.forEach(task => {
                if (task.status === 'BACKLOG' || task.status === 'READY') pendents++;
                else if (task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW') enCurs++;
                else if (task.status === 'DONE') acabades++;
            });

            // Fem servir claus fixes internes per evitar errors TS
            return {
                name: sprint.name,
                pendents: pendents,
                enCurs: enCurs,
                acabades: acabades,
                total: sprintTasks.length
            };
        }); 
    }, [mainTasks, sprints]);

    // 4. DADES FLUX DE TREBALL
    const workflowData = useMemo(() => {
        const counts = { BACKLOG: 0, READY: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        
        mainTasks.forEach(t => { 
            if (counts[t.status as keyof typeof counts] !== undefined) {
                counts[t.status as keyof typeof counts]++; 
            }
        });

        return [
            { name: 'Backlog', tasques: counts.BACKLOG },
            { name: 'Ready', tasques: counts.READY },
            { name: 'In Progress', tasques: counts.IN_PROGRESS },
            { name: 'In Review', tasques: counts.IN_REVIEW },
            { name: 'Done', tasques: counts.DONE }
        ];
    }, [mainTasks]);

    if (mainTasks.length === 0) {
        return (
            <div className="text-center p-8 text-default-500">
                {t('no_data_stats')}
            </div>
        );
    }

    const tooltipBg = theme === 'dark' ? '#18181b' : '#ffffff';
    const tooltipBorder = theme === 'dark' ? '#3f3f46' : '#e4e4e7';
    const tooltipText = theme === 'dark' ? 'white' : 'black';
    const cursorFill = theme === 'dark' ? '#27272a' : '#f4f4f5';

    return (
        <div className="flex flex-col gap-6 p-2">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-content1 border border-divider shadow-sm">
                    <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                        <h4 className="font-bold text-lg text-foreground">{t('global_status')}</h4>
                        <small className="text-default-500">{t('status_distribution', { count: mainTasks.length })}</small>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
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
                                    <Tooltip cursor={{ fill: cursorFill }} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} />
                                    {/* Passem el t() per la propietat name perquè Recharts ho tradueixi */}
                                    <Bar dataKey="tasques" name={t('type_task')} fill="#006fee" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-content1 border border-divider shadow-sm w-full">
                    <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                        <h4 className="font-bold text-lg text-foreground">{t('sprint_performance_title')}</h4>
                        <small className="text-default-500">{t('sprint_performance_desc')}</small>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        {sprints && sprints.length > 0 ? (
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sprintReportData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: cursorFill }} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                                        <Bar dataKey="pendents" name={t('pending_tasks')} stackId="a" fill={theme === 'dark' ? '#3f3f46' : '#a1a1aa'} radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="enCurs" name={t('in_progress_tasks')} stackId="a" fill="#006fee" />
                                        <Bar dataKey="acabades" name={t('completed_tasks')} stackId="a" fill="#17c964" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[150px] w-full flex items-center justify-center">
                                <p className="text-default-500 italic text-sm">{t('no_sprints_message')}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="bg-content1 border border-divider shadow-sm w-full">
                    <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                        <h4 className="font-bold text-lg text-foreground">{t('workflow_pipeline_title')}</h4>
                        <small className="text-default-500">{t('workflow_pipeline_desc')}</small>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={workflowData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorTasques" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9353d3" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#9353d3" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} />
                                    <Area type="monotone" dataKey="tasques" name={t('type_task')} stroke="#9353d3" strokeWidth={3} fillOpacity={1} fill="url(#colorTasques)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};