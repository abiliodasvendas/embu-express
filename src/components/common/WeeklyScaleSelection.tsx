import { DIAS_SEMANA } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WeeklyScaleSelectionProps {
  value: number[];
  onChange: (value: number[]) => void;
}

/**
 * Modernized selector for days of the week.
 * Users can click circles to toggle active days.
 */
export function WeeklyScaleSelection({ value = [], onChange }: WeeklyScaleSelectionProps) {
  const toggleDay = (dayId: number) => {
    const newValue = value.includes(dayId)
      ? value.filter((id) => id !== dayId)
      : [...value, dayId].sort((a, b) => {
          // Keep days in order (1-6, 0 being sunday)
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
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : "bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {/* Subtle indicator dot */}
            <span className={cn(
              "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-transform duration-300",
              isActive 
                ? "bg-white/40 scale-100" 
                : "bg-gray-200 scale-0 group-hover:scale-100"
            )} />
            
            <span className="text-[14px] font-black tracking-tight leading-none uppercase">
                {day.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
