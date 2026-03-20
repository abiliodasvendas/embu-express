import { StatusBadge } from "@/components/common/StatusBadge";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { cn } from "@/lib/utils";
import { DIAS_SEMANA } from "@/utils/formatters/constants";

interface CollaboratorCardProps {
    name: string;
    status: any;
    unitName?: string;
    shiftInterval: string;
    shiftDays: number[];
    unitDays: number[];
    showUnit?: boolean;
    onClick?: () => void;
}

/**
 * Reusable card for collaborator information (profile, shift details, and operational days).
 * Used in client details and unit details.
 */
export function CollaboratorCard({
    name,
    status,
    unitName,
    shiftInterval,
    shiftDays,
    unitDays,
    showUnit = true,
    onClick,
}: CollaboratorCardProps) {
    return (
        <div
            className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-primary/10"
            onClick={onClick}
        >
            {/* Top row: Avatar + info + badge */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary/5 flex items-center justify-center text-sm font-extrabold text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {name.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                    <h5 className="text-[15px] font-extrabold text-gray-900 truncate tracking-tight group-hover:text-primary transition-colors">
                        {name}
                    </h5>
                    <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">
                        {showUnit && (unitName || "S / Unidade")}{showUnit && " • "}{shiftInterval}
                    </p>
                </div>
                <StatusBadge
                    status={status}
                    className="shrink-0 text-[10px] px-2.5"
                />
            </div>

            {/* Scale row: Days of the week circles */}
            <div className="pt-3 border-t border-gray-50">
                <ScaleIndicators
                    activeDays={shiftDays}
                    availableDays={unitDays}
                />
            </div>
        </div>
    );
}
