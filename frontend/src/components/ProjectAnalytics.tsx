import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardBody, CardHeader } from "@heroui/react";
import type { Task } from '../types/Task';

interface Props {
    tasks: Task[];
}

export const ProjectAnalytics = ({ tasks }: Props) => {
    const mainTasks = tasks.filter(t => !t.parentTaskId);

    const statusData = useMemo(() => {
        const counts = { BACKLOG: 0, READY: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
        
        mainTasks.forEach(t => { 
            if (counts[t.status as keyof typeof counts] !== undefined) {
                counts[t.status as keyof typeof counts]++; 
            }
        });
        
        return [
            { name: 'Backlog', value: counts.BACKLOG, color: '#3f3f46' }, 
            { name: 'Ready', value: counts.READY, color: '#9353d3' }, 
            { name: 'In Progress', value: counts.IN_PROGRESS, color: '#006fee' }, 
            { name: 'In Review', value: counts.IN_REVIEW, color: '#f5a524' },
            { name: 'Done', value: counts.DONE, color: '#17c964' } 
        ].filter(d => d.value > 0); 
    }, [mainTasks]);

    const assigneeData = useMemo(() => {
        const counts: Record<string, number> = {};
        
        mainTasks.forEach(t => {
            const name = t.assigneeName || t.assigneeEmail || 'Sense assignar';
            counts[name] = (counts[name] || 0) + 1;
        });
        
        return Object.keys(counts).map(key => ({
            nom: key,
            Tasques: counts[key]
        })).sort((a, b) => b.Tasques - a.Tasques); 
    }, [mainTasks]);

    if (mainTasks.length === 0) {
        return (
            <div className="text-center p-8 text-default-500">
                No hi ha prou dades per generar estadístiques. Crea algunes tasques primer!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            
            <Card className="bg-zinc-900 border border-white/10">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <h4 className="font-bold text-lg text-white">Estat Global del Projecte</h4>
                    <small className="text-default-500">Distribució de les {mainTasks.length} tasques per columna</small>
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
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-zinc-900 border border-white/10">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <h4 className="font-bold text-lg text-white">Càrrega de Treball per Membre</h4>
                    <small className="text-default-500">Tasques assignades a cada usuari</small>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assigneeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="nom" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#27272a' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: 'white' }}
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