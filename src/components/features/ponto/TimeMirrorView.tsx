import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { getMessage } from "@/constants/messages";
import { FilterOptions } from "@/types/enums";
import { Calendar } from "lucide-react";
import { useTimeMirrorView } from "@/hooks/ui/ponto";
import { TimeMirrorEmptyCollaborator } from "./TimeMirrorEmptyCollaborator";
import { TimeMirrorPrintSection } from "./TimeMirrorPrintSection";
import { TimeMirrorKpis } from "./TimeMirrorKpis";
import { TimeMirrorDaysList } from "./TimeMirrorDaysList";

export interface TimeMirrorViewProps {
  usuarioId?: string;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  selectedMonth?: number;
  selectedYear?: number;
  selectedShift?: string;
  hideCollaboratorSelect?: boolean;
  isActionable?: boolean;
}

export function TimeMirrorView({
  usuarioId,
  colaboradorNome,
  cpf,
  cargo,
  selectedMonth,
  selectedYear,
  selectedShift = FilterOptions.TODOS,
  isActionable = false,
}: TimeMirrorViewProps) {
  const {
    canViewAll,
    month,
    year,
    isLoading,
    activeReport,
    hourBalance,
    isCurrentPeriod,
    realizedDays,
    futureDays,
    showFutureScale,
    setShowFutureScale,
    selectedPontoId,
    isFetchingRecord,
    handleDeleteById,
    handleOpenRecord,
  } = useTimeMirrorView({
    usuarioId,
    selectedMonth,
    selectedYear,
    selectedShift,
    isActionable,
  });

  if (!usuarioId) {
    return <TimeMirrorEmptyCollaborator />;
  }

  if (isLoading) {
    return <ListSkeleton />;
  }

  if (!activeReport) {
    return (
      <UnifiedEmptyState
        icon={Calendar}
        title={getMessage("ponto.labels.semRegistros")}
        description={getMessage("ponto.labels.semRegistrosDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <TimeMirrorPrintSection
        activeReport={activeReport}
        realizedDays={realizedDays}
        hourBalance={hourBalance}
        colaboradorNome={colaboradorNome}
        cpf={cpf}
        cargo={cargo}
        month={month}
        year={year}
      />

      <div className="print:hidden flex flex-col gap-8 md:gap-10">
        <TimeMirrorKpis
          activeReport={activeReport}
          hourBalance={hourBalance}
          isCurrentPeriod={isCurrentPeriod}
        />

        <TimeMirrorDaysList
          realizedDays={realizedDays}
          futureDays={futureDays}
          showFutureScale={showFutureScale}
          setShowFutureScale={setShowFutureScale}
          canViewAll={canViewAll}
          isFetchingRecord={isFetchingRecord}
          selectedPontoId={selectedPontoId}
          isLoading={isLoading}
          isActionable={isActionable}
          handleOpenRecord={handleOpenRecord}
          handleDeleteById={handleDeleteById}
        />
      </div>
    </div>
  );
}

export default TimeMirrorView;
