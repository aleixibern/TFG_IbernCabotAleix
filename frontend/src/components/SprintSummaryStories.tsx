import { useEffect, useState } from 'react';
import { Button } from "@heroui/react";

export interface StoryData {
    sprintName: string;
    completedCount: number;
    pendingCount: number;
    mvpName: string;
    mvpTasks: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: StoryData | null;
}

export const SprintSummaryStories = ({ isOpen, onClose, data }: Props) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const SLIDES_COUNT = 3;
    const SLIDE_DURATION = 4000; // 4 segons per slide

    useEffect(() => {
        if (!isOpen) {
            setCurrentSlide(0);
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentSlide < SLIDES_COUNT - 1) {
                        setCurrentSlide(s => s + 1);
                        return 0;
                    } else {
                        clearInterval(interval);
                        setTimeout(onClose, 50); // Tanquem amb un petit delay de seguretat
                        return 100;
                    }
                }
                return prev + (100 / (SLIDE_DURATION / 30)); // 30ms per frame
            });
        }, 30);

        return () => clearInterval(interval);
    }, [isOpen, currentSlide, onClose]);

    if (!isOpen || !data) return null;

    const handleNext = () => {
        if (currentSlide < SLIDES_COUNT - 1) {
            setCurrentSlide(s => s + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(s => s - 1);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* BARRES DE PROGRÉS SUPERIORS */}
            <div className="absolute top-0 left-0 w-full p-4 flex gap-2 z-10 max-w-md mx-auto right-0">
                {Array.from({ length: SLIDES_COUNT }).map((_, idx) => (
                    <div key={idx} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                            style={{ 
                                width: idx === currentSlide ? `${progress}%` : idx < currentSlide ? '100%' : '0%' 
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* BOTÓ TANCAR */}
            <Button 
                isIconOnly 
                variant="light" 
                className="absolute top-4 right-4 z-20 text-white/70 hover:text-white" 
                onPress={onClose}
            >
                ✕
            </Button>

            {/* CONTROLS TÀCTILS */}
            <div className="absolute inset-0 z-0 flex">
                <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
                <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
            </div>

            {/* CONTINGUT DE LES DIAPOSITIVES */}
            <div className="z-10 w-full max-w-md p-8 text-center flex flex-col items-center justify-center min-h-[400px] pointer-events-none">
                
                {currentSlide === 0 && (
                    <div className="flex flex-col items-center gap-6 animate-appearance-in">
                        <div className="text-8xl animate-bounce">🚀</div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Sprint Completat!</h1>
                        <p className="text-xl text-zinc-400 font-medium">{data.sprintName}</p>
                    </div>
                )}

                {currentSlide === 1 && (
                    <div className="flex flex-col items-center gap-6 animate-appearance-in">
                        <div className="text-7xl">📊</div>
                        <h2 className="text-3xl font-bold text-white">Balanç de l'Equip</h2>
                        <div className="flex flex-col gap-4 mt-4 w-full">
                            <div className="bg-success/20 border border-success/30 p-4 rounded-2xl">
                                <p className="text-5xl font-black text-success mb-1">{data.completedCount}</p>
                                <p className="text-sm font-bold text-success/80 uppercase tracking-widest">Tasques Tancades</p>
                            </div>
                            <div className="bg-danger/20 border border-danger/30 p-4 rounded-2xl">
                                <p className="text-3xl font-black text-danger mb-1">{data.pendingCount}</p>
                                <p className="text-xs font-bold text-danger/80 uppercase tracking-widest">Tornen al Backlog</p>
                            </div>
                        </div>
                    </div>
                )}

                {currentSlide === 2 && (
                    <div className="flex flex-col items-center gap-6 animate-appearance-in">
                        <div className="text-8xl">🏆</div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest text-warning">MVP de l'Sprint</h2>
                        <div className="bg-gradient-to-br from-warning to-danger p-1 rounded-3xl w-full shadow-[0_0_40px_rgba(245,165,36,0.3)]">
                            <div className="bg-zinc-950 rounded-[22px] p-6 flex flex-col items-center gap-2">
                                <span className="text-2xl font-black text-white truncate w-full">{data.mvpName}</span>
                                <span className="text-sm text-zinc-400 font-medium">{data.mvpTasks} tasques resoltes</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};