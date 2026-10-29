import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLayout } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { useAgingRecebiveis } from "@/hooks/api/useAgingRecebiveis";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { FaturaCliente, StatusFatura } from "@/types/database";
import {
  STATUS_FATURA,
  TIPO_PERIODO_FATURA,
  FILTRO_PERIODO_FATURA,
} from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";

interface UseFaturasTabViewModelProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
}

export function useFaturasTabViewModel({
  mes,
  ano,
  setMes,
  setAno,
}: UseFaturasTabViewModelProps) {
  const {
    openFaturaFormDialog,
    openLiquidarFaturaDialog,
    openConfirmationDialog,
  } = useLayout();

  const { can, isSuperAdmin, isLoading: isLoadingPermissions } = usePermissions();
  const canEdit = isLoadingPermissions ? true : (isSuperAdmin || can(PERMISSIONS.FATURAMENTO.EDITAR));

  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todas");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [empresaFaturaFiltro, setEmpresaFaturaFiltro] = useState<string>("todas");
  const [searchFatura, setSearchFatura] = useState<string>("");
  const [agingFaixaFiltro, setAgingFaixaFiltro] = useState<string | null>(null);

  const { data: empresasList = [] } = useEmpresas({ ativo: "true" });

  const filtrosFatura = useMemo(() => {
    const filtros: {
      mes?: number;
      ano?: number;
      quinzena?: number;
      tipo_periodo?: string;
      numero_periodo?: number;
      empresa_id?: number;
      status?: StatusFatura;
    } = {
      mes,
      ano,
    };
    if (periodoFiltro === FILTRO_PERIODO_FATURA.QUINZENA_1) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.QUINZENAL;
      filtros.numero_periodo = 1;
    } else if (periodoFiltro === FILTRO_PERIODO_FATURA.QUINZENA_2) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.QUINZENAL;
      filtros.numero_periodo = 2;
    } else if (periodoFiltro === FILTRO_PERIODO_FATURA.MENSAL) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.MENSAL;
    } else if (periodoFiltro.startsWith("SEM_")) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.SEMANAL;
      filtros.numero_periodo = Number(periodoFiltro.replace("SEM_", ""));
    }
    if (statusFiltro !== "todos") {
      filtros.status = statusFiltro as StatusFatura;
    }
    if (empresaFaturaFiltro !== "todas") {
      filtros.empresa_id = Number(empresaFaturaFiltro);
    }
    return filtros;
  }, [mes, ano, periodoFiltro, statusFiltro, empresaFaturaFiltro]);

  const {
    faturas,
    isLoading: isLoadingFaturas,
    isFetching: isFetchingFaturas,
    deleteMutation,
    refetch: refetchFaturas,
  } = useFaturas(filtrosFatura);

  const { data: aging } = useAgingRecebiveis(mes, ano);

  const faturasExibidas = useMemo(() => {
    let list = faturas;

    if (agingFaixaFiltro) {
      const hojeDate = new Date();
      list = list.filter((f) => {
        if (f.status === STATUS_FATURA.LIQUIDADA || f.status === STATUS_FATURA.CANCELADA) {
          return false;
        }
        const saldo = (f.valor_faturado || 0) - (f.valor_pago || 0);
        if (saldo <= 0) return false;

        const venc = new Date(`${f.data_vencimento}T12:00:00Z`);
        const diffMs = hojeDate.getTime() - venc.getTime();
        const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (agingFaixaFiltro === "A_VENCER") return diasAtraso <= 0;
        if (agingFaixaFiltro === "ATRASO_1_15") return diasAtraso >= 1 && diasAtraso <= 15;
        if (agingFaixaFiltro === "ATRASO_16_30") return diasAtraso >= 16 && diasAtraso <= 30;
        if (agingFaixaFiltro === "ATRASO_MAIOR_30") return diasAtraso > 30;
        return true;
      });
    }

    if (searchFatura.trim()) {
      const term = searchFatura.toLowerCase().trim();
      list = list.filter((f) => {
        const clienteNome = (f.cliente?.nome_fantasia || "").toLowerCase();
        const idStr = (f.id || "").toLowerCase();
        const obs = (f.observacoes || "").toLowerCase();
        const empresaNome = (f.empresa?.nome_fantasia || "").toLowerCase();
        const osStr = (f.numero_os || "").toLowerCase();
        return (
          clienteNome.includes(term) ||
          idStr.includes(term) ||
          obs.includes(term) ||
          empresaNome.includes(term) ||
          osStr.includes(term)
        );
      });
    }

    return list;
  }, [faturas, agingFaixaFiltro, searchFatura]);

  const {
    sortedData: faturasOrdenadas,
    sortKey: sortKeyFaturas,
    sortDirection: sortDirFaturas,
    handleSort: handleSortFaturas,
  } = useTableSort(faturasExibidas, {
    defaultKey: "data_vencimento",
    defaultDirection: "asc",
    customExtractors: {
      cliente: (f) => f.cliente?.nome_fantasia || "",
      empresa: (f) => f.empresa?.nome_fantasia || "",
      data_vencimento: (f) => f.data_vencimento || "",
      valor_faturado: (f) => Number(f.valor_faturado || 0),
      valor_pago: (f) => Number(f.valor_pago || 0),
      data_pagamento: (f) => {
        if (!f.recebimentos || f.recebimentos.length === 0) return "";
        const sorted = [...f.recebimentos].sort((a, b) => (b.data_recebimento || "").localeCompare(a.data_recebimento || ""));
        return sorted[0]?.data_recebimento || "";
      },
      status: (f) => f.status || "",
    },
  });

  const kpis = useMemo(() => {
    let totalFaturado = 0;
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalVencido = 0;
    const hojeStr = toLocalDateString();

    for (const f of faturas) {
      if (f.status !== STATUS_FATURA.CANCELADA) {
        totalFaturado += f.valor_faturado || 0;
        totalRecebido += f.valor_pago || 0;
        const saldo = (f.valor_faturado || 0) - (f.valor_pago || 0);
        if (saldo > 0) {
          totalPendente += saldo;
          if (f.data_vencimento < hojeStr) {
            totalVencido += saldo;
          }
        }
      }
    }

    return { totalFaturado, totalRecebido, totalPendente, totalVencido };
  }, [faturas]);

  const handleDeleteFatura = (fatura: FaturaCliente) => {
    openConfirmationDialog({
      title: "Excluir Fatura",
      description: `Tem certeza que deseja excluir a fatura #${fatura.id.substring(0, 8)} de ${fatura.cliente?.nome_fantasia || "Cliente"}?`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(fatura.id);
          await refetchFaturas();
          toast.success("Fatura excluída com sucesso!");
        } catch {
          toast.error("Erro ao excluir fatura.");
        }
      },
    });
  };

  const handleOpenNovaFatura = () => {
    openFaturaFormDialog({
      onSuccess: async () => {
        await refetchFaturas();
      },
    });
  };

  const handleEditFatura = (fatura: FaturaCliente) => {
    openFaturaFormDialog({
      faturaToEdit: fatura,
      onSuccess: async () => {
        await refetchFaturas();
      },
    });
  };

  const handleLiquidarFatura = (fatura: FaturaCliente) => {
    openLiquidarFaturaDialog({
      fatura,
      onSuccess: async () => {
        await refetchFaturas();
      },
    });
  };

  return {
    canEdit,
    mes,
    ano,
    setMes,
    setAno,
    periodoFiltro,
    setPeriodoFiltro,
    statusFiltro,
    setStatusFiltro,
    empresaFaturaFiltro,
    setEmpresaFaturaFiltro,
    searchFatura,
    setSearchFatura,
    agingFaixaFiltro,
    setAgingFaixaFiltro,
    empresasList,
    aging,
    kpis,
    faturasExibidas,
    faturasOrdenadas,
    sortKeyFaturas,
    sortDirFaturas,
    handleSortFaturas,
    isLoadingFaturas,
    isFetchingFaturas,
    handleDeleteFatura,
    handleOpenNovaFatura,
    handleEditFatura,
    handleLiquidarFatura,
  };
}
