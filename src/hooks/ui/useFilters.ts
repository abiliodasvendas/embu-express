import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterOptions } from "@/types/enums";
import { useUrlState } from "./useUrlState";
export { useUrlState };

export interface UseFiltersOptions {
  searchParam?: string;
  statusParam?: string;
  periodoParam?: string;
  mesParam?: string;
  anoParam?: string;
  categoriaParam?: string;
  clienteParam?: string;
  empresaParam?: string;
  usuarioParam?: string;
  turnoParam?: string;
  syncWithUrl?: boolean;
}

export interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (val: string | null | undefined) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string | null | undefined) => void;
  selectedMes: number;
  setSelectedMes: (val: number | null | undefined) => void;
  selectedAno: number;
  setSelectedAno: (val: number | null | undefined) => void;
  selectedCategoria: string;
  setSelectedCategoria: (val: string | null | undefined) => void;
  selectedCliente: string;
  setSelectedCliente: (val: string | null | undefined) => void;
  selectedEmpresa: string;
  setSelectedEmpresa: (val: string | null | undefined) => void;
  selectedUsuario: string;
  setSelectedUsuario: (val: string | null | undefined) => void;
  selectedTurno: string;
  setSelectedTurno: (val: string | null | undefined) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onClear: () => void;
  setFilters: (filters: any) => void;
}

// 1. Hook para Busca
export function useSearchFilters(param = "search", syncWithUrl = true) {
  const [searchTerm, setSearchTerm] = useUrlState<string>({ key: param, defaultValue: "", syncWithUrl });
  return { searchTerm, setSearchTerm };
}

// 2. Hook para Status Simples
export function useStatusFilters(param = "status", syncWithUrl = true) {
  const [selectedStatus, setSelectedStatus] = useUrlState<string>({ key: param, defaultValue: FilterOptions.TODOS, syncWithUrl });
  return { selectedStatus, setSelectedStatus };
}

// 2.1 Hook para Categoria/Cargo
export function useCategoryFilters(param = "categoria", syncWithUrl = true) {
  const [selectedCategoria, setSelectedCategoria] = useUrlState<string>({ key: param, defaultValue: FilterOptions.TODOS, syncWithUrl });
  return { selectedCategoria, setSelectedCategoria };
}

// 3. Hook para Datas/Meses
export function useDateFilters(options: { mesParam?: string; anoParam?: string; syncWithUrl?: boolean } = {}) {
  const { mesParam = "mes", anoParam = "ano", syncWithUrl = true } = options;
  const [selectedMes, setSelectedMes] = useUrlState<number>({ key: mesParam, defaultValue: new Date().getMonth() + 1, syncWithUrl: !!mesParam && syncWithUrl });
  const [selectedAno, setSelectedAno] = useUrlState<number>({ key: anoParam, defaultValue: new Date().getFullYear(), syncWithUrl: !!anoParam && syncWithUrl });
  return { selectedMes, setSelectedMes, selectedAno, setSelectedAno };
}

// 3.1 Hook para Período (Date Range)
export function useDateRangeFilters(options: { 
  startParam?: string; 
  endParam?: string; 
  syncWithUrl?: boolean;
  defaultValueStart?: string;
  defaultValueEnd?: string;
} = {}) {
  const { startParam = "data_inicio", endParam = "data_fim", syncWithUrl = true, defaultValueStart, defaultValueEnd } = options;
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useUrlState<string>({ key: startParam, defaultValue: defaultValueStart || today, syncWithUrl });
  const [endDate, setEndDate] = useUrlState<string>({ key: endParam, defaultValue: defaultValueEnd || today, syncWithUrl });
  return { startDate, setStartDate, endDate, setEndDate };
}

// 4. Hook para Hierarquia (Empresa, Cliente, Usuário)
export function useHierarchyFilters(options: { empresaParam?: string; clienteParam?: string; usuarioParam?: string; syncWithUrl?: boolean } = {}) {
  const { empresaParam, clienteParam, usuarioParam, syncWithUrl = true } = options;
  const [selectedEmpresa, setSelectedEmpresa] = useUrlState<string>({ key: empresaParam || "emp_h", defaultValue: FilterOptions.TODOS, syncWithUrl: !!empresaParam && syncWithUrl });
  const [selectedCliente, setSelectedCliente] = useUrlState<string>({ key: clienteParam || "cli_h", defaultValue: FilterOptions.TODOS, syncWithUrl: !!clienteParam && syncWithUrl });
  const [selectedUsuario, setSelectedUsuario] = useUrlState<string>({ key: usuarioParam || "usr_h", defaultValue: FilterOptions.TODOS, syncWithUrl: !!usuarioParam && syncWithUrl });
  return { selectedEmpresa, setSelectedEmpresa, selectedCliente, setSelectedCliente, selectedUsuario, setSelectedUsuario };
}

