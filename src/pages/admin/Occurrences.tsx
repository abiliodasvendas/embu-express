import { OccurrenceView } from "@/components/features/ocorrencias/OccurrenceView";
import { Button } from "@/components/ui/button";
import { History, Plus, Settings } from "lucide-react";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { OccurrenceFormMode } from "@/types/enums";

export function Occurrences() {
  const {
    setPageTitle,
    openOccurrenceFormDialog,
    openOccurrenceTypesDialog,
  } = useLayout();

  useEffect(() => {
    setPageTitle("Ocorrências");
  }, [setPageTitle]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ocorrências
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Gerencie lançamentos operacionais, faltas, atestados e adiantamentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openOccurrenceTypesDialog()}
            variant="outline"
            className="h-11 rounded-[18px] gap-2 border-border text-foreground hover:bg-muted font-medium px-4 shadow-xs text-xs sm:text-sm transition-all active:scale-95"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Gerenciar Tipos</span>
          </Button>
          <Button
            onClick={() => openOccurrenceFormDialog({ mode: OccurrenceFormMode.GENERAL })}
            className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 shadow-xs gap-2 text-xs sm:text-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Ocorrência</span>
          </Button>
        </div>
      </div>

      <OccurrenceView />
    </div>
  );
}

export default Occurrences;
