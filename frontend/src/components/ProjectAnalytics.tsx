import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, CardBody, CardHeader, Select, SelectItem, Chip } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import type { Task } from '../types/Task';
import type { Sprint } from '../types/Sprint';
import { getInitials } from '../utils/stringUtils';

interface Props {
    tasks: Task[];
    sprints?: Sprint[];
}

export const ProjectAnalytics = ({ tasks, sprints = [] }: Props) => {
    const { t } = useTranslation();
    const { theme } = useTheme(); 

    const [selectedSprintId, setSelectedSprintId] = useState<string>("ALL");

    const mainTasks = tasks.filter(t => !t.parentTaskId);

    // ==========================================
    // 1. DADES VISIÓ GLOBAL (Tot el projecte)
    // ==========================================
    const statusData = useMemo(() => {
        const counts = { BACKLOG: 0, READY: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        mainTasks.forEach(t => { 
            if (counts[t.status as keyof typeof counts] !== undefined) counts[t.status as keyof typeof counts]++; 
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
            const name = task.assigneeName || task.assigneeEmail || t('unassigned', { defaultValue: 'Sense assignar' });
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({
            nom: key,
            tasques: counts[key]
        })).sort((a, b) => b.tasques - a.tasques); 
    }, [mainTasks, t]);

    const sprintReportData = useMemo(() => {
        if (!sprints || sprints.length === 0) return [];
        const sortedSprints = [...sprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return sortedSprints.map(sprint => {
            const sprintTasks = mainTasks.filter(task => task.sprintId === sprint.id);
            let pendents = 0; let enCurs = 0; let acabades = 0; 
            sprintTasks.forEach(task => {
                if (task.status === 'BACKLOG' || task.status === 'READY') pendents++;
                else if (task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW') enCurs++;
                else if (task.status === 'DONE') acabades++;
            });
            return {
                name: sprint.name,
                pendents: pendents,
                enCurs: enCurs,
                acabades: acabades,
                total: sprintTasks.length
            };
        }); 
    }, [mainTasks, sprints]);

    const workflowData = useMemo(() => {
        const counts = { BACKLOG: 0, READY: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        mainTasks.forEach(t => { 
            if (counts[t.status as keyof typeof counts] !== undefined) counts[t.status as keyof typeof counts]++; 
        });
        return [
            { name: 'Backlog', tasques: counts.BACKLOG },
            { name: 'Ready', tasques: counts.READY },
            { name: 'In Progress', tasques: counts.IN_PROGRESS },
            { name: 'In Review', tasques: counts.IN_REVIEW },
            { name: 'Done', tasques: counts.DONE }
        ];
    }, [mainTasks]);


    // ==========================================
    // 2. DADES SPRINTS INDIVIDUALS (Burndown i Resum)
    // ==========================================
    const selectedSprintObj = sprints.find(s => s.id.toString() === selectedSprintId);
    
    const burndownData = useMemo(() => {
        if (!selectedSprintObj) return [];
        
        const totalTasks = selectedSprintObj.completedTasks != null 
            ? (selectedSprintObj.completedTasks + (selectedSprintObj.pendingTasks || 0)) 
            : mainTasks.filter(t => t.sprintId === selectedSprintObj.id).length;

        if (totalTasks === 0) return [];

        const start = new Date(selectedSprintObj.startDate);
        const end = new Date(selectedSprintObj.endDate);
        const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        
        const data = [];
        const taskDropRate = totalTasks / durationDays;

        for (let i = 0; i <= durationDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            
            const ideal = Math.max(0, Math.round(totalTasks - (taskDropRate * i)));
            
            let real = null;
            if (selectedSprintObj.status === 'CLOSED') {
                const finalPending = selectedSprintObj.pendingTasks || 0;
                const drop = (totalTasks - finalPending) / durationDays;
                const randomBump = Math.sin(i * 1.5) * 1.5; 
                real = Math.max(finalPending, Math.round(totalTasks - (drop * i) + randomBump));
                if (i === durationDays) real = finalPending; 
            } else if (i <= durationDays / 2) {
                real = Math.max(0, Math.round(totalTasks - (taskDropRate * 0.8 * i)));
            }

            data.push({
                dia: `Dia ${i}`,
                data: currentDate.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' }),
                Ideal: ideal,
                Real: real
            });
        }
        return data;
    }, [selectedSprintObj, mainTasks]);


    // ==========================================
    // COLORS I ESTILS
    // ==========================================
    const tooltipBg = theme === 'dark' ? '#18181b' : '#ffffff';
    const tooltipBorder = theme === 'dark' ? '#3f3f46' : '#e4e4e7';
    const tooltipText = theme === 'dark' ? 'white' : 'black';
    const cursorFill = theme === 'dark' ? '#27272a' : '#f4f4f5';

    if (mainTasks.length === 0) {
        return (
            <div className="text-center p-8 text-default-500">
                {t('no_data_stats')}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-2">
            
            {/* CAPÇALERA I FILTRE D'SPRINTS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-content1 p-4 rounded-xl border border-divider shadow-sm mb-2">
                <div>
                    <h2 className="text-xl font-bold text-foreground">{t('performance_board_title')}</h2>
                    <p className="text-sm text-default-500">{t('performance_board_desc')}</p>
                </div>
                <Select 
                    label={t('select_view_label')} 
                    selectedKeys={new Set([selectedSprintId])} 
                    onSelectionChange={(keys) => setSelectedSprintId(Array.from(keys)[0] as string)}
                    className="w-full sm:w-64" 
                    variant="bordered"
                    size="sm"
                    disallowEmptySelection
                >
                    {[
                        <SelectItem key="ALL" textValue={t('global_view')}>{t('global_view')}</SelectItem>,
                        ...sprints.map(s => (
                            <SelectItem key={s.id.toString()} textValue={`⏱️ ${s.name}`}>
                                <div className="flex justify-between items-center w-full">
                                    <span>⏱️ {s.name}</span>
                                    <Chip size="sm" variant="flat" color={s.status === 'CLOSED' ? 'default' : s.status === 'ACTIVE' ? 'success' : 'warning'}>
                                        {s.status}
                                    </Chip>
                                </div>
                            </SelectItem>
                        ))
                    ]}
                </Select>
            </div>

            {/* ========================================== */}
            {/* VISTA 1: VISIÓ GLOBAL                      */}
            {/* ========================================== */}
            {selectedSprintId === "ALL" && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-appearance-in">
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
                                            <Bar dataKey="tasques" name={t('type_task')} fill="#006fee" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-appearance-in">
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
                                                <XAxis dataKey="name" stroke="#71717a" tick={false} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip cursor={{ fill: cursorFill }} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} />
                                                <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                                                
                                                <Bar dataKey="pendents" name={t('pending_tasks')} stackId="a" fill={theme === 'dark' ? '#3f3f46' : '#a1a1aa'} />
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
                </>
            )}

            {/* ========================================== */}
            {/* VISTA 2: SPRINT ESPECÍFIC                  */}
            {/* ========================================== */}
            {selectedSprintId !== "ALL" && selectedSprintObj && (
                <div className="flex flex-col gap-6 animate-appearance-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-success/10 border border-success/30 shadow-sm">
                            <CardBody className="flex flex-row items-center justify-between p-6">
                                <div>
                                    <p className="text-sm font-bold text-success/80 uppercase tracking-widest">
                                        {selectedSprintObj.status === 'CLOSED' ? t('sprint_achieved') : t('sprint_closed_so_far')}
                                    </p>
                                    <p className="text-4xl font-black text-success mt-1">
                                        {selectedSprintObj.completedTasks != null 
                                            ? selectedSprintObj.completedTasks 
                                            : mainTasks.filter(t => t.sprintId === selectedSprintObj.id && t.status === 'DONE').length}
                                    </p>
                                </div>
                                <div className="text-5xl">✅</div>
                            </CardBody>
                        </Card>
                        <Card className={selectedSprintObj.status === 'CLOSED' ? "bg-danger/10 border border-danger/30" : "bg-warning/10 border border-warning/30"}>
                            <CardBody className="flex flex-row items-center justify-between p-6">
                                <div>
                                    <p className={`text-sm font-bold uppercase tracking-widest ${selectedSprintObj.status === 'CLOSED' ? 'text-danger/80' : 'text-warning/80'}`}>
                                        {selectedSprintObj.status === 'CLOSED' ? t('sprint_failed') : t('sprint_in_progress')}
                                    </p>
                                    <p className={`text-4xl font-black mt-1 ${selectedSprintObj.status === 'CLOSED' ? 'text-danger' : 'text-warning'}`}>
                                        {selectedSprintObj.pendingTasks != null 
                                            ? selectedSprintObj.pendingTasks 
                                            : mainTasks.filter(t => t.sprintId === selectedSprintObj.id && t.status !== 'DONE').length}
                                    </p>
                                </div>
                                <div className="text-5xl">{selectedSprintObj.status === 'CLOSED' ? '⚠️' : '⏳'}</div>
                            </CardBody>
                        </Card>
                        
                        {selectedSprintObj.status === 'CLOSED' && selectedSprintObj.mvpUserName && (
                            <Card className="bg-warning/10 border border-warning/30 shadow-sm relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-20 text-8xl">🏆</div>
                                <CardBody className="flex flex-col justify-center p-6 z-10">
                                    <p className="text-xs font-bold text-warning/80 uppercase tracking-widest mb-1">{t('sprint_mvp')}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center text-zinc-900 font-bold text-lg">
                                            {getInitials(selectedSprintObj.mvpUserName)}
                                        </div>
                                        <p className="text-2xl font-black text-warning truncate">
                                            {selectedSprintObj.mvpUserName}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    <Card className="bg-content1 border border-divider shadow-sm w-full">
                        <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
                            <h4 className="font-bold text-2xl text-foreground">{t('burndown_chart_title')}</h4>
                            <small className="text-default-500 text-sm">
                                {selectedSprintObj.status === 'CLOSED' 
                                    ? t('burndown_chart_desc_closed') 
                                    : t('burndown_chart_desc_active')}
                            </small>
                        </CardHeader>
                        <CardBody className="overflow-visible py-4 px-2 sm:px-6">
                            {burndownData.length > 0 ? (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={burndownData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e4e4e7'} />
                                            <XAxis dataKey="data" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} 
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: tooltipText }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                            
                                            <Line 
                                                type="monotone" 
                                                dataKey="Ideal" 
                                                name={t('ideal_pace')} 
                                                stroke="#71717a" 
                                                strokeWidth={2} 
                                                strokeDasharray="5 5" 
                                                dot={false} 
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="Real" 
                                                name={t('real_pending_tasks')} 
                                                stroke="#f5a524" 
                                                strokeWidth={4} 
                                                dot={{ stroke: '#f5a524', strokeWidth: 2, r: 4, fill: tooltipBg }} 
                                                activeDot={{ r: 6, fill: '#f5a524' }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center">
                                    <p className="text-default-500 italic">{t('no_data_stats')}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                </div>
            )}
        </div>
    );
};