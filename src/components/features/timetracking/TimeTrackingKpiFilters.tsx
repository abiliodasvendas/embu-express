import { PONTO_STATUS_UI_CONFIG } from "@/config/ponto-ui";
import { ManagementStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface TimeTrackingKpiFiltersProps {
    activeFilter: ManagementStatus | null;
    counts: Record<string, number>;
    onFilterClick: (status: ManagementStatus | 'ALL') => void;
    className?: string;
}

export function TimeTrackingKpiFilters({
    activeFilter,
    counts,
    onFilterClick,
    className
}: TimeTrackingKpiFiltersProps) {
    const statuses = Object.values(ManagementStatus);

    return (
        <div className={cn("grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 lg:gap-4", className)}>
            {statuses.map((status) => {
                const config = PONTO_STATUS_UI_CONFIG[status as ManagementStatus];
                const isActive = (status === ManagementStatus.ALL && activeFilter === null) || activeFilter === (status as ManagementStatus);
                const count = counts[status];

                return (
                    <button
                        key={status}
                        onClick={() => onFilterClick(status)}
                        className={cn(
                            "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 group text-center h-full active:scale-95 cursor-pointer",
                            isActive
                                ? cn(config.border.replace('bg-', 'border-'), config.bg, "shadow-md scale-[1.02]")
                                : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                        )}
                    >
                        <config.icon className={cn("w-4 h-4 mb-2 opacity-40", isActive ? config.color : "text-gray-400")} />
                        <span className={cn(
                            "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 sm:mb-1 transition-colors",
                            isActive ? config.color : "text-gray-400 group-hover:text-gray-600"
                        )}>
                            {config.label}
                        </span>
                        <span className={cn(
                            "text-lg sm:text-2xl font-black transition-colors",
                            isActive ? config.color : "text-gray-300 group-hover:text-gray-500"
                        )}>
                            {String(count || 0).padStart(2, '0')}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
