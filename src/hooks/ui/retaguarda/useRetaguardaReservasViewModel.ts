import { useState, useMemo, useEffect } from "react";
import { useLayout, useDateFilters } from "@/hooks";
import { useRetaguarda } from "@/hooks/api/useRetaguarda";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";

export type FiltroVales = "todos" | "pendentes" | "tratados";

export function useRetaguardaReservasViewModel() {
  const { setPageTitle, openAlocacaoTemporariaDialog } = useLayout();
  const { can, isAnyAdmin } = usePermissions();
  const canAlocar = isAnyAdmin || can(PERMISSIONS.RETAGUARDA.ALOCAR);

  useEffect(() => {
    setPageTitle("Retaguarda Operacional & Risco de Folha");
  }, [setPageTitle]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const {
    selectedMes: mes,
    setSelectedMes: setMes,
    selectedAno: ano,
    setSelectedAno: setAno,
  } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const [activeTab, setActiveTab] = useState<string>("monitor");
  const [filtroVales, setFiltroVales] = useState<FiltroVales>("todos");

  const { monitor, isLoadingMonitor, alertas, isLoadingAlertas, refetch } = useRetaguarda(mes, ano);

  const totais = useMemo(() => {
    const rawTotais = monitor?.totais || {
      total_reservas: 0,
      total_fiscais: 0,
      custo_total_retaguarda: 0,
      prejuizo_total_ociosidade: 0,
    };

    const taxaEficiencia =
      rawTotais.custo_total_retaguarda > 0
        ? Math.max(
            0,
            Math.round(
              ((rawTotais.custo_total_retaguarda - rawTotais.prejuizo_total_ociosidade) /
                rawTotais.custo_total_retaguarda) *
                100,
            ),
          )
        : 0;

    return {
      ...rawTotais,
      taxaEficiencia,
    };
  }, [monitor?.totais]);

  const itens = monitor?.itens || [];

  const pendentesEmRisco = useMemo(() => {
    return alertas.filter(
      (a) => !a.adiantamento_confirmado && (a.nivel_risco === "RISCO_ALTO" || a.nivel_risco === "RISCO_MEDIO"),
    );
  }, [alertas]);

  const totalConfirmados = useMemo(() => {
    return alertas.filter((a) => a.adiantamento_confirmado).length;
  }, [alertas]);

  const alertasFiltrados = useMemo(() => {
    return alertas.filter((a) => {
      if (filtroVales === "pendentes") return !a.adiantamento_confirmado;
      if (filtroVales === "tratados") return a.adiantamento_confirmado;
      return true;
    });
  }, [alertas, filtroVales]);

  const handleRegistrarCobertura = () => {
    openAlocacaoTemporariaDialog({ onSuccess: () => refetch() });
  };

  return {
    mes,
    setMes,
    ano,
    setAno,
    anoAtual,
    canAlocar,
    activeTab,
    setActiveTab,
    filtroVales,
    setFiltroVales,
    totais,
    itens,
    alertas,
    alertasFiltrados,
    pendentesEmRisco,
    totalConfirmados,
    isLoadingMonitor,
    isLoadingAlertas,
    handleRegistrarCobertura,
    refetch,
  };
}
