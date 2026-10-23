import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  CheckCircle2,
  Edit2,
  Power,
  Trash2,
} from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import {
  useConvenios,
  useDeleteConvenio,
  useUpdateConvenio,
} from "@/hooks/api/useConvenios";
import { useResumoGeralConvenios } from "@/hooks/api/useConvenioAuditoria";
import { useTodosBloqueiosConvenios } from "@/hooks/api/useBloqueiosConvenios";
import { useSearchFilters, useStatusFilters } from "@/hooks/ui/useFilters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { Convenio, ConvenioResumoItem } from "@/types/database";
import { FilterOptions, StatusUsuario } from "@/types/enums";
import { ActionItem } from "@/types/actions";

export function useConveniosViewModel() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openConvenioFormDialog,
    openLiquidarFaturaConvenioDialog,
  } = useLayout();

  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.CONVENIOS.EDITAR);

  const { searchTerm, setSearchTerm } = useSearchFilters("search");
  const { selectedStatus, setSelectedStatus } = useStatusFilters(
    "status",
    true,
    StatusUsuario.ATIVO
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileStatus, setMobileStatus] = useState(selectedStatus || StatusUsuario.ATIVO);

  useEffect(() => {
    if (isDrawerOpen) {
      setMobileStatus(selectedStatus || StatusUsuario.ATIVO);
    }
  }, [isDrawerOpen, selectedStatus]);

  const [mes, setMes] = useState<number>(() => new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(() => new Date().getFullYear());
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const {
    data: convenios = [],
    isLoading,
    isFetching,
    refetch,
  } = useConvenios({
    ativo:
      selectedStatus === FilterOptions.TODOS
        ? undefined
        : selectedStatus === StatusUsuario.ATIVO
          ? "true"
          : "false",
  });

  const {
    data: resumoGeral,
    isLoading: isResumoLoading,
    isFetching: isResumoFetching,
    refetch: refetchResumo,
  } = useResumoGeralConvenios(mes, ano);

  const {
    data: todosBloqueios = [],
    refetch: refetchBloqueios,
  } = useTodosBloqueiosConvenios();

  const deleteConvenio = useDeleteConvenio();
  const updateConvenio = useUpdateConvenio();

  useEffect(() => {
    setPageTitle("Convênios & Despesas Operacionais");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await Promise.all([refetch(), refetchResumo(), refetchBloqueios()]);
  }, [refetch, refetchResumo, refetchBloqueios]);

  const totalColaboradoresBloqueados = useMemo(
    () =>
      new Set(
        todosBloqueios
          .filter((b) => b.colaborador && b.colaborador.status !== "INATIVO")
          .map((b) => b.colaborador_id)
      ).size,
    [todosBloqueios]
  );

  const resumoMap = useMemo(() => {
    const map = new Map<string, ConvenioResumoItem>();
    (resumoGeral?.convenios || []).forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [resumoGeral]);

  const filteredConvenios = useMemo(() => {
    return convenios.filter((c) => {
      const matchSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        selectedStatus === FilterOptions.TODOS
          ? true
          : selectedStatus === StatusUsuario.ATIVO
            ? c.ativo
            : !c.ativo;
      return matchSearch && matchStatus;
    });
  }, [convenios, searchTerm, selectedStatus]);

  const total = filteredConvenios.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const paginatedConvenios = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredConvenios.slice(start, start + pageSize);
  }, [filteredConvenios, page, pageSize]);

  const hasStatusFilter = selectedStatus && selectedStatus !== StatusUsuario.ATIVO;
  const hasAnyFilter = Boolean(hasStatusFilter || searchTerm);
  const activeFiltersCount = hasStatusFilter ? 1 : 0;

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStatus(StatusUsuario.ATIVO);
    setMobileStatus(StatusUsuario.ATIVO);
    setPage(1);
    safeCloseDialog(() => setIsDrawerOpen(false));
  }, [setSearchTerm, setSelectedStatus]);

  const handleApplyMobile = useCallback(() => {
    setSelectedStatus(mobileStatus);
    setPage(1);
    safeCloseDialog(() => setIsDrawerOpen(false));
  }, [mobileStatus, setSelectedStatus]);

  const handleRegister = () => {
    openConvenioFormDialog({});
  };

  const handleEdit = (convenio: Convenio) => {
    openConvenioFormDialog({ convenioToEdit: convenio });
  };

  const handleToggleStatus = (convenio: Convenio) => {
    const nextStatus = !convenio.ativo;
    openConfirmationDialog({
      title: `${nextStatus ? "Ativar" : "Desativar"} Convênio`,
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

  const handleDelete = (convenio: Convenio) => {
    openConfirmationDialog({
      title: "Excluir Convênio",
      description: `Tem certeza que deseja excluir o convênio "${convenio.nome}"? Todos os lançamentos vinculados a ele serão excluídos permanentemente. Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteConvenio.mutateAsync(convenio.id);
          toast.success("Convênio excluído com sucesso!");
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          const err = error as Error;
          toast.error("Erro ao excluir convênio", {
            description: err.message,
          });
        }
      },
    });
  };

  const handleCopyLink = (convenio: Convenio) => {
    const publicUrl = `${window.location.origin}/public/co/${convenio.token}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link do convênio copiado!");
  };

  const handleOpenLink = (convenio: Convenio) => {
    window.open(`/public/co/${convenio.token}`, "_blank", "noopener,noreferrer");
  };

  const handleLiquidarFatura = useCallback(
    (convenio: Convenio, resumoItem?: ConvenioResumoItem) => {
      const fatura = resumoItem?.fatura_fornecedor;
      const mesVenc = mes === 12 ? 1 : mes + 1;
      const anoVenc = mes === 12 ? ano + 1 : ano;
      const dataVencDefault = `${anoVenc}-${String(mesVenc).padStart(2, "0")}-15`;

      openLiquidarFaturaConvenioDialog({
        convenioId: convenio.id,
        convenioNome: convenio.nome,
        faturaId: fatura?.is_previsao ? null : (fatura?.id || null),
        mesCompetencia: mes,
        anoCompetencia: ano,
        dataVencimento: fatura?.data_vencimento || dataVencDefault,
        valorTotalFatura: fatura?.valor_total_fatura || resumoItem?.total_consumido || 0,
        valorJaPago: fatura?.valor_pago || 0,
        empresaPadraoId: fatura?.empresa_id || convenio.empresa_id || null,
        contaBancariaPadraoId: fatura?.conta_bancaria_id || convenio.conta_bancaria_id || null,
        onSuccess: () => refetchResumo(),
      });
    },
    [mes, ano, openLiquidarFaturaConvenioDialog, refetchResumo]
  );

  const getConvenioActions = useCallback(
    (convenio: Convenio): ActionItem[] => {
      const actions: ActionItem[] = [
        {
          label: "Copiar Link Público",
          icon: <Copy className="h-4 w-4" />,
          onClick: () => handleCopyLink(convenio),
        },
        {
          label: "Abrir Link Público",
          icon: <ExternalLink className="h-4 w-4" />,
          onClick: () => handleOpenLink(convenio),
        },
      ];

      const resumoItem = resumoMap.get(convenio.id);
      const fatura = resumoItem?.fatura_fornecedor;

      if (canEdit && fatura && fatura.status !== "PAGA") {
        actions.push({
          label: "Quitar Fatura",
          icon: <CheckCircle2 className="h-4 w-4" />,
          onClick: () => handleLiquidarFatura(convenio, resumoItem),
        });
      }

      if (canEdit) {
        actions.push(
          {
            label: "Editar",
            icon: <Edit2 className="h-4 w-4" />,
            onClick: () => handleEdit(convenio),
          },
          {
            label: convenio.ativo ? "Desativar" : "Ativar",
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleStatus(convenio),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDelete(convenio),
            isDestructive: true,
          }
        );
      }

      return actions;
    },
    [canEdit, resumoMap, handleLiquidarFatura]
  );

  return {
    canEdit,
    mes,
    setMes,
    ano,
    setAno,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    isDrawerOpen,
    setIsDrawerOpen,
    mobileStatus,
    setMobileStatus,
    convenios,
    filteredConvenios,
    paginatedConvenios,
    resumoGeral,
    resumoMap,
    totais: resumoGeral?.totais,
    totalColaboradoresBloqueados,
    isLoading,
    isFetching,
    isResumoLoading,
    isResumoFetching,
    isInitialLoading: isLoading && !convenios.length,
    isInitialResumoLoading: isResumoLoading && !resumoGeral,
    isActionLoading: deleteConvenio.isPending || updateConvenio.isPending,
    hasAnyFilter,
    activeFiltersCount,
    pullToRefreshReload,
    handleRegister,
    handleEdit,
    handleToggleStatus,
    handleDelete,
    handleCopyLink,
    handleOpenLink,
    handleLiquidarFatura,
    getConvenioActions,
    handleClearFilters,
    handleApplyMobile,
  };
}

export type ConveniosViewModel = ReturnType<typeof useConveniosViewModel>;
