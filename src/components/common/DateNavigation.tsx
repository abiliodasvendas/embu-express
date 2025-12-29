import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format, isAfter, isSameDay, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DateNavigationProps {
  date: Date;
  onNavigate: (date: Date) => void;
  disabled?: boolean;
}

export function DateNavigation({ date, onNavigate, disabled }: DateNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const maxDate = startOfDay(new Date());

  const handlePrevious = () => {
    onNavigate(subDays(date, 1));
  };

  const handleNext = () => {
    const nextDate = addDays(date, 1);
    if (!isAfter(startOfDay(nextDate), maxDate)) {
       onNavigate(nextDate);
    }
  };

  const isNextDisabled = disabled || isSameDay(date, maxDate) || isAfter(date, maxDate);

  return (
    <div className="flex items-center justify-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
      <Button
        disabled={disabled}
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 h-8 px-3 font-bold text-gray-900 uppercase tracking-wide hover:bg-gray-50 rounded-lg transition-all",
              disabled && "text-gray-400 opacity-50"
            )}
          >
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              {format(date, "dd 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[10002]" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                onNavigate(d);
                setIsCalendarOpen(false);
              }
            }}
            locale={ptBR}
            initialFocus
            disabled={{ after: maxDate }}
          />
        </PopoverContent>
      </Popover>

      <Button
        disabled={isNextDisabled}
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className={cn(
            "h-8 w-8 rounded-lg",
            isNextDisabled 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
