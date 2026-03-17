import { useMemo, useState, useCallback } from "react";
import { useFilters, UseFiltersOptions } from "./useFilters";
import { useOcorrencias } from "@/hooks/api/useOcorrencias";
import { useOccurrenceBusiness } from "../business/useOccurrenceBusiness";
import { usePermissions } from "../business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface UseOccurrenceViewModelOptions extends UseFiltersOptions {
  usuarioId?: string;
  initialDate?: Date;
  mode?: "daily" | "monthly";
}

export function useOccurrenceViewModel(options: UseOccurrenceViewModelOptions = {}) {
  const { usuarioId: initialUsuarioId, initialDate = new Date(), mode = "daily", ...filterOptions } = options;
  const { can, profile } = usePermissions();

  const [localDate, setLocalDate] = useState<Date>(initialDate);

  const filters = useFilters({
    usuarioParam: "usuario",
    mesParam: "mes",
    anoParam: "ano",
    ...filterOptions
  });

  const canViewAll = can(PERMISSIONS.OCORRENCIAS.VER);
  const finalUsuarioId = initialUsuarioId || (canViewAll ? (filters.selectedUsuario === 'todos' ? undefined : filters.selectedUsuario) : profile?.id);

  const dateRange = useMemo(() => {
    if (mode === "daily") {
      const formattedDate = format(localDate, "yyyy-MM-dd");
      return { inicio: formattedDate, fim: formattedDate };
    } else {
      const date = new Date(filters.selectedAno || new Date().getFullYear(), (filters.selectedMes || 1) - 1, 1);
      return {
        inicio: format(startOfMonth(date), "yyyy-MM-dd"),
        fim: format(endOfMonth(date), "yyyy-MM-dd")
      };
    }
  }, [localDate, filters.selectedMes, filters.selectedAno, mode]);

  const { data: rawOccurrences = [], isLoading, refetch } = useOcorrencias({
    data_inicio: dateRange.inicio,
    data_fim: dateRange.fim,
    usuario_id: finalUsuarioId || undefined,
    order: "data_ocorrencia",
    ascending: false,
  });

  const business = useOccurrenceBusiness();
  const occurrences = useMemo(() => business.processOccurrences(rawOccurrences), [rawOccurrences, business]);

  return useMemo(() => ({
    // State
    filters,
    localDate,
    occurrences,
    isLoading,
    canViewAll,
    usuarioId: finalUsuarioId,
    mode,
    
    // Actions
    refetch,
    setLocalDate,
    setUsuario: filters.setSelectedUsuario,
    setMonth: filters.setSelectedMes,
    setYear: filters.setSelectedAno,
  }), [
    filters, localDate, occurrences, isLoading, canViewAll, finalUsuarioId, mode, refetch,
    filters.setSelectedUsuario, filters.setSelectedMes, filters.setSelectedAno
  ]);
}
