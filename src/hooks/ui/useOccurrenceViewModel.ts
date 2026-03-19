import { useMemo } from "react";
import { useHierarchyFilters, useFiltersManager, UseFiltersOptions, useDateRangeFilters, useUrlState } from "./useFilters";
import { useOcorrencias, useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { useOccurrenceBusiness } from "../business/useOccurrenceBusiness";
import { usePermissions } from "../business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { FilterOptions } from "@/types/enums";

interface UseOccurrenceViewModelOptions extends UseFiltersOptions {
  usuarioId?: string;
  mode?: "daily" | "monthly";
  selectedMonth?: number;
  selectedYear?: number;
}

export function useOccurrenceViewModel(options: UseOccurrenceViewModelOptions = {}) {
  const { usuarioId: initialUsuarioId, ...filterOptions } = options;
  const { can, profile } = usePermissions();

  const { syncWithUrl = true } = filterOptions;

  const { selectedUsuario, setSelectedUsuario } = useHierarchyFilters({
    usuarioParam: "usuario",
    syncWithUrl
  });

  const { startDate, setStartDate, endDate, setEndDate } = useDateRangeFilters({
    startParam: "data_inicio",
    endParam: "data_fim",
    syncWithUrl
  });

  const [selectedTipo, setSelectedTipo] = useUrlState<string>({
    key: "tipo_id",
    defaultValue: FilterOptions.TODOS,
    syncWithUrl
  });

  const manager = useFiltersManager(["usuario", "data_inicio", "data_fim", "tipo_id"], syncWithUrl);
  
  const filters = {
    selectedUsuario, setSelectedUsuario,
    startDate, setStartDate,
    endDate, setEndDate,
    selectedTipo, setSelectedTipo,
    ...manager
  };

  const canViewAll = can(PERMISSIONS.OCORRENCIAS.VER);
  const finalUsuarioId = initialUsuarioId || (canViewAll ? (filters.selectedUsuario === 'todos' ? undefined : filters.selectedUsuario) : profile?.id);

  const { data: rawOccurrences = [], isLoading, refetch } = useOcorrencias({
    data_inicio: filters.startDate,
    data_fim: filters.endDate,
    tipo_id: filters.selectedTipo === FilterOptions.TODOS ? undefined : Number(filters.selectedTipo),
    usuario_id: finalUsuarioId || undefined,
    order: "data_ocorrencia",
    ascending: false,
  });

  const { data: tiposOcorrencia = [] } = useTiposOcorrencia();

  const business = useOccurrenceBusiness();
  const occurrences = useMemo(() => business.processOccurrences(rawOccurrences), [rawOccurrences, business]);

  return useMemo(() => ({
    // State
    filters,
    startDate: filters.startDate,
    endDate: filters.endDate,
    occurrences,
    tiposOcorrencia,
    isLoading,
    canViewAll,
    usuarioId: finalUsuarioId,
    
    // Actions
    refetch,
    setStartDate: filters.setStartDate,
    setEndDate: filters.setEndDate,
    setUsuario: filters.setSelectedUsuario,
    setTipo: filters.setSelectedTipo
  }), [
    filters, occurrences, tiposOcorrencia, isLoading, canViewAll, finalUsuarioId, refetch
  ]);
}
