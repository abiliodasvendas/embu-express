import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PortalPeriodSelectorProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthName: string;
  ano: number;
}

export function PortalPeriodSelector({
  onPrevMonth,
  onNextMonth,
  monthName,
  ano,
}: PortalPeriodSelectorProps) {
  return (
    <Card className="rounded-[24px] border border-border bg-card shadow-xs">
      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-[14px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Período de Referência
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            {monthName} de {ano}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-[14px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