// 5. Hook para Filtros Específicos de Ponto
export function usePontoFilters(options: { turnoParam?: string; syncWithUrl?: boolean } = {}) {
  const { turnoParam, syncWithUrl = true } = options;
  const [selectedTurno, setSelectedTurno] = useUrlState<string>({ key: turnoParam || "tur_h", defaultValue: FilterOptions.TODOS, syncWithUrl: !!turnoParam && syncWithUrl });
  return { selectedTurno, setSelectedTurno };
}

// 6. Hook para Gestão Geral de Limpeza e Utilitários
export function useFiltersManager(allParams: (string | undefined)[], syncWithUrl = true) {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearFilters = useCallback(() => {
    if (!syncWithUrl) return;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      allParams.forEach(p => { if (p) newParams.delete(p); });
      return newParams;
    }, { replace: true });
  }, [allParams, syncWithUrl, setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return allParams.some(p => p && searchParams.has(p));
  }, [allParams, searchParams]);

  return { clearFilters, hasActiveFilters };
}

// 7. Hook para Atualização em Lote (Batch)
export function useBatchFilters(options: UseFiltersOptions) {
  const [, setSearchParams] = useSearchParams();

  const setFilters = useCallback((newFilters: Record<string, string | number | boolean | null | undefined>) => {
    if (!options.syncWithUrl) return;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      const map: Record<string, string | undefined> = {
          searchTerm: options.searchParam || "search",
          status: options.statusParam || "status",
          periodo: options.periodoParam || "periodo",
          mes: options.mesParam,
          ano: options.anoParam,
          categoria: options.categoriaParam,
          cliente: options.clienteParam,
          empresa: options.empresaParam,
          usuario: options.usuarioParam,
          usuarioId: options.usuarioParam,
          clienteId: options.clienteParam,
          turno: options.turnoParam
      };

      Object.entries(newFilters).forEach(([key, value]) => {
        const paramKey = map[key];
        if (paramKey) {
            if (value === undefined || value === null || value === FilterOptions.TODOS || value === "") {
                newParams.delete(paramKey);
            } else {
                newParams.set(paramKey, String(value));
            }
        }
      });
      
      return newParams;
    }, { replace: true });
  }, [options, setSearchParams]);

  return setFilters;
}

// MANTENDO useFilters como a FACADE principal para não quebrar código legado imediatamente
export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const search = useSearchFilters(options.searchParam, options.syncWithUrl);
  const status = useStatusFilters(options.statusParam, options.syncWithUrl);
  const categoria = useCategoryFilters(options.categoriaParam, options.syncWithUrl);
  const dates = useDateFilters({ mesParam: options.mesParam, anoParam: options.anoParam, syncWithUrl: options.syncWithUrl });
  const hierarchy = useHierarchyFilters({ empresaParam: options.empresaParam, clienteParam: options.clienteParam, usuarioParam: options.usuarioParam, syncWithUrl: options.syncWithUrl });
  const ponto = usePontoFilters({ turnoParam: options.turnoParam, syncWithUrl: options.syncWithUrl });
  
  const allParams = [
      options.searchParam || "search", options.statusParam || "status", options.periodoParam || "periodo",
      options.mesParam, options.anoParam, options.categoriaParam || "categoria",
      options.clienteParam, options.empresaParam, options.usuarioParam,
      options.turnoParam
  ];
  
  const manager = useFiltersManager(allParams, options.syncWithUrl);
  const setFilters = useBatchFilters(options);

  return {
    ...search,
    ...status,
    ...categoria,
    ...dates,
    ...hierarchy,
    ...ponto,
    clearFilters: manager.clearFilters,
    onClear: manager.clearFilters,
    hasActiveFilters: manager.hasActiveFilters,
    setFilters
  };
}
