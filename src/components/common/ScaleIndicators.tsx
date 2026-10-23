import { cn } from "@/lib/utils";
import { DIAS_SEMANA } from "@/utils/formatters/constants";

interface ScaleIndicatorsProps {
  activeDays: number[];
  availableDays?: number[];
  className?: string;
  itemClassName?: string;
  size?: "xs" | "sm" | "md";
  variant?: "normal" | "condensed" | "light" | "soft";
}

export function ScaleIndicators({
  activeDays,
  availableDays,
  className,
  itemClassName,
  size = "sm",
  variant = "normal",
}: ScaleIndicatorsProps) {
  const isLight = variant === "light" || variant === "soft" || variant === "condensed";
  const isCondensed = variant === "condensed" || size === "xs";

  const sizeClasses = isCondensed
    ? "w-6 h-6 text-[9px]"
    : size === "md"
      ? "w-8 h-8 text-[11px]"
      : "w-7 h-7 text-[10px]";

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
                  ? isLight
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-primary text-white shadow-sm shadow-primary/20"
                  : isLight
                    ? "bg-muted/40 text-muted-foreground/50 border border-transparent"
                    : "bg-gray-50 text-gray-300",
                itemClassName,
              )}
            >
              {day.label.substring(0, 1).toUpperCase()}
            </div>
          );
        },
      )}
    </div>
  );
}
