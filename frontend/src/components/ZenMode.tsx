import { useState, useEffect } from 'react';
import { Button } from "@heroui/react";
import type { Task } from '../types/Task';

interface Props {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ZenMode = ({ task, isOpen, onClose }: Props) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); 
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (!isOpen) {
            setIsActive(false);
            setTimeLeft(25 * 60);
        }
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    
    const totalTime = 25 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="fixed inset-0 z-[99999] bg-zinc-950 flex flex-col items-center justify-center text-white p-6 animate-appearance-in">
            <Button 
                variant="flat" 
                color="danger" 
                className="absolute top-6 right-6 font-bold tracking-widest"
                onPress={onClose}
            >
                ✕ SORTIR DEL FOCUS
            </Button>

            <div className="text-center max-w-2xl mb-12">
                <span className="text-warning font-bold tracking-widest text-sm uppercase mb-4 block">
                    Mode Focus Activat
                </span>
                <h1 className="text-4xl font-black mb-4">{task.title}</h1>
                <p className="text-zinc-400 text-lg line-clamp-3">
                    {task.description || "Sense descripció. Concentra't en completar el títol!"}
                </p>
            </div>

            <div className="relative flex items-center justify-center mb-12">
                <svg className="w-80 h-80 transform -rotate-90">
                    <circle 
                        cx="160" cy="160" r="150" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent"
                        className="text-zinc-800" 
                    />
                    <circle 
                        cx="160" cy="160" r="150" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={150 * 2 * Math.PI} 
                        strokeDashoffset={(150 * 2 * Math.PI) - (progress / 100) * (150 * 2 * Math.PI)}
                        className="text-warning transition-all duration-1000 ease-linear" 
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-7xl font-black font-mono tracking-tighter">{minutes}:{seconds}</span>
                </div>
            </div>

            <div className="flex gap-4">
                <Button 
                    size="lg" 
                    color={isActive ? "warning" : "success"}
                    variant="shadow"
                    className="w-40 font-bold text-lg"
                    onPress={() => setIsActive(!isActive)}
                >
                    {isActive ? "⏸ PAUSA" : "▶ COMENÇAR"}
                </Button>
                <Button 
                    size="lg" 
                    variant="faded" 
                    className="font-bold text-zinc-300"
                    onPress={() => { setIsActive(false); setTimeLeft(25 * 60); }}
                >
                    🔄 REINICIAR
                </Button>
            </div>
        </div>
    );
};