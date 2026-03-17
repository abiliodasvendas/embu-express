import { useCallback, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { STATUS_CADASTRO } from "@/constants/cadastro";

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
  statusEntradaParam?: string;
  statusSaidaParam?: string;
  turnoParam?: string;
  syncWithUrl?: boolean;
}

export interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPeriodo?: string;
  setSelectedPeriodo?: (value: string) => void;
  selectedMes?: number;
  setSelectedMes?: (value: number) => void;
  selectedAno?: number;
  setSelectedAno?: (value: number) => void;
  selectedCategoria?: string;
  setSelectedCategoria?: (value: string) => void;
  selectedCliente?: string;
  setSelectedCliente?: (value: string) => void;
  selectedEmpresa?: string;
  setSelectedEmpresa?: (value: string) => void;
  selectedUsuario?: string;
  setSelectedUsuario?: (value: string) => void;
  selectedStatusEntrada?: string;
  setSelectedStatusEntrada?: (value: string) => void;
  selectedStatusSaida?: string;
  setSelectedStatusSaida?: (value: string) => void;
  selectedTurno?: string;
  setSelectedTurno?: (value: string) => void;
  onClear: () => void;
  onApply?: () => void;
  clearFilters: () => void;
  setFilters: (newFilters: {
    searchTerm?: string;
    status?: string;
    periodo?: string;
    mes?: number;
    ano?: number;
    categoria?: string;
    cliente?: string;
    empresa?: string;
    usuario?: string;
    statusEntrada?: string;
    statusSaida?: string;
    turno?: string;
  }) => void;
  hasActiveFilters: boolean;
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const {
    searchParam = "search",
    statusParam = "status",
    periodoParam = "periodo",
    mesParam,
    anoParam,
    categoriaParam,
    clienteParam,
    empresaParam,
    usuarioParam,
    statusEntradaParam,
    statusSaidaParam,
    turnoParam,
    syncWithUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Mapeamento de nomes de parâmetros (incluindo padrões)
  const paramNames = useMemo(() => ({
    searchTerm: searchParam,
    status: statusParam,
    periodo: periodoParam,
    mes: mesParam,
    ano: anoParam,
    categoria: categoriaParam,
    cliente: clienteParam,
    empresa: empresaParam,
    usuario: usuarioParam,
    statusEntrada: statusEntradaParam,
    statusSaida: statusSaidaParam,
    turno: turnoParam,
  }), [
    searchParam, statusParam, periodoParam, mesParam, anoParam, categoriaParam,
    clienteParam, empresaParam, usuarioParam, statusEntradaParam, statusSaidaParam, turnoParam
  ]);

  const [internalState, setInternalState] = useState<{
    searchTerm: string;
    status: string;
    periodo: string;
    mes: number;
    ano: number;
    categoria: string;
    cliente: string;
    empresa: string;
    usuario: string;
    statusEntrada: string;
    statusSaida: string;
    turno: string;
  }>({
    searchTerm: "",
    status: STATUS_CADASTRO.TODOS,
    periodo: STATUS_CADASTRO.TODOS,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    categoria: STATUS_CADASTRO.TODOS,
    cliente: STATUS_CADASTRO.TODOS,
    empresa: STATUS_CADASTRO.TODOS,
    usuario: STATUS_CADASTRO.TODOS,
    statusEntrada: STATUS_CADASTRO.TODOS,
    statusSaida: STATUS_CADASTRO.TODOS,
    turno: STATUS_CADASTRO.TODOS,
  });

  const getValue = (param: string | undefined, internalKey: keyof typeof internalState, defaultValue: any) => {
    if (syncWithUrl && param) {
      return searchParams.get(param) ?? defaultValue;
    }
    return internalState[internalKey];
  };

  const getNumberValue = (param: string | undefined, internalKey: keyof typeof internalState, defaultValue: number) => {
    if (syncWithUrl && param) {
      const val = searchParams.get(param);
      return val ? parseInt(val) : defaultValue;
    }
    return internalState[internalKey] as number;
  };

  const searchTerm = getValue(searchParam, "searchTerm", "");
  const selectedStatus = getValue(statusParam, "status", STATUS_CADASTRO.TODOS);
  const selectedPeriodo = getValue(periodoParam, "periodo", STATUS_CADASTRO.TODOS);
  const selectedMes = getNumberValue(mesParam, "mes", new Date().getMonth() + 1);
  const selectedAno = getNumberValue(anoParam, "ano", new Date().getFullYear());
  const selectedCategoria = getValue(categoriaParam, "categoria", STATUS_CADASTRO.TODOS);
  const selectedCliente = getValue(clienteParam, "cliente", STATUS_CADASTRO.TODOS);
  const selectedEmpresa = getValue(empresaParam, "empresa", STATUS_CADASTRO.TODOS);
  const selectedUsuario = getValue(usuarioParam, "usuario", STATUS_CADASTRO.TODOS);
  const selectedStatusEntrada = getValue(statusEntradaParam, "statusEntrada", STATUS_CADASTRO.TODOS);
  const selectedStatusSaida = getValue(statusSaidaParam, "statusSaida", STATUS_CADASTRO.TODOS);
  const selectedTurno = getValue(turnoParam, "turno", STATUS_CADASTRO.TODOS);

  const updateState = useCallback((key: keyof typeof internalState, value: any, param?: string) => {
    if (syncWithUrl && param) {
      const stringValue = String(value);
      const isDefault = value === STATUS_CADASTRO.TODOS || value === "todas" || value === undefined || value === null;

      setSearchParams((prev) => {
        const currentValue = prev.get(param);
        
        if (isDefault) {
          if (currentValue === null) return prev;
          const newParams = new URLSearchParams(prev);
          newParams.delete(param);
          return newParams;
        } 
        
        if (currentValue === stringValue) return prev;
        
        const newParams = new URLSearchParams(prev);
        newParams.set(param, stringValue);
        return newParams;
      }, { replace: true });
    } else {
      setInternalState(prev => {
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
    }
  }, [syncWithUrl, setSearchParams]);

  const setSearchTerm = useCallback((v: string) => updateState("searchTerm", v, searchParam), [updateState, searchParam]);
  const setSelectedStatus = useCallback((v: string) => updateState("status", v, statusParam), [updateState, statusParam]);
  const setSelectedPeriodo = useCallback((v: string) => updateState("periodo", v, periodoParam), [updateState, periodoParam]);
  const setSelectedMes = useCallback((v: number) => updateState("mes", v, mesParam), [updateState, mesParam]);
  const setSelectedAno = useCallback((v: number) => updateState("ano", v, anoParam), [updateState, anoParam]);
  const setSelectedCategoria = useCallback((v: string) => updateState("categoria", v, categoriaParam), [updateState, categoriaParam]);
  const setSelectedCliente = useCallback((v: string) => updateState("cliente", v, clienteParam), [updateState, clienteParam]);
  const setSelectedEmpresa = useCallback((v: string) => updateState("empresa", v, empresaParam), [updateState, empresaParam]);
  const setSelectedUsuario = useCallback((v: string) => updateState("usuario", v, usuarioParam), [updateState, usuarioParam]);
  const setSelectedStatusEntrada = useCallback((v: string) => updateState("statusEntrada", v, statusEntradaParam), [updateState, statusEntradaParam]);
  const setSelectedStatusSaida = useCallback((v: string) => updateState("statusSaida", v, statusSaidaParam), [updateState, statusSaidaParam]);
  const setSelectedTurno = useCallback((v: string) => updateState("turno", v, turnoParam), [updateState, turnoParam]);

  const clearFilters = useCallback(() => {
    if (syncWithUrl) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (searchParam) newParams.delete(searchParam);
        if (statusParam) newParams.delete(statusParam);
        if (periodoParam) newParams.delete(periodoParam);
        if (mesParam) newParams.delete(mesParam);
        if (anoParam) newParams.delete(anoParam);
        if (categoriaParam) newParams.delete(categoriaParam);
        if (clienteParam) newParams.delete(clienteParam);
        if (empresaParam) newParams.delete(empresaParam);
        if (usuarioParam) newParams.delete(usuarioParam);
        if (statusEntradaParam) newParams.delete(statusEntradaParam);
        if (statusSaidaParam) newParams.delete(statusSaidaParam);
        if (turnoParam) newParams.delete(turnoParam);
        return newParams;
      }, { replace: true });
    } else {
      setInternalState({
        searchTerm: "",
        status: STATUS_CADASTRO.TODOS,
        periodo: STATUS_CADASTRO.TODOS,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        categoria: STATUS_CADASTRO.TODOS,
        cliente: STATUS_CADASTRO.TODOS,
        empresa: STATUS_CADASTRO.TODOS,
        usuario: STATUS_CADASTRO.TODOS,
        statusEntrada: STATUS_CADASTRO.TODOS,
        statusSaida: STATUS_CADASTRO.TODOS,
        turno: STATUS_CADASTRO.TODOS,
      });
    }
  }, [
    syncWithUrl, searchParam, statusParam, periodoParam, mesParam, anoParam, categoriaParam,
    clienteParam, empresaParam, usuarioParam, statusEntradaParam, statusSaidaParam, turnoParam, setSearchParams
  ]);

  const setFilters = useCallback((newFilters: Parameters<UseFiltersReturn["setFilters"]>[0]) => {
    if (syncWithUrl) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(newFilters).forEach(([key, value]) => {
          const param = (paramNames as any)[key];
          if (param) {
            const isDefault = value === undefined || value === null || value === STATUS_CADASTRO.TODOS || value === "todas" || value === "";
            if (!isDefault) {
              newParams.set(param, String(value));
            } else {
              newParams.delete(param);
            }
          }
        });
        return newParams;
      }, { replace: true });
    } else {
      setInternalState(prev => ({ ...prev, ...newFilters }));
    }
  }, [syncWithUrl, setSearchParams, options]);

  const hasActiveFilters = useMemo(() => {
    if (syncWithUrl) {
      return Object.values(paramNames).some(k => k && searchParams.has(k));
    }
    // Only check fields that have an associated parameter name configured
    return Object.entries(internalState).some(([key, v]) => {
      const paramName = (paramNames as any)[key];
      if (!paramName) return false;
      return v !== STATUS_CADASTRO.TODOS && v !== "todas" && v !== "";
    });
  }, [syncWithUrl, searchParams, internalState, paramNames]);

  return useMemo(() => ({
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedPeriodo,
    setSelectedPeriodo,
    selectedMes,
    setSelectedMes,
    selectedAno,
    setSelectedAno,
    selectedCategoria,
    setSelectedCategoria,
    selectedCliente,
    setSelectedCliente,
    selectedEmpresa,
    setSelectedEmpresa,
    selectedUsuario,
    setSelectedUsuario,
    selectedStatusEntrada,
    setSelectedStatusEntrada,
    selectedStatusSaida,
    setSelectedStatusSaida,
    selectedTurno,
    setSelectedTurno,
    onClear: clearFilters,
    clearFilters,
    setFilters,
    hasActiveFilters,
  }), [
    searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, selectedPeriodo, setSelectedPeriodo,
    selectedMes, setSelectedMes, selectedAno, setSelectedAno, selectedCategoria, setSelectedCategoria,
    selectedCliente, setSelectedCliente, selectedEmpresa, setSelectedEmpresa, selectedUsuario, setSelectedUsuario,
    selectedStatusEntrada, setSelectedStatusEntrada, selectedStatusSaida, setSelectedStatusSaida,
    selectedTurno, setSelectedTurno, clearFilters, setFilters, hasActiveFilters
  ]);
}
