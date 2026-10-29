import { useState, useMemo } from "react";
import { useContasPagar } from "@/hooks/api/useContasPagar";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useLayout } from "@/contexts/LayoutContext";
import { ContaPagarItem, CategoriaDespesa, StatusDespesa } from "@/types/database";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";

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
    if (item.tipo === "CONVENIO") {
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
          is_holding: false,
          mes_competencia: mes,
          ano_competencia: ano,
          empresa_id: item.empresa_id,
          conta_bancaria_id: item.conta_bancaria_id,
        },
        onSuccess: () => refetch(),
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
    handleNovaDespesa,
  };
}
