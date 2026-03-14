import { useCallback, useState } from "react";
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
  semPontoHojeParam?: string;
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
  semPontoHojeValue: boolean;
  onSemPontoHojeChange: (val: boolean) => void;
  selectedSemPontoHoje?: boolean;
  setSelectedSemPontoHoje?: (value: boolean) => void;
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
    sem_ponto_hoje?: boolean;
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
    semPontoHojeParam,
    syncWithUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Internal state for when syncWithUrl is false
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
    semPontoHoje: boolean;
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
    semPontoHoje: false,
  });

  // Helper to get value from URL or Internal State
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

  const getBooleanValue = (param: string | undefined, internalKey: keyof typeof internalState, defaultValue: boolean) => {
    if (syncWithUrl && param) {
      return searchParams.get(param) === "true";
    }
    return internalState[internalKey] as boolean;
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
  const selectedSemPontoHoje = getBooleanValue(semPontoHojeParam, "semPontoHoje", false);

  const updateState = useCallback((key: keyof typeof internalState, value: any, param?: string) => {
    if (syncWithUrl && param) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (value !== undefined && value !== null && value !== STATUS_CADASTRO.TODOS && value !== "todas" && value !== false) {
          newParams.set(param, String(value));
        } else {
          newParams.delete(param);
        }
        return newParams;
      }, { replace: true });
    } else {
      setInternalState(prev => ({ ...prev, [key]: value }));
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
  const setSelectedSemPontoHoje = useCallback((v: boolean) => updateState("semPontoHoje", v, semPontoHojeParam), [updateState, semPontoHojeParam]);

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
        if (semPontoHojeParam) newParams.delete(semPontoHojeParam);
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
        semPontoHoje: false,
      });
    }
  }, [
    syncWithUrl,
    searchParam,
    statusParam,
    periodoParam,
    mesParam,
    anoParam,
    categoriaParam,
    clienteParam,
    empresaParam,
    usuarioParam,
    statusEntradaParam,
    statusSaidaParam,
    turnoParam,
    semPontoHojeParam,
    setSearchParams,
  ]);


  const setFilters = useCallback(
    (newFilters: {
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
      sem_ponto_hoje?: boolean;
    }) => {
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);

          const updateParam = (key: string | undefined, val: string | number | boolean | undefined) => {
            if (!key || val === undefined) return;
            if (String(val) !== STATUS_CADASTRO.TODOS && String(val) !== "" && val !== false) newParams.set(key, String(val));
            else newParams.delete(key);
          };

          updateParam(searchParam, newFilters.searchTerm);
          updateParam(statusParam, newFilters.status);
          updateParam(periodoParam, newFilters.periodo);

          if (newFilters.mes !== undefined && mesParam) newParams.set(mesParam, newFilters.mes.toString());
          if (newFilters.ano !== undefined && anoParam) newParams.set(anoParam, newFilters.ano.toString());

          updateParam(categoriaParam, newFilters.categoria);
          updateParam(clienteParam, newFilters.cliente);
          updateParam(empresaParam, newFilters.empresa);
          updateParam(usuarioParam, newFilters.usuario);
          updateParam(statusEntradaParam, newFilters.statusEntrada);
          updateParam(statusSaidaParam, newFilters.statusSaida);
          updateParam(turnoParam, newFilters.turno);
          updateParam(semPontoHojeParam, newFilters.sem_ponto_hoje);

          return newParams;
        }, { replace: true });
      } else {
        setInternalState(prev => ({
          ...prev,
          ...(newFilters.searchTerm !== undefined && { searchTerm: newFilters.searchTerm }),
          ...(newFilters.status !== undefined && { status: newFilters.status }),
          ...(newFilters.periodo !== undefined && { periodo: newFilters.periodo }),
          ...(newFilters.mes !== undefined && { mes: newFilters.mes }),
          ...(newFilters.ano !== undefined && { ano: newFilters.ano }),
          ...(newFilters.categoria !== undefined && { categoria: newFilters.categoria }),
          ...(newFilters.cliente !== undefined && { cliente: newFilters.cliente }),
          ...(newFilters.empresa !== undefined && { empresa: newFilters.empresa }),
          ...(newFilters.usuario !== undefined && { usuario: newFilters.usuario }),
          ...(newFilters.statusEntrada !== undefined && { statusEntrada: newFilters.statusEntrada }),
          ...(newFilters.statusSaida !== undefined && { statusSaida: newFilters.statusSaida }),
          ...(newFilters.turno !== undefined && { turno: newFilters.turno }),
          ...(newFilters.sem_ponto_hoje !== undefined && { semPontoHoje: newFilters.sem_ponto_hoje }),
        }));
      }
    },
    [
      syncWithUrl,
      searchParam,
      statusParam,
      periodoParam,
      mesParam,
      anoParam,
      categoriaParam,
      clienteParam,
      empresaParam,
      usuarioParam,
      statusEntradaParam,
      statusSaidaParam,
      turnoParam,
      semPontoHojeParam,
      setSearchParams,
    ]
  );

  const hasActiveFilters =
    !!searchTerm ||
    selectedStatus !== STATUS_CADASTRO.TODOS ||
    (selectedPeriodo !== undefined && selectedPeriodo !== STATUS_CADASTRO.TODOS) ||
    (selectedCategoria !== undefined && selectedCategoria !== STATUS_CADASTRO.TODOS) ||
    (selectedCliente !== undefined && selectedCliente !== STATUS_CADASTRO.TODOS) ||
    (selectedEmpresa !== undefined && selectedEmpresa !== STATUS_CADASTRO.TODOS) ||
    (selectedUsuario !== undefined && selectedUsuario !== STATUS_CADASTRO.TODOS) ||
    (selectedStatusEntrada !== undefined && selectedStatusEntrada !== STATUS_CADASTRO.TODOS) ||
    (selectedStatusSaida !== undefined && selectedStatusSaida !== STATUS_CADASTRO.TODOS) ||
    (selectedTurno !== undefined && selectedTurno !== STATUS_CADASTRO.TODOS) ||
    !!selectedSemPontoHoje;

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    ...(selectedPeriodo !== undefined && {
      selectedPeriodo,
      setSelectedPeriodo,
    }),
    ...(selectedMes !== undefined && {
      selectedMes,
      setSelectedMes,
    }),
    ...(selectedAno !== undefined && {
      selectedAno,
      setSelectedAno,
    }),
    ...(selectedCategoria !== undefined && {
      selectedCategoria,
      setSelectedCategoria,
    }),
    ...(selectedCliente !== undefined && {
      selectedCliente,
      setSelectedCliente,
    }),
    ...(selectedEmpresa !== undefined && {
      selectedEmpresa,
      setSelectedEmpresa,
    }),
    ...(selectedUsuario !== undefined && {
      selectedUsuario,
      setSelectedUsuario,
    }),
    ...(selectedStatusEntrada !== undefined && {
      selectedStatusEntrada,
      setSelectedStatusEntrada,
    }),
    ...(selectedStatusSaida !== undefined && {
      selectedStatusSaida,
      setSelectedStatusSaida,
    }),
    ...(selectedTurno !== undefined && {
      selectedTurno,
      setSelectedTurno,
    }),
    selectedSemPontoHoje: selectedSemPontoHoje || false,
    setSelectedSemPontoHoje,
    onClear: clearFilters,
    semPontoHojeValue: selectedSemPontoHoje || false,
    onSemPontoHojeChange: setSelectedSemPontoHoje,
    clearFilters,
    setFilters,
    hasActiveFilters,
    selectedCliente,
    setSelectedCliente,
    selectedEmpresa,
    setSelectedEmpresa,
  };
}
