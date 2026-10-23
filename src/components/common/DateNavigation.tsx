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
  maxDate?: Date | null;
}

export function DateNavigation({ date, onNavigate, disabled, maxDate: customMaxDate }: DateNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const maxDate = customMaxDate === undefined ? startOfDay(new Date()) : customMaxDate;

  const handlePrevious = () => {
    onNavigate(subDays(date, 1));
  };

  const handleNext = () => {
    const nextDate = addDays(date, 1);
    if (!maxDate || !isAfter(startOfDay(nextDate), maxDate)) {
      onNavigate(nextDate);
    }
  };

  const isNextDisabled = disabled || (maxDate && (isSameDay(date, maxDate) || isAfter(date, maxDate)));

  return (
    <div className="flex items-center justify-center gap-1.5 bg-card px-2 h-11 rounded-[18px] shadow-xs border border-border w-full md:w-auto">
      <Button
        disabled={disabled}
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-[12px] transition-colors cursor-pointer"
        aria-label="Dia anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 h-8 px-2.5 font-medium text-xs sm:text-sm text-foreground hover:bg-muted/70 rounded-[12px] transition-colors cursor-pointer",
              disabled && "text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarDays className="h-4 w-4 text-foreground" />
            <span>
              {format(date, "dd 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[10002] rounded-[18px] border border-border shadow-md" align="center">
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
            disabled={maxDate ? { after: maxDate } : undefined}
          />
        </PopoverContent>
      </Popover>

      <Button
        disabled={isNextDisabled}
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className={cn(
          "h-8 w-8 rounded-[12px] transition-colors",
          isNextDisabled
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer"
        )}
        aria-label="Próximo dia"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
