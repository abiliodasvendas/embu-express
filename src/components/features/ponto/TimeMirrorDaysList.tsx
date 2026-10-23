import { Button } from "@/components/ui/button";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import type { PontoDiarioRelatorio } from "@/types/ponto-relatorio";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { TimeMirrorDailyCard } from "./TimeMirrorDailyCard";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { usePermissions } from "@/hooks/business/usePermissions";

interface TimeMirrorDaysListProps {
  realizedDays: PontoDiarioRelatorio[];
  futureDays: PontoDiarioRelatorio[];
  showFutureScale: boolean;
  setShowFutureScale: (show: boolean) => void;
  canViewAll: boolean;
  isFetchingRecord: boolean;
  selectedPontoId: number | null;
  isLoading: boolean;
  isActionable: boolean;
  handleOpenRecord: (day: PontoDiarioRelatorio) => void;
  handleDeleteById: (id: number) => void;
}

export function TimeMirrorDaysList({
  realizedDays,
  futureDays,
  showFutureScale,
  setShowFutureScale,
  canViewAll,
  isFetchingRecord,
  selectedPontoId,
  isLoading,
  isActionable,
  handleOpenRecord,
  handleDeleteById,
}: TimeMirrorDaysListProps) {
  const { can } = usePermissions();

  return (
    <div className="grid gap-3">
      {realizedDays.length > 0 && (
        <div
          className={cn(
            "hidden md:grid px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-1",
            canViewAll ? "grid-cols-11" : "grid-cols-6"
          )}
        >
          <div className="col-span-2">{messages.ponto.labels.data} / CLIENTE</div>
          <div className="col-span-2">{messages.ponto.labels.status}</div>
          <div className="col-span-1">{messages.ponto.labels.entrada}</div>
          <div className="col-span-1">{messages.ponto.labels.saida}</div>
          {canViewAll && (
            <>
              <div className="col-span-1 text-center">{messages.ponto.labels.kmTotal}</div>
              <div className="col-span-1 text-center">{messages.ponto.labels.efetivo}</div>
              <div className="col-span-1 text-center">{messages.ponto.labels.esperado}</div>
              <div className="col-span-2 text-right">{messages.ponto.labels.saldoDia}</div>
            </>
          )}
        </div>
      )}

      {realizedDays.length > 0 ? (
        realizedDays.map((day: PontoDiarioRelatorio, idx) => (
          <TimeMirrorDailyCard
            key={idx}
            day={day}
            canViewAll={canViewAll}
            isFetchingRecord={isFetchingRecord}
            selectedPontoId={selectedPontoId}
            onClick={handleOpenRecord}
            onDelete={
              isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR)
                ? handleDeleteById
                : undefined
            }
            isActionable={isActionable}
          />
        ))
      ) : (
        !isLoading &&
        futureDays.length === 0 && (
          <div className="py-12 bg-muted/20 rounded-[20px] border border-dashed border-border flex flex-col items-center justify-center text-center">
            <Info className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhuma atividade registrada para este período.
            </p>
          </div>
        )
      )}

      {futureDays.length > 0 && (
        <div className="mt-4 space-y-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFutureScale(!showFutureScale)}
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground hover:bg-muted rounded-[18px] h-9 px-3.5"
            >
              {showFutureScale ? (
                <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
              )}
              {showFutureScale
                ? "Ocultar Escala"
                : `Ver Escala Futura (${futureDays.length} dias)`}
            </Button>
            <div className="h-px flex-1 bg-border" />
          </div>

          {showFutureScale && (
            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
              {futureDays.map((day: PontoDiarioRelatorio, idx) => (
                <TimeMirrorDailyCard
                  key={`future-${idx}`}
                  day={day}
                  canViewAll={canViewAll}
                  isFetchingRecord={isFetchingRecord}
                  selectedPontoId={selectedPontoId}
                  onClick={handleOpenRecord}
                  onDelete={
                    isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR)
                      ? handleDeleteById
                      : undefined
                  }
                  isActionable={isActionable}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
