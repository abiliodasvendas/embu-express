import { useMemo, useCallback } from "react";
import { useFilters, UseFiltersOptions } from "./useFilters";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { useTimeMirrorBusiness } from "../business/useTimeMirrorBusiness";
import { usePermissions } from "../business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";

interface UseTimeMirrorViewModelOptions extends UseFiltersOptions {
  usuarioId?: string;
}

export function useTimeMirrorViewModel(options: UseTimeMirrorViewModelOptions = {}) {
  const { usuarioId: initialUsuarioId, ...filterOptions } = options;
  const { can, profile } = usePermissions();

  const filters = useFilters({
    usuarioParam: "usuario",
    mesParam: "mes",
    anoParam: "ano",
    turnoParam: "turno",
    ...filterOptions
  });

  const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);
  const finalUsuarioId = initialUsuarioId || (canViewAll ? (filters.selectedUsuario === 'todos' ? undefined : filters.selectedUsuario) : profile?.id);

  const { data: rawReport = [], isLoading, refetch } = useTimeMirror(
    finalUsuarioId || undefined,
    filters.selectedMes,
    filters.selectedAno
  );

  const business = useTimeMirrorBusiness();

  const processedData = useMemo(() => 
    business.processRecords(rawReport, filters.selectedTurno || 'todos'),
    [rawReport, filters.selectedTurno, business]
  );

  const { records, totals, availableShifts } = processedData;

  return useMemo(() => ({
    // State
    filters,
    records,
    totals,
    availableShifts,
    isLoading,
    canViewAll,
    usuarioId: finalUsuarioId,
    
    // Actions
    refetch,
    setMonth: filters.setSelectedMes,
    setYear: filters.setSelectedAno,
    setShift: filters.setSelectedTurno,
    setUsuario: filters.setSelectedUsuario
  }), [
    filters, records, totals, availableShifts, isLoading, canViewAll, finalUsuarioId, refetch,
    filters.setSelectedMes, filters.setSelectedAno, filters.setSelectedTurno, filters.setSelectedUsuario
  ]);
}
