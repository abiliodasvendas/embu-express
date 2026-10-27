import { PONTO_STATUS_UI_CONFIG } from "@/config/ponto-ui";
import { ManagementStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface TimeTrackingKpiFiltersProps {
  activeFilter: ManagementStatus | null;
  counts: Record<string, number>;
  onFilterClick: (status: ManagementStatus | "ALL") => void;
  className?: string;
}

export function TimeTrackingKpiFilters({
  activeFilter,
  counts,
  onFilterClick,
  className
}: TimeTrackingKpiFiltersProps) {
  const statuses = [
    ManagementStatus.ALL,
    ManagementStatus.LATE,
    ManagementStatus.OVERTIME,
    ManagementStatus.WORKING,
    ManagementStatus.ABSENT,
    ManagementStatus.WAITING,
    ManagementStatus.DONE
  ];

  return (
    <div
      className={cn(
        "-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0",
        className
      )}
    >
      {statuses.map((status) => {
        const config = PONTO_STATUS_UI_CONFIG[status as ManagementStatus];
        const isActive =
          (status === ManagementStatus.ALL && activeFilter === null) ||
          activeFilter === (status as ManagementStatus);
        const count = counts[status] || 0;
        const Icon = config.icon;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilterClick(status)}
            className={cn(
              "min-w-[110px] sm:min-w-0 flex-1 flex flex-col items-center justify-center p-3 rounded-[18px] transition-all text-center select-none cursor-pointer active:scale-95",
              isActive
                ? cn("border-2 shadow-xs scale-[1.02]", config.border, config.bg)
                : "border border-border bg-card hover:bg-muted/40 shadow-xs hover:border-border/80"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-[10px] flex items-center justify-center mb-1.5 shrink-0 transition-colors",
                isActive
                  ? "bg-white/80 dark:bg-black/20 shadow-xs"
                  : cn(config.bg, "border border-transparent")
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 transition-colors", config.color)} />
            </div>

            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider truncate w-full mb-0.5 transition-colors",
                isActive ? config.color : "text-muted-foreground"
              )}
            >
              {config.label}
            </span>

            <span
              className={cn(
                "text-lg sm:text-xl font-bold tabular-nums transition-colors",
                isActive ? config.color : "text-foreground"
              )}
            >
              {String(count).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
