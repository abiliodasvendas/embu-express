import { Badge } from "@/components/ui/badge";
import { DIAS_SEMANA } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";

interface WeeklyScaleProps {
    escala: number[];
    className?: string;
}

export function WeeklyScale({ escala, className }: WeeklyScaleProps) {
    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {DIAS_SEMANA.map((day) => {
                const isActive = escala.includes(day.id);
                return (
                    <Badge
                        key={day.id}
                        variant={isActive ? "default" : "outline"}
                        className={cn(
                            "h-7 min-w-[36px] justify-center text-[10px] font-bold uppercase transition-all duration-200",
                            isActive
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"
                        )}
                    >
                        {day.label}
                    </Badge>
                );
            })}
        </div>
    );
}
