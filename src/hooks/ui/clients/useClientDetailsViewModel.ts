import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useClients } from "@/hooks/api/useClients";
import { useUnidades } from "@/hooks/api/useUnidades";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import {
  useToggleClientStatus,
  useDeleteClient,
} from "@/hooks/api/useClientMutations";
import { useDeleteUnidade } from "@/hooks/api/useUnidadeMutations";
import { useClientActions } from "@/hooks/business/useClientActions";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { messages } from "@/constants/messages";
import { Client, ColaboradorCliente, Unidade, Usuario } from "@/types/database";

export interface FlattenedCollaboratorClient extends Usuario {
  link: ColaboradorCliente;
  uniqueKey: string;
}

export function useClientDetailsViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCopied, setIsCopied] = useState(false);
  const [unitPage, setUnitPage] = useState(1);
  const unitsPerPage = 5;
  const [collabPage, setCollabPage] = useState(1);
  const collabsPerPage = 4;
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const { data: clients, isLoading: isClientLoading } = useClients({
    includeId: id,
  });
  const client = clients?.find((c) => c.id.toString() === id);

  const { data: unidades, isLoading: isUnidadesLoading } = useUnidades(
    Number(id),
  );
  const { data: collaborators, isLoading: isCollabsLoading } = useCollaborators(
    { cliente_id: id, status: "ATIVO" },
  );

  const toggleStatus = useToggleClientStatus();
  const deleteClient = useDeleteClient();
  const deleteUnidade = useDeleteUnidade();

  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openClientFormDialog,
    openUnidadeFormDialog,
    setPageTitle,
  } = useLayout();

  const collaboratorsList = useMemo(() => {
    if (!collaborators) return [];
    if (Array.isArray(collaborators)) return collaborators;
    return (collaborators as { data?: Usuario[] }).data || [];
  }, [collaborators]);

  const flattenedCollaborators = useMemo((): FlattenedCollaboratorClient[] => {
    return collaboratorsList
      .filter((collab) => collab.status === "ATIVO")
      .flatMap((collab) => {
        const clientLinks =
          collab.links?.filter(
            (l: ColaboradorCliente) => l.cliente_id?.toString() === id && !l.data_fim,
          ) || [];
        return clientLinks.map((link: ColaboradorCliente, linkIdx: number) => ({
          ...collab,
          link,
          uniqueKey: `${collab.id}-${linkIdx}`,
        }));
      });
  }, [collaboratorsList, id]);

  const stats = useMemo(() => {
    const totalUnits = unidades?.length || 0;
    const totalVinculos = flattenedCollaborators.length;

    return { totalUnits, totalVinculos };
  }, [unidades, flattenedCollaborators]);

  const handleEditUnidade = (unidade: Unidade) => {
    openUnidadeFormDialog({ clienteId: Number(id), editingUnidade: unidade });
  };

  const handleAddUnidade = () => {
    openUnidadeFormDialog({ clienteId: Number(id), editingUnidade: null });
  };

  useEffect(() => {
    if (client) {
      setPageTitle("Cliente");
    } else if (!isClientLoading) {
      setPageTitle("Cliente não encontrado");
    }
  }, [client, isClientLoading, setPageTitle]);

  useEffect(() => {
    if (
      !hasAutoOpened &&
      searchParams.get("openUnitDialog") === "true" &&
      client &&
      !isClientLoading
    ) {
      setHasAutoOpened(true);
      handleAddUnidade();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("openUnitDialog");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, client, isClientLoading, hasAutoOpened, setSearchParams]);

  const handleToggleStatus = async () => {
    if (!client) return;
    const newStatus = !client.ativo;
    openConfirmationDialog({
      title: newStatus ? "Ativar Cliente" : "Desativar Cliente",
      description: newStatus
        ? messages.dialogo.ativar.descricao
        : messages.dialogo.desativar.descricao,
      confirmText: "Confirmar",
      variant: newStatus ? "success" : "warning",
      onConfirm: async () => {
        await toggleStatus.mutateAsync({ id: client.id, ativo: newStatus });
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleDelete = () => {
    if (!client) return;
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover o cliente "${client.nome_fantasia}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        await deleteClient.mutateAsync(client.id);
        safeCloseDialog(closeConfirmationDialog);
        navigate("/clientes");
      },
    });
  };

  const handleDeleteUnidade = (unidade: Unidade) => {
    openConfirmationDialog({
      title: "Remover Unidade",
      description: `Tem certeza que deseja remover a unidade "${unidade.nome_unidade}"?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteUnidade.mutateAsync(unidade.id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleCopyPublicLink = () => {
    if (!client?.public_id) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/public/c/${client.public_id}`,
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clientActions = useClientActions({
    client: (client || {}) as Client,
    onEdit: () => openClientFormDialog({ editingClient: client }),
    onToggleStatus: handleToggleStatus,
    onDelete: handleDelete,
    hideDetails: true,
  }).filter((action) => action.label !== "Editar");

  const paginatedUnidades = useMemo(() => {
    if (!unidades) return [];
    return unidades.slice((unitPage - 1) * unitsPerPage, unitPage * unitsPerPage);
  }, [unidades, unitPage, unitsPerPage]);

  const totalUnitPages = useMemo(() => {
    if (!unidades || unidades.length === 0) return 1;
    return Math.ceil(unidades.length / unitsPerPage);
  }, [unidades, unitsPerPage]);

  const paginatedCollaborators = useMemo(() => {
    return flattenedCollaborators.slice(
      (collabPage - 1) * collabsPerPage,
      collabPage * collabsPerPage,
    );
  }, [flattenedCollaborators, collabPage, collabsPerPage]);

  const totalCollabPages = useMemo(() => {
    if (flattenedCollaborators.length === 0) return 1;
    return Math.ceil(flattenedCollaborators.length / collabsPerPage);
  }, [flattenedCollaborators, collabsPerPage]);

  return {
    id,
    navigate,
    client,
    isClientLoading,
    unidades,
    isUnidadesLoading,
    collaborators,
    isCollabsLoading,
    flattenedCollaborators,
    paginatedCollaborators,
    totalCollabPages,
    collabPage,
    setCollabPage,
    paginatedUnidades,
    totalUnitPages,
    unitPage,
    setUnitPage,
    stats,
    isCopied,
    clientActions,
    handleToggleStatus,
    handleDelete,
    handleEditUnidade,
    handleAddUnidade,
    handleDeleteUnidade,
    handleCopyPublicLink,
    openClientEditDialog: () => openClientFormDialog({ editingClient: client }),
  };
}
