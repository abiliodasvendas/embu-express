import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  safeCloseDialog,
  useCollaborator,
  useDateFilters,
  useDeleteVinculo,
  useFiltersManager,
  useFinancialReportViewModel,
  useRoles,
  useTimeMirrorViewModel,
} from "@/hooks";
import {
  useDeleteCollaborator,
  useResetCollaboratorPassword,
  useUpdateCollaboratorStatus,
  useUpdateVinculo,
} from "@/hooks/api/useCollaboratorMutations";
import { useItensColaboradorQuery } from "@/hooks/api/useItensEquipamentos";
import { useBloqueiosColaborador } from "@/hooks/api/useBloqueiosConvenios";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { useLayout } from "@/contexts/LayoutContext";
import { ColaboradorCliente, Usuario } from "@/types/database";
import { STATUS } from "@/constants/roles";
import { messages } from "@/constants/messages";

export function useCollaboratorDetailsViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: collaborator, isLoading } = useCollaborator(id);
  const { data: itensAlocados = [] } = useItensColaboradorQuery(id || "");
  const { data: bloqueioData } = useBloqueiosColaborador(id);
  const { data: roles } = useRoles();

  const deleteVinculo = useDeleteVinculo();
  const updateVinculo = useUpdateVinculo();
  const updateStatus = useUpdateCollaboratorStatus();
  const deleteCollaborator = useDeleteCollaborator();
  const resetPassword = useResetCollaboratorPassword();

  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openCollaboratorFormDialog,
    openCollaboratorTurnDialog,
    openSuccessRegistrationDialog,
    openOccurrenceFormDialog,
    openEndTurnDialog,
    openGerenciarBloqueioConvenioDialog,
    setPageTitle,
  } = useLayout();

  useEffect(() => {
    setPageTitle("Colaborador");
  }, [setPageTitle]);

  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [modoComprovanteRenda, setModoComprovanteRenda] = useState(false);

  const handleAddTurn = useCallback(() => {
    if (!id) return;
    openCollaboratorTurnDialog({
      collaboratorId: id,
    });
  }, [id, openCollaboratorTurnDialog]);

  useEffect(() => {
    if (!hasAutoOpened && searchParams.get("openTurnDialog") === "true" && collaborator && !isLoading) {
      setHasAutoOpened(true);
      handleAddTurn();

      const newParams = new URLSearchParams(searchParams);
      newParams.delete("openTurnDialog");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, collaborator, isLoading, hasAutoOpened, setSearchParams, handleAddTurn]);

  const handleToggleStatus = async (collab: Usuario, newStatus: string) => {
    const confirmMessage =
      newStatus === STATUS.ATIVO
        ? messages.dialogo.ativar.descricao
        : "Tem certeza que deseja desligar este colaborador?";

    openConfirmationDialog({
      title: newStatus === STATUS.ATIVO ? "Ativar Colaborador" : "Desligar Colaborador",
      description: confirmMessage,
      confirmText: newStatus === STATUS.ATIVO ? "Confirmar" : "Desligar",
      variant: newStatus === STATUS.ATIVO ? "success" : "warning",
      onConfirm: async () => {
        try {
          await updateStatus.mutateAsync({ id: collab.id, status: newStatus });
          safeCloseDialog(closeConfirmationDialog);

          if (newStatus === STATUS.ATIVO) {
            setTimeout(() => {
              openSuccessRegistrationDialog({
                collaborator: collab,
                title: "Colaborador Ativo!",
                hideNewCollaboratorButton: true,
                hideTurnButton: collab.status !== STATUS.PENDENTE,
                description: `O cadastro do colaborador ${collab.nome_completo} foi ativado com sucesso.`,
              });
            }, 300);
          }
        } catch {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!collaborator) return;
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover "${collaborator.nome_completo}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteCollaborator.mutateAsync(collaborator.id);
          safeCloseDialog(closeConfirmationDialog);
          navigate("/colaboradores");
        } catch {
          // Erro tratado no handler global do hook
        }
      },
    });
  };

  const handleResetPassword = async () => {
    if (!collaborator) return;
    openConfirmationDialog({
      title: "Resetar Senha",
      description: "Tem certeza que deseja resetar a senha deste colaborador? Ela voltará a ser os 6 primeiros dígitos do CPF.",
      confirmText: "Resetar Senha",
      variant: "warning",
      onConfirm: async () => {
        try {
          await resetPassword.mutateAsync(collaborator.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const actions = useCollaboratorActions({
    collaborator: collaborator as Usuario,
    onEdit: () => {
      if (collaborator) {
        openCollaboratorFormDialog({ mode: "edit", editingCollaborator: collaborator as Usuario });
      }
    },
    onStatusChange: handleToggleStatus,
    onDelete: handleDelete,
    onResetPassword: handleResetPassword,
    hideDetails: true,
  });

  const editAction = actions.find((a) => a.label === "Editar");
  const resetAction = actions.find((a) => a.label === "Resetar Senha");
  const statusAction = actions.find((a) => ["Desligar", "Ativar", "Aprovar"].includes(a.label));
  const deleteAction = actions.find((a) => a.label === "Excluir");

  const { selectedMes, setSelectedMes, selectedAno, setSelectedAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
  });

  const { hasActiveFilters: hasDateFilters, clearFilters: clearDateFilters } = useFiltersManager(["mes", "ano"]);

  const filters = useMemo(() => ({
    selectedMes,
    setSelectedMes,
    selectedAno,
    setSelectedAno,
    hasActiveFilters: hasDateFilters,
    clearFilters: clearDateFilters,
  }), [selectedMes, setSelectedMes, selectedAno, setSelectedAno, hasDateFilters, clearDateFilters]);

  const pontoVm = useTimeMirrorViewModel({
    usuarioId: id,
    syncWithUrl: true,
  });

  const financeiroVm = useFinancialReportViewModel({
    usuarioId: id,
    syncWithUrl: true,
  });

  const activeLinks = useMemo(() => {
    return (collaborator?.links || []).filter((l) => !l.data_fim);
  }, [collaborator?.links]);

  const closedLinks = useMemo(() => {
    return (collaborator?.links || []).filter((l) => Boolean(l.data_fim));
  }, [collaborator?.links]);

  const role = useMemo(() => {
    return roles?.find((r) => r.id === Number(collaborator?.perfil_id));
  }, [roles, collaborator?.perfil_id]);

  const handleEditTurn = (turn: ColaboradorCliente) => {
    if (!id) return;
    openCollaboratorTurnDialog({
      collaboratorId: id,
      turnToEdit: turn,
    });
  };

  const handleDeleteTurn = async (turnId: number) => {
    if (!id) return;
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: messages.dialogo.remover.descricao,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteVinculo.mutateAsync({ id: turnId, colaboradorId: id });
          safeCloseDialog(closeConfirmationDialog);
        } catch {
          // Erro tratado no handler global do hook
        }
      },
    });
  };

  const handleEndTurn = (link: ColaboradorCliente) => {
    if (!id) return;
    openEndTurnDialog({
      turnId: link.id,
      collaboratorId: id,
      clientName: link.cliente?.nome_fantasia || "Cliente",
    });
  };

  const handleReactivateTurn = (link: ColaboradorCliente) => {
    if (!id) return;
    openConfirmationDialog({
      title: "Reativar Turno",
      description: "Deseja realmente reativar o turno? O colaborador voltará a poder registrar atividade.",
      confirmText: "Reativar",
      variant: "success",
      onConfirm: async () => {
        try {
          await updateVinculo.mutateAsync({
            id: link.id,
            colaborador_id: id,
            data_fim: null,
            silent: true,
          });
          safeCloseDialog(closeConfirmationDialog);
        } catch {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const activeTab = searchParams.get("tab") || "dados";

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams, { replace: true });
  };

  const handleOpenGerenciarConvenios = () => {
    if (!id || !collaborator) return;
    openGerenciarBloqueioConvenioDialog({
      colaboradorId: id,
      colaboradorNome: collaborator.nome_completo,
    });
  };

  return {
    id,
    collaborator,
    isLoading,
    role,
    possuiItens: itensAlocados.length > 0,
    bloqueioData,
    activeLinks,
    closedLinks,
    activeTab,
    filters,
    pontoVm,
    financeiroVm,
    modoComprovanteRenda,
    editAction,
    statusAction,
    resetAction,
    deleteAction,
    setModoComprovanteRenda,
    handleTabChange,
    handleAddTurn,
    handleEditTurn,
    handleDeleteTurn,
    handleEndTurn,
    handleReactivateTurn,
    handleOpenGerenciarConvenios,
    openOccurrenceFormDialog,
    navigate,
  };
}

export type CollaboratorDetailsViewModel = ReturnType<typeof useCollaboratorDetailsViewModel>;
