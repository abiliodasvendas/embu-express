import { DIAS_SEMANA } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WeeklyScaleSelectionProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function WeeklyScaleSelection({ value = [], onChange }: WeeklyScaleSelectionProps) {
  const toggleDay = (dayId: number) => {
    const newValue = value.includes(dayId)
      ? value.filter((id) => id !== dayId)
      : [...value, dayId].sort((a, b) => {
          const order = [1, 2, 3, 4, 5, 6, 0];
          return order.indexOf(a) - order.indexOf(b);
        });
    onChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-2.5 ml-1 pt-1 justify-center sm:justify-start">
      {DIAS_SEMANA.map((day) => {
        const isActive = value.includes(day.id);
        return (
          <motion.button
            key={day.id}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleDay(day.id)}
            title={day.label}
            className={cn(
              "w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group border-2",
              isActive
                ? "bg-primary/10 border-primary text-primary shadow-xs"
                : "bg-card border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/30"
            )}
          >
            <span
              className={cn(
                "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-transform duration-300",
                isActive
                  ? "bg-primary scale-100"
                  : "bg-muted-foreground/30 scale-0 group-hover:scale-100"
              )}
            />

            <span className="text-[14px] font-black tracking-tight leading-none uppercase">
              {day.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
