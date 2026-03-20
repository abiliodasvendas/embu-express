import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CollaboratorCard } from "@/components/common/CollaboratorCard";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { UnidadeFormDialog } from "@/components/dialogs/UnidadeFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useDeleteClient,
  useToggleClientStatus,
} from "@/hooks/api/useClientMutations";
import { useClients } from "@/hooks/api/useClients";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useDeleteUnidade } from "@/hooks/api/useUnidadeMutations";
import { useUnidades } from "@/hooks/api/useUnidades";
import { useClientActions } from "@/hooks/business/useClientActions";
import { cn } from "@/lib/utils";
import { Client, ColaboradorCliente, Unidade } from "@/types/database";
import { DIAS_SEMANA } from "@/utils/formatters/constants";
import { cnpjMask } from "@/utils/masks";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CopyCheck,
  Edit2,
  ExternalLink,
  Link2,
  MapPin,
  MapPinned,
  Plus,
  Trash2,
  Users,
  XCircle,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isUnidadeDialogOpen, setIsUnidadeDialogOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  
  // Pagination states
  const [unitPage, setUnitPage] = useState(1);
  const unitsPerPage = 5;
  const [collabPage, setCollabPage] = useState(1);
  const collabsPerPage = 4;

  const [searchParams, setSearchParams] = useSearchParams();
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const { data: clients, isLoading: isClientLoading } = useClients({
    includeId: id,
  });
  const client = clients?.find((c) => c.id.toString() === id);

  const { data: unidades, isLoading: isUnidadesLoading } = useUnidades(
    Number(id),
  );
  const { data: collaborators, isLoading: isCollabsLoading } = useCollaborators(
    { cliente_id: id },
  );

  const toggleStatus = useToggleClientStatus();
  const deleteClient = useDeleteClient();
  const deleteUnidade = useDeleteUnidade();

  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openClientFormDialog,
    setPageTitle,
  } = useLayout();

  // Optimized collaborators mapping for pagination
  const flattenedCollaborators = useMemo(() => {
    if (!collaborators) return [];
    return collaborators.flatMap((collab) => {
      const clientLinks =
        collab.links?.filter(
          (l: ColaboradorCliente) => l.cliente_id?.toString() === id,
        ) || [];
      return clientLinks.map((link: ColaboradorCliente, linkIdx: number) => ({
        ...collab,
        link,
        uniqueKey: `${collab.id}-${linkIdx}`
      }));
    });
  }, [collaborators, id]);

  const stats = useMemo(() => {
    const totalUnits = unidades?.length || 0;
    const totalVinculos = flattenedCollaborators.length;

    return { totalUnits, totalVinculos };
  }, [unidades, flattenedCollaborators]);

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
        closeConfirmationDialog();
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
        closeConfirmationDialog();
        navigate("/clientes");
      },
    });
  };

  const handleEditUnidade = (unidade: Unidade) => {
    setEditingUnidade(unidade);
    setIsUnidadeDialogOpen(true);
  };

  const handleAddUnidade = () => {
    setEditingUnidade(null);
    setIsUnidadeDialogOpen(true);
  };

  const handleDeleteUnidade = (unidade: Unidade) => {
    openConfirmationDialog({
      title: "Remover Unidade",
      description: `Tem certeza que deseja remover a unidade "${unidade.nome_unidade}"?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteUnidade.mutateAsync(unidade.id);
        closeConfirmationDialog();
      },
    });
  };

  const clientActions = useClientActions({
    client: client as unknown as Client,
    onEdit: () => openClientFormDialog({ editingClient: client }),
    onToggleStatus: handleToggleStatus,
    onDelete: handleDelete,
  }).filter(action => action.label !== "Editar");

  if (isClientLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-6 w-48 rounded-full" />
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <Skeleton className="h-10 w-24 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <XCircle className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Cliente não encontrado
        </h2>
        <p className="text-muted-foreground max-w-xs">
          O cliente solicitado pode ter sido removido ou o ID está incorreto.
        </p>
        <Button
          onClick={() => navigate("/clientes")}
          className="rounded-2xl px-8 shadow-lg shadow-primary/20"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-full transition-all duration-500">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Top Navigation & Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex flex-col gap-1">
            <Breadcrumbs
              items={[
                { label: "Clientes", href: "/clientes" },
                { label: client.nome_fantasia },
              ]}
            />
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {client.nome_fantasia}
              </h1>
              <StatusBadge status={client.ativo} className="text-xs uppercase tracking-wider" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
              onClick={() => openClientFormDialog({ editingClient: client })}
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>

            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-to-br from-[#0055c0] to-[#136dec] shadow-md hover:shadow-lg transition-all active:scale-95"
              onClick={handleAddUnidade}
            >
              <Plus className="h-4 w-4" />
              Adicionar Unidade
            </button>

            <ActionsDropdown actions={clientActions}>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
              >
                Ações
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </ActionsDropdown>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: CLIENT PROFILE */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Profile Card */}
            <section className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {client.nome_fantasia}
                </h2>
                <div className="w-full space-y-3 pt-6 border-t border-gray-100 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Desde</span>
                    <span className="font-medium text-gray-900">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString('pt-BR')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Setor</span>
                    <span className="font-medium text-gray-400">--</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Public Access Link Card */}
            {client.public_id && (
              <section className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-gray-900">Link de Acesso Público</h3>
                </div>
                <p className="text-[11px] text-gray-500 mb-6">
                  Compartilhe este link com o cliente para acesso rápido dos
                  relatórios.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg flex items-center justify-between text-xs font-mono text-primary">
                    <span className="truncate">
                      {`/public/c/${client.public_id.substring(0, 12)}...`}
                    </span>
                    <ExternalLink
                      className="h-4 w-4 text-gray-400 shrink-0 ml-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/public/c/${client.public_id}`,
                          "_blank",
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/public/c/${client.public_id}`,
                      );
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                  >
                    {isCopied ? (
                      <><CopyCheck className="h-4 w-4 text-emerald-500" /> Copiado!</>
                    ) : (
                      <><Copy className="h-4 w-4" /> Copiar Link</>
                    )}
                  </button>
                </div>
              </section>
            )}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-primary/5 p-2 rounded-lg text-primary">
                    <MapPinned className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total de Unidades</span>
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {String(stats.totalUnits).padStart(2, '0')}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-primary/5 p-2 rounded-lg text-primary">
                    <Users className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Colaboradores</span>
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {String(stats.totalVinculos).padStart(2, '0')}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className={cn("p-2 rounded-lg", client.ativo ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", client.ativo ? "bg-emerald-500" : "bg-rose-500")} />
                  <span className={cn("text-xl font-black", client.ativo ? "text-emerald-600" : "text-rose-600")}>
                    {client.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </div>

            {/* UNITS SECTION */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Unidades / Filiais
                </h3>
              </div>

              {isUnidadesLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              ) : !unidades || unidades.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">
                    Nenhuma unidade encontrada
                  </h4>
                  <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                    Comece cadastrando a primeira unidade operacional do cliente.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddUnidade}
                    className="mt-4 text-primary font-bold text-sm hover:underline"
                  >
                    Adicionar Unidade
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={unitPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-4"
                      >
                        {unidades?.slice((unitPage - 1) * unitsPerPage, unitPage * unitsPerPage).map((unidade) => (
                          <div
                            key={unidade.id}
                            className="bg-white px-8 py-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative"
                            onClick={() => navigate(`/clientes/${id}/unidades/${unidade.id}`)}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              {/* Left: Icon + Info */}
                              <div className="flex gap-4">
                                <div className="mt-1 shrink-0">
                                  <div className="p-2.5 bg-[#136dec]/5 rounded-xl group-hover:bg-[#136dec]/10 transition-colors">
                                    <MapPinned className="h-6 w-6 text-[#136dec]" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                      {unidade.nome_unidade}
                                    </h4>
                                    <StatusBadge status={unidade.ativo} className="text-[10px] uppercase tracking-wider h-5" />
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all duration-300">
                                      <button
                                        type="button"
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditUnidade(unidade);
                                        }}
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteUnidade(unidade);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    CNPJ: {cnpjMask(unidade.cnpj)}
                                  </p>
                                  <p className="text-sm text-gray-500 max-w-md capitalize">
                                    {unidade.logradouro.toLowerCase()}, {unidade.numero}
                                    {unidade.complemento && ` - ${unidade.complemento}`}.
                                    {' '}{unidade.bairro.toLowerCase()}, {unidade.cidade.toLowerCase()} - {unidade.estado}
                                  </p>
                                </div>
                              </div>

                              {/* Right: KM Badge + Scale */}
                              <div className="flex flex-col items-end gap-3 shrink-0">
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                                  <Zap className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-semibold text-gray-900">
                                    {unidade.km_contratados || 0} KM / Mês
                                  </span>
                                </div>
                                <ScaleIndicators activeDays={unidade.escala_semanal || []} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {unidades && unidades.length > unitsPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 font-medium">
                        Página {unitPage} de {Math.ceil(unidades.length / unitsPerPage)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={unitPage === 1}
                          onClick={(e) => { e.stopPropagation(); setUnitPage(prev => Math.max(1, prev - 1)); }}
                          className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          disabled={unitPage >= Math.ceil(unidades.length / unitsPerPage)}
                          onClick={(e) => { e.stopPropagation(); setUnitPage(prev => prev + 1); }}
                          className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* COLLABORATORS SECTION */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Colaboradores
                </h3>
              </div>

              {isCollabsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              ) : flattenedCollaborators.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">
                    Nenhum colaborador/turno vinculado a este cliente.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={collabPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {flattenedCollaborators.slice((collabPage - 1) * collabsPerPage, collabPage * collabsPerPage).map((collab) => {
                          const unit = unidades?.find(
                            (u) => u.id === collab.link.unidade_id,
                          );
                          const shiftDays = collab.link.horarios?.map((h: any) => h.dia_semana) || [];
                          const unitDays = unit?.escala_semanal || [1, 2, 3, 4, 5, 6, 0];
                          const shiftInterval = collab.link.horarios?.[0]
                            ? `${collab.link.horarios[0].hora_inicio.substring(0, 5)} - ${collab.link.horarios[0].hora_fim.substring(0, 5)}`
                            : "S/ Horário";

                          return (
                            <CollaboratorCard
                              key={collab.uniqueKey}
                              name={collab.nome_completo}
                              status={collab.status}
                              unitName={unit?.nome_unidade}
                              shiftInterval={shiftInterval}
                              shiftDays={shiftDays}
                              unitDays={unitDays}
                              onClick={() => navigate(`/colaboradores/${collab.id}`)}
                            />
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {flattenedCollaborators.length > collabsPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 font-medium">
                        Página {collabPage} de {Math.ceil(flattenedCollaborators.length / collabsPerPage)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={collabPage === 1}
                          onClick={(e) => { e.stopPropagation(); setCollabPage(prev => Math.max(1, prev - 1)); }}
                          className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          disabled={collabPage >= Math.ceil(flattenedCollaborators.length / collabsPerPage)}
                          onClick={(e) => { e.stopPropagation(); setCollabPage(prev => prev + 1); }}
                          className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* DIALOGS */}
      <UnidadeFormDialog
        isOpen={isUnidadeDialogOpen}
        onClose={() => setIsUnidadeDialogOpen(false)}
        clienteId={Number(id)}
        editingUnidade={editingUnidade}
      />
    </div>
  );
}
