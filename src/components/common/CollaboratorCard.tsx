import { StatusBadge } from "@/components/common/StatusBadge";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { StatusUsuario } from "@/types/enums";

interface CollaboratorCardProps {
    name: string;
    status: StatusUsuario | boolean | string;
    unitName?: string;
    shiftInterval: string;
    shiftDays: number[];
    unitDays: number[];
    showUnit?: boolean;
    variant?: "normal" | "condensed";
    onClick?: () => void;
}

export function CollaboratorCard({
    name,
    status,
    unitName,
    shiftInterval,
    shiftDays,
    unitDays,
    showUnit = true,
    variant = "normal",
    onClick,
}: CollaboratorCardProps) {
    return (
        <div
            className="bg-card px-6 py-5 rounded-[18px] border border-border shadow-xs hover:border-foreground/20 hover:shadow-xs transition-all cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] bg-muted/70 text-foreground border border-border flex items-center justify-center text-sm font-bold shrink-0">
                    {name.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-foreground truncate tracking-tight">
                            {name}
                        </h5>
                        <StatusBadge
                            status={status}
                            className="shrink-0 text-[10px] px-2 h-5 uppercase tracking-wider"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                        {showUnit && (unitName || "S / Unidade")}{showUnit && " • "}{shiftInterval}
                    </p>
                </div>
            </div>

            <div className="pt-1">
                <ScaleIndicators
                    activeDays={shiftDays}
                    availableDays={unitDays}
                    variant={variant}
                />
            </div>
        </div>
    );
}
