import { Progress, Tooltip } from "@heroui/react";

interface Props {
    level?: number;
    xp?: number;
}

export const UserLevelBadge = ({ level, xp }: Props) => {
    const safeLevel = level ?? 1;
    const safeXp = xp ?? 0;

    const progress = safeXp;
    const xpNeeded = 100 - safeXp;

    return (
        <Tooltip
            content={
                <div className="px-1 py-1">
                    <div className="text-small font-bold text-warning mb-1">XP: {safeXp} / 100</div>
                    <div className="text-tiny text-default-500">Et falten {xpNeeded} XP per al Nivell {safeLevel + 1}</div>
                </div>
            }
            placement="bottom"
            color="default"
            showArrow
        >
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-warning tracking-wider">NIVELL {safeLevel}</span>
                    <Progress
                        size="sm"
                        color="warning"
                        value={progress}
                        className="w-24 mt-1"
                        classNames={{
                            indicator: "bg-gradient-to-r from-warning to-danger",
                            track: "bg-default-200"
                        }}
                    />
                </div>
                <div className="w-9 h-9 rounded-lg bg-warning/10 border-2 border-warning flex items-center justify-center text-warning font-black text-sm shadow-[0_0_12px_rgba(245,165,36,0.3)] rotate-3">
                    {safeLevel}
                </div>
            </div>
        </Tooltip>
    );
};