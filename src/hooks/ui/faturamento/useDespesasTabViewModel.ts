import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLayout } from "@/hooks";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { DespesaOperacional } from "@/types/database";
import {
  STATUS_DESPESA,
  CATEGORIA_DESPESA_LABELS,
} from "@/constants/financeiro.constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { toLocalDateString } from "@/utils/formatters/date";

interface UseDespesasTabViewModelProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  enabled?: boolean;
}

export function useDespesasTabViewModel({
  mes,
  ano,
  setMes,
  setAno,
  enabled = true,
}: UseDespesasTabViewModelProps) {
  const {
    openDespesaFormDialog,
    openLiquidarDespesaDialog,
    openConfirmationDialog,
  } = useLayout();

  const [empresaDespesaFiltro, setEmpresaDespesaFiltro] = useState<string>("todas");
  const [categoriaDespesaFiltro, setCategoriaDespesaFiltro] = useState<string>("todas");
  const [statusDespesaFiltro, setStatusDespesaFiltro] = useState<string>("todos");
  const [searchDespesa, setSearchDespesa] = useState<string>("");

  const { data: empresasList = [] } = useEmpresas({ ativo: "true" });

  const {
    despesas,
    isLoading: isLoadingDespesas,
    isFetching: isFetchingDespesas,
    deleteMutation: deleteDespesaMutation,
    refetch: refetchDespesas,
  } = useDespesas({ mes, ano }, { enabled });

  const despesasFiltradas = useMemo(() => {
    let list = despesas.filter((d) => {
      if (statusDespesaFiltro !== "todos") {
        if (d.status !== statusDespesaFiltro) return false;
      } else {
        if (d.status === STATUS_DESPESA.CANCELADO) return false;
      }

      if (categoriaDespesaFiltro !== "todas" && d.categoria !== categoriaDespesaFiltro) {
        return false;
      }

      if (empresaDespesaFiltro !== "todas") {
        if (empresaDespesaFiltro === "holding") {
          if (!d.is_holding) return false;
        } else if (String(d.empresa_id) !== empresaDespesaFiltro) {
          return false;
        }
      }

      return true;
    });

    if (searchDespesa.trim()) {
      const term = searchDespesa.toLowerCase().trim();
      list = list.filter((d) => {
        const desc = (d.descricao || "").toLowerCase();
        const cat = (CATEGORIA_DESPESA_LABELS[d.categoria] || d.categoria || "").toLowerCase();
        const emp = (d.is_holding ? "holding" : d.empresa?.nome_fantasia || "").toLowerCase();
        return desc.includes(term) || cat.includes(term) || emp.includes(term);
      });
    }

    return list;
  }, [despesas, statusDespesaFiltro, categoriaDespesaFiltro, empresaDespesaFiltro, searchDespesa]);

  const {
    sortedData: despesasOrdenadas,
    sortKey: sortKeyDespesas,
    sortDirection: sortDirDespesas,
    handleSort: handleSortDespesas,
  } = useTableSort(despesasFiltradas, {
    defaultKey: "data_vencimento",
    defaultDirection: "asc",
    customExtractors: {
      data_vencimento: (d) => d.data_vencimento || "",
      descricao: (d) => d.descricao || "",
      empresa: (d) => (d.is_holding ? "Geral Holding (Rateio)" : d.empresa?.nome_fantasia || ""),
      categoria: (d) => CATEGORIA_DESPESA_LABELS[d.categoria] || d.categoria || "",
      valor_previsto: (d) => Number(d.valor_previsto || 0),
      valor_pago: (d) => Number(d.valor_pago || 0),
      data_pagamento: (d) => d.data_pagamento || "",
      status: (d) => d.status || "",
    },
  });

  const kpisDespesas = useMemo(() => {
    let totalPrevisto = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalVencido = 0;
    let totalRecorrentes = 0;
    const hojeStr = toLocalDateString();

    for (const d of despesas) {
      if (d.status !== STATUS_DESPESA.CANCELADO) {
        const prev = Number(d.valor_previsto || 0);
        const pago = Number(d.valor_pago || 0);
        totalPrevisto += prev;

        if (d.status === STATUS_DESPESA.PAGO) {
          totalPago += pago > 0 ? pago : prev;
        } else {
          totalPendente += prev;
          if (d.data_vencimento < hojeStr) {
            totalVencido += prev;
          }
        }

        if (d.is_recorrente) {
          totalRecorrentes += prev;
        }
      }
    }

    return { totalPrevisto, totalPago, totalPendente, totalVencido, totalRecorrentes };
  }, [despesas]);

  const handleDeleteDespesa = (desp: DespesaOperacional) => {
    openConfirmationDialog({
      title: "Excluir Conta a Pagar",
      description: `Tem certeza que deseja excluir o lançamento "${desp.descricao}" no valor de ${formatCurrency(desp.valor_previsto)}?`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteDespesaMutation.mutateAsync(desp.id);
          await refetchDespesas();
          toast.success("Despesa excluída com sucesso!");
        } catch {
          toast.error("Erro ao excluir despesa.");
        }
      },
    });
  };

  const handleOpenNovaDespesa = () => {
    openDespesaFormDialog({
      onSuccess: async () => {
        await refetchDespesas();
      },
    });
  };

  const handleEditDespesa = (desp: DespesaOperacional) => {
    openDespesaFormDialog({
      despesaToEdit: desp,
      onSuccess: async () => {
        await refetchDespesas();
      },
    });
  };

  const handleLiquidarDespesa = (desp: DespesaOperacional) => {
    openLiquidarDespesaDialog({
      despesa: desp,
      onSuccess: async () => {
        await refetchDespesas();
      },
    });
  };

  return {
    mes,
    ano,
    setMes,
    setAno,
    empresaDespesaFiltro,
    setEmpresaDespesaFiltro,
    categoriaDespesaFiltro,
    setCategoriaDespesaFiltro,
    statusDespesaFiltro,
    setStatusDespesaFiltro,
    searchDespesa,
    setSearchDespesa,
    empresasList,
    despesas,
    despesasOrdenadas,
    kpisDespesas,
    sortKeyDespesas,
    sortDirDespesas,
    handleSortDespesas,
    isLoadingDespesas,
    isFetchingDespesas,
    handleDeleteDespesa,
    handleOpenNovaDespesa,
    handleEditDespesa,
    handleLiquidarDespesa,
  };
}
