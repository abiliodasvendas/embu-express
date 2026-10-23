import { Button } from "@/components/ui/button";
import { meses } from "@/utils/formatters/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ConvenioPeriodSelectorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function ConvenioPeriodSelector({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: ConvenioPeriodSelectorProps) {
  const mesNome = meses[currentDate.getMonth()];
  const ano = currentDate.getFullYear();

  return (
    <div className="rounded-[24px] border border-border bg-card shadow-xs p-3 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        className="h-10 w-10 rounded-[12px] text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Período de Referência
        </span>
        <span className="text-base sm:text-lg font-bold text-foreground">
          {mesNome} de {ano}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="h-10 w-10 rounded-[12px] text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
