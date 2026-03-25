import { useMemo } from "react";
import { useHierarchyFilters, useDateFilters, useFiltersManager, UseFiltersOptions } from "./useFilters";
import { useFinanceiro } from "@/hooks/api/useFinanceiro";
import { useFinancialReportBusiness } from "../business/useFinancialReportBusiness";
import { usePermissions } from "../business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";

interface UseFinancialReportViewModelOptions extends UseFiltersOptions {
  usuarioId?: string;
  colaboradorNome?: string;
}

export function useFinancialReportViewModel(options: UseFinancialReportViewModelOptions = {}) {
  const { usuarioId: initialUsuarioId, colaboradorNome, ...filterOptions } = options;
  const { can, profile } = usePermissions();

  const { syncWithUrl = true } = filterOptions;

  const { selectedUsuario, setSelectedUsuario } = useHierarchyFilters({
    usuarioParam: "usuario",
    syncWithUrl
  });

  const { selectedMes, setSelectedMes, selectedAno, setSelectedAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl
  });

  const manager = useFiltersManager(["usuario", "mes", "ano"], syncWithUrl);
  
  const filters = {
    selectedUsuario, setSelectedUsuario,
    selectedMes, setSelectedMes,
    selectedAno, setSelectedAno,
    ...manager
  };

  const canViewAll = can(PERMISSIONS.FINANCEIRO.EXTRATO);
  const finalUsuarioId = initialUsuarioId || (canViewAll ? (filters.selectedUsuario === 'todos' ? undefined : filters.selectedUsuario) : profile?.id);
  const isOnlyPersonal = !canViewAll;

  const { data: rawReport, isLoading, refetch } = useFinanceiro(
    finalUsuarioId || undefined,
    filters.selectedMes,
    filters.selectedAno
  );

  const business = useFinancialReportBusiness();
  const report = useMemo(() => business.processReport(rawReport), [rawReport, business]);

  return useMemo(() => ({
    // State
    filters,
    report,
    isLoading,
    canViewAll,
    isOnlyPersonal,
    usuarioId: finalUsuarioId,
    colaboradorNome: isOnlyPersonal ? profile?.nome_completo : colaboradorNome,
    
    // Actions
    refetch,
    setMonth: filters.setSelectedMes,
    setYear: filters.setSelectedAno,
    setUsuario: filters.setSelectedUsuario
  }), [
    filters, report, isLoading, canViewAll, isOnlyPersonal, finalUsuarioId, 
    profile?.nome_completo, colaboradorNome, refetch, 
    filters.setSelectedMes, filters.setSelectedAno, filters.setSelectedUsuario
  ]);
}
