import { Button } from "@/components/ui/button";
import { meses } from "@/utils/formatters/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConvenioPeriodSelectorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isQuinzenal?: boolean;
  quinzena?: number;
  onSelectQuinzena?: (q: number) => void;
}

export function ConvenioPeriodSelector({
  currentDate,
  onPrevMonth,
  onNextMonth,
  isQuinzenal,
  quinzena = 1,
  onSelectQuinzena,
}: ConvenioPeriodSelectorProps) {
  const mesNome = meses[currentDate.getMonth()];
  const ano = currentDate.getFullYear();

  return (
    <div className="rounded-[24px] border border-border bg-card shadow-xs p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
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

      {isQuinzenal && onSelectQuinzena && (
        <div className="flex items-center justify-center gap-2 pt-1 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectQuinzena(1)}
            className={cn(
              "rounded-[14px] text-xs font-semibold px-4 h-8 transition-colors",
              quinzena === 1
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            1ª Quinzena (01 a 15)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectQuinzena(2)}
            className={cn(
              "rounded-[14px] text-xs font-semibold px-4 h-8 transition-colors",
              quinzena === 2
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            2ª Quinzena (16 ao fim)
          </Button>
        </div>
      )}
    </div>
  );
}
