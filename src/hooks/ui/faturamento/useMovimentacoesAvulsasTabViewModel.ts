import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLayout } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { MovimentacaoAvulsa } from "@/types/database";
import { CATEGORIA_MOVIMENTACAO_AVULSA_LABELS } from "@/constants/financeiro.constants";
import { formatCurrency, formatContaBancaria } from "@/utils/formatters";

interface UseMovimentacoesAvulsasTabViewModelProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  enabled?: boolean;
}

export function useMovimentacoesAvulsasTabViewModel({
  mes,
  ano,
  setMes,
  setAno,
  enabled = true,
}: UseMovimentacoesAvulsasTabViewModelProps) {
  const {
    openMovimentacaoAvulsaDialog,
    openConfirmationDialog,
  } = useLayout();

  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.MOVIMENTACOES_AVULSAS.EDITAR);

  const [tipoMovimentacaoFiltro, setTipoMovimentacaoFiltro] = useState<string>("todos");
  const [searchMovimentacao, setSearchMovimentacao] = useState<string>("");

  const {
    movimentacoes,
    isLoading: isLoadingMovimentacoes,
    isFetching: isFetchingMovimentacoes,
    deleteMutation: deleteMovimentacaoMutation,
    refetch: refetchMovimentacoes,
  } = useMovimentacoesAvulsas({ mes, ano }, { enabled });

  const movimentacoesFiltradas = useMemo(() => {
    let list = movimentacoes;
    if (tipoMovimentacaoFiltro !== "todos") {
      list = list.filter((m) => m.tipo_movimentacao === tipoMovimentacaoFiltro);
    }
    if (searchMovimentacao.trim()) {
      const term = searchMovimentacao.toLowerCase().trim();
      list = list.filter((m) => {
        const desc = (m.descricao || "").toLowerCase();
        const cat = (CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[m.categoria] || m.categoria || "").toLowerCase();
        const emp = (m.empresa?.nome_fantasia || "").toLowerCase();
        const contaStr = formatContaBancaria(m.conta_bancaria, m.empresa?.nome_fantasia).toLowerCase();
        return desc.includes(term) || cat.includes(term) || emp.includes(term) || contaStr.includes(term);
      });
    }
    return list;
  }, [movimentacoes, tipoMovimentacaoFiltro, searchMovimentacao]);

  const {
    sortedData: movimentacoesOrdenadas,
    sortKey: sortKeyMovimentacoes,
    sortDirection: sortDirMovimentacoes,
    handleSort: handleSortMovimentacoes,
  } = useTableSort(movimentacoesFiltradas, {
    defaultKey: "data_movimentacao",
    defaultDirection: "desc",
    customExtractors: {
      data_movimentacao: (m) => m.data_movimentacao || "",
      descricao: (m) => m.descricao || "",
      tipo_movimentacao: (m) => m.tipo_movimentacao || "",
      categoria: (m) => CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[m.categoria] || m.categoria || "",
      valor: (m) => Number(m.valor || 0),
      conta_bancaria: (m) => formatContaBancaria(m.conta_bancaria, m.empresa?.nome_fantasia),
    },
  });

  const kpisAvulsas = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;
    for (const m of movimentacoes) {
      if (m.tipo_movimentacao === "ENTRADA") {
        totalEntradas += Number(m.valor || 0);
      } else {
        totalSaidas += Number(m.valor || 0);
      }
    }
    const saldoLiquido = totalEntradas - totalSaidas;
    return { totalEntradas, totalSaidas, saldoLiquido, totalQtd: movimentacoes.length };
  }, [movimentacoes]);

  const handleDeleteMovimentacao = (mov: MovimentacaoAvulsa) => {
    openConfirmationDialog({
      title: "Excluir Movimentação Avulsa",
      description: `Tem certeza que deseja excluir o lançamento "${mov.descricao}" no valor de ${formatCurrency(mov.valor)}?`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMovimentacaoMutation.mutateAsync(mov.id);
          await refetchMovimentacoes();
          toast.success("Movimentação avulsa excluída com sucesso!");
        } catch {
          toast.error("Erro ao excluir movimentação avulsa.");
        }
      },
    });
  };

  const handleOpenNovaMovimentacao = () => {
    openMovimentacaoAvulsaDialog({
      onSuccess: () => {
        refetchMovimentacoes();
      },
    });
  };

  const handleEditMovimentacao = (mov: MovimentacaoAvulsa) => {
    openMovimentacaoAvulsaDialog({
      movimentacaoToEdit: mov,
      onSuccess: () => {
        refetchMovimentacoes();
      },
    });
  };

  return {
    canEdit,
    mes,
    ano,
    setMes,
    setAno,
    tipoMovimentacaoFiltro,
    setTipoMovimentacaoFiltro,
    searchMovimentacao,
    setSearchMovimentacao,
    movimentacoes,
    movimentacoesOrdenadas,
    kpisAvulsas,
    sortKeyMovimentacoes,
    sortDirMovimentacoes,
    handleSortMovimentacoes,
    isLoadingMovimentacoes,
    isFetchingMovimentacoes,
    handleDeleteMovimentacao,
    handleOpenNovaMovimentacao,
    handleEditMovimentacao,
  };
}
