import { useState, useMemo } from "react";
import { useContasPagar } from "@/hooks/api/useContasPagar";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ContaPagarItem, CategoriaDespesa, StatusDespesa, ContasPagarKpis } from "@/types/database";
import {
  CATEGORIA_COLABORADOR_CONTA_PAGAR,
  TIPO_CONTA_PAGAR,
} from "@/constants/financeiro.constants";
import {
  calcularKpisContasPagar,
  filtrarContasPagarPorStatusEPrazo,
} from "@/hooks/business/contasPagarHelper";
import { useCategoriasFinanceirasLabelMap } from "@/hooks/business/useCategoriasFinanceirasBusiness";
import { toast } from "sonner";

export function useContasPagarViewModel() {
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [ano, setAno] = useState<number>(currentDate.getFullYear());
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState<string>("");
  const [tipoFiltro, setTipoFiltro] = useState<"TODOS" | "DESPESA" | "CONVENIO" | "COLABORADOR">("TODOS");
  const [filtroPrazo, setFiltroPrazo] = useState<string | null>(null);

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresas();
  const { deleteMutation: deleteDespesaMutation } = useDespesas();
  const { getCategoriaLabel } = useCategoriasFinanceirasLabelMap();

  const {
    itens = [],
    kpis: kpisBackend,
    isLoading: isLoadingContas,
    isFetching,
    refetch,
    liquidarMutation,
    desfazerLiquidacaoMutation,
  } = useContasPagar({
    mes,
    ano,
    empresa_id: empresaId || undefined,
  });

  const {
    openDespesaFormDialog,
    openDespesaDeleteDialog,
    openLiquidarDespesaDialog,
    openLiquidarFaturaConvenioDialog,
    openConfirmarAdiantamentoDialog,
    openConfirmarPagamentoSalarioDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const itensBasePorTipoEBusca = useMemo(() => {
    let list = itens;
    if (tipoFiltro !== "TODOS") {
      list = list.filter((i) => i.tipo === tipoFiltro);
    }
    const termo = busca.trim().toLowerCase();
    if (termo) {
      list = list.filter(
        (i) =>
          i.descricao.toLowerCase().includes(termo) ||
          i.categoria.toLowerCase().includes(termo) ||
          getCategoriaLabel(i.categoria).toLowerCase().includes(termo) ||
          (i.empresa_nome && i.empresa_nome.toLowerCase().includes(termo)) ||
          (i.colaborador_nome && i.colaborador_nome.toLowerCase().includes(termo))
      );
    }
    return list;
  }, [itens, tipoFiltro, busca, getCategoriaLabel]);

  const kpis = useMemo<ContasPagarKpis | undefined>(
    () => calcularKpisContasPagar(itensBasePorTipoEBusca, Boolean(kpisBackend)),
    [kpisBackend, itensBasePorTipoEBusca]
  );

  const itensFiltrados = useMemo(
    () => filtrarContasPagarPorStatusEPrazo(itensBasePorTipoEBusca, status, filtroPrazo),
    [itensBasePorTipoEBusca, status, filtroPrazo]
  );

  const handleLiquidarItem = (item: ContaPagarItem) => {
    if (item.tipo === TIPO_CONTA_PAGAR.COLABORADOR) {
      const refLabel =
        item.mes_competencia && item.ano_competencia
          ? `${String(item.mes_competencia).padStart(2, "0")}/${item.ano_competencia}`
          : undefined;

      if (item.categoria === CATEGORIA_COLABORADOR_CONTA_PAGAR.ADIANTAMENTO_SALARIAL) {
        openConfirmarAdiantamentoDialog({
          valorSugerido: item.valor_previsto,
          colaboradorNome: item.colaborador_nome || item.descricao,
          referenciaLabel: refLabel,
          contaBancariaInicialId: item.conta_bancaria_id,
          isLoading: liquidarMutation.isPending,
          onConfirm: async ({ valor, contaBancariaId, dataPagamento }) => {
            await liquidarMutation.mutateAsync({
              id: item.id,
              tipo: "COLABORADOR",
              payload: {
                valor_pago: valor,
                conta_bancaria_id: contaBancariaId,
                data_pagamento: dataPagamento,
              },
            });
            toast.success("Adiantamento liquidado com sucesso!");
            refetch();
          },
        });
      } else {
        openConfirmarPagamentoSalarioDialog({
          valorLiquido: item.valor_previsto,
          colaboradorNome: item.colaborador_nome || item.descricao,
          referenciaLabel: refLabel,
          contaBancariaInicialId: item.conta_bancaria_id,
          isLoading: liquidarMutation.isPending,
          onConfirm: async ({ contaBancariaId, dataPagamento }) => {
            await liquidarMutation.mutateAsync({
              id: item.id,
              tipo: "COLABORADOR",
              payload: {
                valor_pago: item.valor_previsto,
                conta_bancaria_id: contaBancariaId,
                data_pagamento: dataPagamento,
              },
            });
            toast.success("Salário liquidado com sucesso!");
            refetch();
          },
        });
      }
      return;
    }

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
    if (item.tipo === TIPO_CONTA_PAGAR.COLABORADOR) {
      const refLabel =
        item.mes_competencia && item.ano_competencia
          ? `${String(item.mes_competencia).padStart(2, "0")}/${item.ano_competencia}`
          : undefined;

      if (item.categoria === CATEGORIA_COLABORADOR_CONTA_PAGAR.ADIANTAMENTO_SALARIAL) {
        openConfirmarAdiantamentoDialog({
          isEditMode: true,
          valorSugerido: item.valor_pago || item.valor_previsto,
          colaboradorNome: item.colaborador_nome || item.descricao,
          referenciaLabel: refLabel,
          contaBancariaInicialId: item.conta_bancaria_id,
          dataPagamentoInicial: item.data_pagamento,
          isLoading: liquidarMutation.isPending,
          onConfirm: async ({ valor, contaBancariaId, dataPagamento }) => {
            await liquidarMutation.mutateAsync({
              id: item.id,
              tipo: TIPO_CONTA_PAGAR.COLABORADOR,
              payload: {
                valor_pago: valor,
                conta_bancaria_id: contaBancariaId,
                data_pagamento: dataPagamento,
              },
            });
            toast.success("Pagamento de adiantamento atualizado com sucesso!");
            refetch();
          },
        });
      } else {
        openConfirmarPagamentoSalarioDialog({
          isEditMode: true,
          valorLiquido: item.valor_pago || item.valor_previsto,
          colaboradorNome: item.colaborador_nome || item.descricao,
          referenciaLabel: refLabel,
          contaBancariaInicialId: item.conta_bancaria_id,
          dataPagamentoInicial: item.data_pagamento,
          isLoading: liquidarMutation.isPending,
          onConfirm: async ({ contaBancariaId, dataPagamento }) => {
            await liquidarMutation.mutateAsync({
              id: item.id,
              tipo: TIPO_CONTA_PAGAR.COLABORADOR,
              payload: {
                valor_pago: item.valor_pago || item.valor_previsto,
                conta_bancaria_id: contaBancariaId,
                data_pagamento: dataPagamento,
              },
            });
            toast.success("Pagamento de salário atualizado com sucesso!");
            refetch();
          },
        });
      }
      return;
    }

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

  const handleDesfazerLiquidacaoItem = (item: ContaPagarItem) => {
    openConfirmationDialog({
      title: "Desfazer Pagamento",
      description: `Deseja realmente desfazer o pagamento de "${item.descricao}"? O lançamento retornará ao status Pendente e deixará de compor o saldo realizado da conta bancária.`,
      confirmText: "Desfazer Pagamento",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await desfazerLiquidacaoMutation.mutateAsync({
            id: item.id,
            tipo: item.tipo,
          });
          safeCloseDialog(closeConfirmationDialog);
          toast.success("Pagamento desfeito com sucesso!");
          refetch();
        } catch {
          toast.error("Erro ao desfazer o pagamento.");
        }
      },
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
    handleDesfazerLiquidacaoItem,
    handleEditItem,
    handleDeleteItem,
    handleNovaDespesa,
  };
}
