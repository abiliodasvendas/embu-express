import { cn } from "@/lib/utils";
import { DIAS_SEMANA } from "@/utils/formatters/constants";

interface ScaleIndicatorsProps {
    activeDays: number[];
    availableDays?: number[]; // Days to show (e.g., unit operational days). If not provided, shows all 7 days.
    className?: string;
    itemClassName?: string;
    size?: "sm" | "md";
    variant?: "normal" | "condensed";
}

/**
 * Reusable horizontal scale (dots/circles) for days of the week.
 * highlights active days (blue) vs inactive (gray).
 */
export function ScaleIndicators({
    activeDays,
    availableDays,
    className,
    itemClassName,
    size = "sm",
    variant = "normal",
}: ScaleIndicatorsProps) {
    const isCondensed = variant === "condensed";
    const sizeClasses = isCondensed 
        ? "w-6 h-6 text-[9px]" 
        : size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]";

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {DIAS_SEMANA.filter((day) => !availableDays || availableDays.includes(day.id)).map(
                (day) => {
                    const isActive = activeDays.includes(day.id);
                    return (
                        <div
                            key={day.id}
                            title={day.label}
                            className={cn(
                                "rounded-full flex items-center justify-center font-bold transition-all duration-300",
                                sizeClasses,
                                isActive
                                    ? isCondensed 
                                        ? "bg-primary/80 text-white"
                                        : "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "bg-gray-50 text-gray-300",
                                itemClassName
                            )}
                        >
                            {day.label.substring(0, 1).toUpperCase()}
                        </div>
                    );
                }
            )}
        </div>
    );
}
