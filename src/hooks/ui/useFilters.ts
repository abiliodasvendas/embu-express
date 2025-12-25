import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface UseFiltersOptions {
  searchParam?: string;
  statusParam?: string;
  periodoParam?: string;
  mesParam?: string;
  anoParam?: string;
  categoriaParam?: string;
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
  clearFilters: () => void;
  setFilters: (newFilters: {
    searchTerm?: string;
    status?: string;
    periodo?: string;
    mes?: number;
    ano?: number;
    categoria?: string;
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
    syncWithUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTermState] = useState(() => {
    return syncWithUrl ? searchParams.get(searchParam) ?? "" : "";
  });

  const [selectedStatus, setSelectedStatusState] = useState(() => {
    return syncWithUrl ? searchParams.get(statusParam) ?? "todos" : "todos";
  });

  const [selectedPeriodo, setSelectedPeriodoState] = useState<
    string | undefined
  >(() => {
    if (!periodoParam) return undefined;
    return syncWithUrl ? searchParams.get(periodoParam) ?? "todos" : "todos";
  });

  const [selectedMes, setSelectedMesState] = useState<number | undefined>(
    () => {
      if (!mesParam) return undefined;
      const val = syncWithUrl ? searchParams.get(mesParam) : null;
      return val ? parseInt(val) : new Date().getMonth() + 1;
    }
  );

  const [selectedAno, setSelectedAnoState] = useState<number | undefined>(
    () => {
      if (!anoParam) return undefined;
      const val = syncWithUrl ? searchParams.get(anoParam) : null;
      return val ? parseInt(val) : new Date().getFullYear();
    }
  );

  const [selectedCategoria, setSelectedCategoriaState] = useState<
    string | undefined
  >(() => {
    if (!categoriaParam) return undefined;
    return syncWithUrl ? searchParams.get(categoriaParam) ?? "todos" : "todos";
  });

  const setSearchTerm = useCallback(
    (value: string) => {
      setSearchTermState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value) {
            newParams.set(searchParam, value);
          } else {
            newParams.delete(searchParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, searchParam, setSearchParams]
  );

  const setSelectedStatus = useCallback(
    (value: string) => {
      setSelectedStatusState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(statusParam, value);
          } else {
            newParams.delete(statusParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, statusParam, setSearchParams]
  );

  const setSelectedPeriodo = useCallback(
    (value: string) => {
      if (!periodoParam) return;
      setSelectedPeriodoState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(periodoParam, value);
          } else {
            newParams.delete(periodoParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, periodoParam, setSearchParams]
  );

  const setSelectedMes = useCallback(
    (value: number) => {
      if (!mesParam) return;
      setSelectedMesState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(mesParam, value.toString());
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, mesParam, setSearchParams]
  );

  const setSelectedAno = useCallback(
    (value: number) => {
      if (!anoParam) return;
      setSelectedAnoState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(anoParam, value.toString());
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, anoParam, setSearchParams]
  );

  const setSelectedCategoria = useCallback(
    (value: string) => {
      if (!categoriaParam) return;
      setSelectedCategoriaState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(categoriaParam, value);
          } else {
            newParams.delete(categoriaParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, categoriaParam, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchTermState("");
    setSelectedStatusState("todos");
    if (selectedPeriodo !== undefined) setSelectedPeriodoState("todos");
    if (selectedMes !== undefined) setSelectedMesState(new Date().getMonth() + 1);
    if (selectedAno !== undefined) setSelectedAnoState(new Date().getFullYear());
    if (selectedCategoria !== undefined) setSelectedCategoriaState("todos");

    if (syncWithUrl) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete(searchParam);
        newParams.delete(statusParam);
        if (periodoParam) newParams.delete(periodoParam);
        if (mesParam) newParams.delete(mesParam);
        if (anoParam) newParams.delete(anoParam);
        if (categoriaParam) newParams.delete(categoriaParam);
        return newParams;
      }, { replace: true });
    }
  }, [
    syncWithUrl,
    searchParam,
    statusParam,
    periodoParam,
    mesParam,
    anoParam,
    categoriaParam,
    setSearchParams,
    selectedPeriodo,
    selectedMes,
    selectedAno,
    selectedCategoria,
  ]);

  // Sync state with URL params when they change externally
  useEffect(() => {
    if (!syncWithUrl) return;

    const urlSearch = searchParams.get(searchParam) ?? "";
    const urlStatus = searchParams.get(statusParam) ?? "todos";
    const urlPeriodo = periodoParam ? searchParams.get(periodoParam) ?? "todos" : undefined;
    const urlMes = mesParam ? searchParams.get(mesParam) : undefined;
    const urlAno = anoParam ? searchParams.get(anoParam) : undefined;
    const urlCategoria = categoriaParam ? searchParams.get(categoriaParam) ?? "todos" : undefined;

    if (urlSearch !== searchTerm) setSearchTermState(urlSearch);
    if (urlStatus !== selectedStatus) setSelectedStatusState(urlStatus);
    if (periodoParam && urlPeriodo !== selectedPeriodo) setSelectedPeriodoState(urlPeriodo);
    if (mesParam && urlMes && parseInt(urlMes) !== selectedMes) setSelectedMesState(parseInt(urlMes));
    if (anoParam && urlAno && parseInt(urlAno) !== selectedAno) setSelectedAnoState(parseInt(urlAno));
    if (categoriaParam && urlCategoria !== selectedCategoria) setSelectedCategoriaState(urlCategoria);
  }, [
    searchParams,
    syncWithUrl,
    searchParam,
    statusParam,
    periodoParam,
    mesParam,
    anoParam,
    categoriaParam,
  ]);

  const setFilters = useCallback(
    (newFilters: {
      searchTerm?: string;
      status?: string;
      periodo?: string;
      mes?: number;
      ano?: number;
      categoria?: string;
    }) => {
      // Update local state
      if (newFilters.searchTerm !== undefined) setSearchTermState(newFilters.searchTerm);
      if (newFilters.status !== undefined) setSelectedStatusState(newFilters.status);
      if (newFilters.periodo !== undefined && periodoParam) setSelectedPeriodoState(newFilters.periodo);
      if (newFilters.mes !== undefined && mesParam) setSelectedMesState(newFilters.mes);
      if (newFilters.ano !== undefined && anoParam) setSelectedAnoState(newFilters.ano);
      if (newFilters.categoria !== undefined && categoriaParam) setSelectedCategoriaState(newFilters.categoria);

      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          
          if (newFilters.searchTerm !== undefined) {
            if (newFilters.searchTerm) newParams.set(searchParam, newFilters.searchTerm);
            else newParams.delete(searchParam);
          }

          if (newFilters.status !== undefined) {
            if (newFilters.status && newFilters.status !== "todos") newParams.set(statusParam, newFilters.status);
            else newParams.delete(statusParam);
          }

          if (newFilters.periodo !== undefined && periodoParam) {
            if (newFilters.periodo && newFilters.periodo !== "todos") newParams.set(periodoParam, newFilters.periodo);
            else newParams.delete(periodoParam);
          }

          if (newFilters.mes !== undefined && mesParam) {
            newParams.set(mesParam, newFilters.mes.toString());
          }

          if (newFilters.ano !== undefined && anoParam) {
            newParams.set(anoParam, newFilters.ano.toString());
          }

          if (newFilters.categoria !== undefined && categoriaParam) {
            if (newFilters.categoria && newFilters.categoria !== "todos") newParams.set(categoriaParam, newFilters.categoria);
            else newParams.delete(categoriaParam);
          }

          return newParams;
        }, { replace: true });
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
      setSearchParams,
    ]
  );

  const hasActiveFilters =
    !!searchTerm ||
    selectedStatus !== "todos" ||
    (selectedPeriodo !== undefined && selectedPeriodo !== "todos") ||
    (selectedCategoria !== undefined && selectedCategoria !== "todos");

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
    clearFilters,
    setFilters,
    hasActiveFilters,
  };
}
