import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AniversariantesResumo } from "@/services/api/aniversariante.api";
import { Cake, CalendarDays, CalendarOff } from "lucide-react";

interface AniversariantesKpiCardsProps {
  resumo: AniversariantesResumo;
  nomeMesSelecionado: string;
  isLoading: boolean;
}

export function AniversariantesKpiCards({
  resumo,
  nomeMesSelecionado,
  isLoading,
}: AniversariantesKpiCardsProps) {
  const cards = [
    {
      label: "Aniversariantes hoje",
      value: resumo.total_hoje,
      icon: Cake,
    },
    {
      label: `Em ${nomeMesSelecionado}`,
      value: resumo.total_mes,
      icon: CalendarDays,
    },
    {
      label: "Sem data cadastrada",
      value: resumo.total_sem_data,
      icon: CalendarOff,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className="rounded-[24px] border border-[#e5e5e5] bg-white shadow-xs"
          >
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 rounded-[10px]" />
                ) : (
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-foreground shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
