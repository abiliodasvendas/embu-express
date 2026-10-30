import { useState, useMemo } from "react";
import { useContasPagar } from "@/hooks/api/useContasPagar";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useLayout } from "@/contexts/LayoutContext";
import { ContaPagarItem, CategoriaDespesa, StatusDespesa } from "@/types/database";
import { STATUS_DESPESA, TIPO_CONTA_PAGAR } from "@/constants/financeiro.constants";
import { toast } from "sonner";

export function useContasPagarViewModel() {
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [ano, setAno] = useState<number>(currentDate.getFullYear());
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState<string>("");
  const [tipoFiltro, setTipoFiltro] = useState<"TODOS" | "DESPESA" | "CONVENIO">("TODOS");
  const [filtroPrazo, setFiltroPrazo] = useState<string | null>(null);

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresas();
  const { deleteMutation: deleteDespesaMutation } = useDespesas();

  const {
    itens = [],
    kpis,
    isLoading: isLoadingContas,
    isFetching,
    refetch,
  } = useContasPagar({
    mes,
    ano,
    empresa_id: empresaId || undefined,
    status: status !== "TODOS" ? status : undefined,
    busca: busca.trim() || undefined,
  });

  const {
    openDespesaFormDialog,
    openDespesaDeleteDialog,
    openLiquidarDespesaDialog,
    openLiquidarFaturaConvenioDialog,
  } = useLayout();

  const itensFiltrados = useMemo(() => {
    let list = itens;
    if (tipoFiltro !== "TODOS") {
      list = list.filter((i) => i.tipo === tipoFiltro);
    }
    if (filtroPrazo) {
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split("T")[0];

      const dTemp = new Date(hoje);
      const dayOfWeek = dTemp.getDay();
      const diffToMonday = dTemp.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(dTemp.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mondayStr = monday.toISOString().split("T")[0];
      const sundayStr = sunday.toISOString().split("T")[0];

      if (filtroPrazo === "HOJE") {
        list = list.filter((i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento === hojeStr);
      } else if (filtroPrazo === "SEMANA") {
        list = list.filter((i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento >= mondayStr && i.data_vencimento <= sundayStr);
      } else if (filtroPrazo === "ATRASADAS") {
        list = list.filter((i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento < hojeStr);
      } else if (filtroPrazo === "PROXIMAS") {
        list = list.filter((i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento > sundayStr);
      }
    }
    return list;
  }, [itens, tipoFiltro, filtroPrazo]);

  const handleLiquidarItem = (item: ContaPagarItem) => {
    if (item.tipo === TIPO_CONTA_PAGAR.CONVENIO) {
      openLiquidarFaturaConvenioDialog({
        convenioId: item.id,
        convenioNome: item.descricao,
        faturaId: item.id,
        mesCompetencia: mes,
        anoCompetencia: ano,
        valorTotalFatura: item.valor_previsto,
        valorJaPago: item.valor_pago,
        dataVencimento: item.data_vencimento,
        empresaPadraoId: item.empresa_id || undefined,
        contaBancariaPadraoId: item.conta_bancaria_id || undefined,
        onSuccess: () => refetch(),
      });
    } else {
      openLiquidarDespesaDialog({
        despesa: {
          id: item.id,
          descricao: item.descricao,
          categoria: item.categoria as CategoriaDespesa,
          valor_previsto: item.valor_previsto,
          valor_pago: item.valor_pago,
          data_vencimento: item.data_vencimento,
          status: item.status as StatusDespesa,
          is_holding: !item.empresa_id,
          mes_competencia: mes,
          ano_competencia: ano,
          empresa_id: item.empresa_id,
          conta_bancaria_id: item.conta_bancaria_id,
          empresa: item.empresa_id ? {
            id: item.empresa_id,
            nome_fantasia: item.empresa_nome || "",
            razao_social: item.empresa_nome || "",
            cnpj: "",
            ativo: true,
          } : undefined,
        },
        onSuccess: () => refetch(),
      });
    }
  };

  const handleEditItem = (item: ContaPagarItem) => {
    if (item.tipo === TIPO_CONTA_PAGAR.DESPESA) {
      openDespesaFormDialog({
        despesaToEdit: {
          id: item.id,
          descricao: item.descricao,
          categoria: item.categoria as CategoriaDespesa,
          valor_previsto: item.valor_previsto,
          valor_pago: item.valor_pago,
          data_vencimento: item.data_vencimento,
          data_pagamento: item.data_pagamento,
          status: item.status as StatusDespesa,
          is_holding: !item.empresa_id,
          mes_competencia: mes,
          ano_competencia: ano,
          empresa_id: item.empresa_id,
          conta_bancaria_id: item.conta_bancaria_id,
          grupo_parcelamento_id: item.grupo_parcelamento_id,
          numero_parcela: item.numero_parcela,
          total_parcelas: item.total_parcelas,
          is_recorrente: item.is_recorrente,
        },
        onSuccess: () => refetch(),
      });
    }
  };

  const handleDeleteItem = (item: ContaPagarItem) => {
    if (item.tipo === TIPO_CONTA_PAGAR.DESPESA) {
      openDespesaDeleteDialog({
        despesa: {
          id: item.id,
          descricao: item.descricao,
          valor_previsto: item.valor_previsto,
          grupo_parcelamento_id: item.grupo_parcelamento_id,
          numero_parcela: item.numero_parcela,
          total_parcelas: item.total_parcelas,
          is_recorrente: item.is_recorrente,
        },
        onConfirm: async (escopo) => {
          await deleteDespesaMutation.mutateAsync({ id: item.id, escopo });
          toast.success("Despesa excluída com sucesso!");
          refetch();
        },
      });
    }
  };

  const handleNovaDespesa = () => {
    openDespesaFormDialog({
      onSuccess: () => refetch(),
    });
  };

  return {
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    status,
    setStatus,
    busca,
    setBusca,
    tipoFiltro,
    setTipoFiltro,
    filtroPrazo,
    setFiltroPrazo,
    empresas,
    itens: itensFiltrados,
    kpis,
    isLoading: isLoadingContas || isLoadingEmpresas,
    isFetching,
    refetch,
    handleLiquidarItem,
    handleEditItem,
    handleDeleteItem,
    handleNovaDespesa,
  };
}
