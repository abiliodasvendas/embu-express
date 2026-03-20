import { useMemo } from "react";
import { useHierarchyFilters, useDateFilters, usePontoFilters, useFiltersManager, UseFiltersOptions } from "./useFilters";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { usePermissions } from "../business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { FilterOptions } from "@/types/enums";
import { EspelhoPontoMensal } from "@/types/ponto-relatorio";

interface UseTimeMirrorViewModelOptions extends UseFiltersOptions {
  usuarioId?: string;
}

export function useTimeMirrorViewModel(options: UseTimeMirrorViewModelOptions = {}) {
  const { usuarioId: initialUsuarioId, ...filterOptions } = options;
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

  const { selectedTurno, setSelectedTurno } = usePontoFilters({
    turnoParam: "turno",
    syncWithUrl
  });

  const manager = useFiltersManager(["usuario", "mes", "ano", "turno"], syncWithUrl);
  
  const filters = {
    selectedUsuario, setSelectedUsuario,
    selectedMes, setSelectedMes,
    selectedAno, setSelectedAno,
    selectedTurno, setSelectedTurno,
    ...manager
  };

  const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);
  const finalUsuarioId = initialUsuarioId || (canViewAll ? (filters.selectedUsuario === 'todos' ? undefined : filters.selectedUsuario) : profile?.id);

  const { data: reportData = [], isLoading, refetch } = useTimeMirror(
    finalUsuarioId || undefined,
    filters.selectedMes,
    filters.selectedAno
  );

  // Seleciona o relatório do turno ativo
  const activeReport = useMemo(() => {
    if (!reportData.length) return null;
    if (!filters.selectedTurno || filters.selectedTurno === FilterOptions.TODOS) {
      return reportData[0];
    }
    return reportData.find(r => r.shift_id === Number(filters.selectedTurno)) || reportData[0];
  }, [reportData, filters.selectedTurno]);

  // Se precisar extrair os turnos disponíveis para o seletor
  const availableShifts = useMemo(() => 
    reportData
      .filter(r => r.shift_id !== 0) // Filtra o consolidado para não duplicar com "Todos"
      .map(r => ({ id: r.shift_id, label: `${r.cliente_nome} - ${r.unidade_nome}` })), 
    [reportData]
  );

  return useMemo(() => ({
    // State
    filters,
    records: activeReport?.calendario || [],
    totals: activeReport?.kpis ? {
        worked: activeReport.kpis.horas_trabalhadas,
        expected: activeReport.kpis.horas_esperadas,
        balance: activeReport.kpis.horas_trabalhadas - activeReport.kpis.horas_esperadas,
        kmCount: activeReport.kpis.km_realizado,
        lackCount: activeReport.kpis.dias_faltas
    } : { worked: 0, expected: 0, balance: 0, kmCount: 0, lackCount: 0 },
    availableShifts,
    reportData, // Expor tudo se a view quiser gerenciar multiplos
    activeReport,
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
    filters, activeReport, reportData, availableShifts, isLoading, canViewAll, finalUsuarioId, refetch
  ]);
}
