import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import {
  useConvenio,
  useConvenioLancamentos,
  useDeleteAdminLancamento,
  useUpdateConvenio,
} from "@/hooks/api/useConvenios";
import { useConvenioAuditoria } from "@/hooks/api/useConvenioAuditoria";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { LancamentoConvenio } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";

export interface GroupedLancamento {
  name: string;
  isFrota: boolean;
  total: number;
  items: LancamentoConvenio[];
}

export function useConvenioDetailsViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    setPageTitle,
    openConvenioFormDialog,
    openLancamentoConvenioDialog,
    openLiquidarFaturaConvenioDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.CONVENIOS.EDITAR);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"colaboradores" | "todos" | "auditoria">("todos");
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const deleteLancamento = useDeleteAdminLancamento();
  const updateConvenio = useUpdateConvenio();

  const mes = currentDate.getMonth() + 1;
  const ano = currentDate.getFullYear();

  const { data: convenio, isLoading: isConvenioLoading } = useConvenio(id || "");
  const { data: lancamentos = [], isLoading: isLancamentosLoading } =
    useConvenioLancamentos(id || "", ano, mes);
  const {
    data: auditoria,
    isLoading: isAuditoriaLoading,
    refetch: refetchAuditoria,
  } = useConvenioAuditoria(id || "", mes, ano);

  useEffect(() => {
    if (convenio) {
      setPageTitle("Convênio");
    } else if (!isConvenioLoading) {
      setPageTitle("Convênio não encontrado");
    }
  }, [convenio, isConvenioLoading, setPageTitle]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleToggleStatus = () => {
    if (!convenio) return;
    const nextStatus = !convenio.ativo;
    openConfirmationDialog({
      title: nextStatus ? "Ativar Convênio" : "Desativar Convênio",
      description: `Tem certeza que deseja ${nextStatus ? "ativar" : "desativar"} o convênio "${convenio.nome}"?`,
      confirmText: nextStatus ? "Ativar" : "Desativar",
      variant: nextStatus ? "default" : "destructive",
      onConfirm: async () => {
        try {
          await updateConvenio.mutateAsync({
            id: convenio.id,
            ativo: nextStatus,
          });
          toast.success(`Convênio ${nextStatus ? "ativado" : "desativado"} com sucesso!`);
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          const err = error as Error;
          toast.error("Erro ao alterar status do convênio", {
            description: err.message,
          });
        }
      },
    });
  };

  const handleDeleteLancamento = (lancamento: LancamentoConvenio) => {
    openConfirmationDialog({
      title: "Excluir Lançamento",
      description: `Deseja realmente excluir o lançamento de ${formatCurrency(Number(lancamento.valor))}? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteLancamento.mutateAsync({ convenioId: id || "", id: lancamento.id });
          toast.success("Lançamento excluído com sucesso!");
        } catch {
          toast.error("Erro ao excluir lançamento");
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  };

  const handleCopyLink = () => {
    if (!convenio?.token) return;
    navigator.clipboard.writeText(`${window.location.origin}/public/co/${convenio.token}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenLink = () => {
    if (!convenio?.token) return;
    window.open(`${window.location.origin}/public/co/${convenio.token}`, "_blank", "noopener,noreferrer");
  };

  const handleOpenNovoLancamento = () => {
    if (!id) return;
    openLancamentoConvenioDialog({ convenioId: id, lancamentoToEdit: null });
  };

  const handleEditarLancamento = (lancamento: LancamentoConvenio) => {
    if (!id) return;
    openLancamentoConvenioDialog({ convenioId: id, lancamentoToEdit: lancamento });
  };

  const handleEditarConvenio = () => {
    if (!convenio) return;
    openConvenioFormDialog({ convenioToEdit: convenio });
  };

  const handleLiquidarFaturaAuditoria = useCallback(() => {
    if (!id) return;
    const mesVenc = mes === 12 ? 1 : mes + 1;
    const anoVenc = mes === 12 ? ano + 1 : ano;
    const dataVencDefault = `${anoVenc}-${String(mesVenc).padStart(2, "0")}-15`;
    const fatura = auditoria?.fatura_fornecedor;

    openLiquidarFaturaConvenioDialog({
      convenioId: id,
      convenioNome: convenio?.nome || "Convênio",
      faturaId: fatura?.is_previsao ? null : (fatura?.id || null),
      mesCompetencia: mes,
      anoCompetencia: ano,
      dataVencimento: fatura?.data_vencimento || dataVencDefault,
      valorTotalFatura: fatura?.valor_total_fatura || auditoria?.total_geral_lancamentos || 0,
      valorJaPago: fatura?.valor_pago || 0,
      empresaPadraoId: fatura?.empresa_id || convenio?.empresa_id || null,
      contaBancariaPadraoId: fatura?.conta_bancaria_id || convenio?.conta_bancaria_id || null,
      onSuccess: () => refetchAuditoria(),
    });
  }, [id, mes, ano, auditoria, convenio, openLiquidarFaturaConvenioDialog, refetchAuditoria]);

  const sortedLancamentos = useMemo(() => {
    return [...lancamentos].sort((a, b) => {
      return new Date(b.data_lancamento).getTime() - new Date(a.data_lancamento).getTime();
    });
  }, [lancamentos]);

  const filteredLancamentos = useMemo(() => {
    if (!searchQuery.trim()) return sortedLancamentos;
    const query = searchQuery.toLowerCase();
    return sortedLancamentos.filter((l) => {
      const collabName = l.colaborador?.nome_completo?.toLowerCase() || "";
      const isFrota = l.moto_embu ? "veículo embu express" : "";
      const desc = l.descricao?.toLowerCase() || "";
      return collabName.includes(query) || isFrota.includes(query) || desc.includes(query);
    });
  }, [sortedLancamentos, searchQuery]);

  const groupedLancamentos = useMemo((): GroupedLancamento[] => {
    const groups: Record<string, GroupedLancamento> = {};
    const DAVID_CAITITE_ID = "e7c2c19c-3b36-402a-9e73-9a3c3c3c3c3c";

    filteredLancamentos.forEach((l) => {
      const isMotoEmbuOuEmpresa =
        l.moto_embu ||
        !l.colaborador_id ||
        l.colaborador_id === DAVID_CAITITE_ID ||
        Boolean(l.colaborador?.nome_completo && l.colaborador.nome_completo.toUpperCase().includes("DAVID CAITIT"));

      if (isMotoEmbuOuEmpresa) {
        const key = "moto_embu";
        if (!groups[key]) {
          groups[key] = {
            name: "Moto Embu",
            isFrota: true,
            total: 0,
            items: [],
          };
        }
        groups[key].items.push(l);
        groups[key].total += Number(l.valor);
      } else {
        const key = l.colaborador_id;
        const name = l.colaborador?.nome_completo || "Colaborador";
        if (!groups[key]) {
          groups[key] = {
            name,
            isFrota: false,
            total: 0,
            items: [],
          };
        }
        groups[key].items.push(l);
        groups[key].total += Number(l.valor);
      }
    });

    return Object.values(groups).sort((a, b) => {
      if (a.isFrota) return -1;
      if (b.isFrota) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredLancamentos]);

  const stats = useMemo(() => {
    const totalValue = lancamentos.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalCount = lancamentos.length;
    const uniqueMotoboys = new Set(
      lancamentos
        .filter((l) => l.colaborador_id)
        .map((l) => l.colaborador_id)
    ).size;

    return { totalValue, totalCount, uniqueMotoboys };
  }, [lancamentos]);

  return {
    id,
    convenio,
    isConvenioLoading,
    lancamentos,
    isLancamentosLoading,
    auditoria,
    isAuditoriaLoading,
    canEdit,
    currentDate,
    mes,
    ano,
    activeTab,
    setActiveTab,
    isCopied,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroup,
    sortedLancamentos,
    filteredLancamentos,
    groupedLancamentos,
    stats,
    handlePrevMonth,
    handleNextMonth,
    handleToggleStatus,
    handleDeleteLancamento,
    handleCopyLink,
    handleOpenLink,
    handleOpenNovoLancamento,
    handleEditarLancamento,
    handleEditarConvenio,
    handleLiquidarFaturaAuditoria,
    navigate,
  };
}

export type ConvenioDetailsViewModel = ReturnType<typeof useConvenioDetailsViewModel>;
