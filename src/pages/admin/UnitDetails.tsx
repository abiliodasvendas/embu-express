import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CollaboratorCard } from "@/components/common/CollaboratorCard";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnidadeFormDialog } from "@/components/dialogs/UnidadeFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { useClients } from "@/hooks/api/useClients";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import {
  useDeleteUnidade,
  useToggleUnidadeStatus,
} from "@/hooks/api/useUnidadeMutations";
import { useUnidade } from "@/hooks/api/useUnidades";
import { cn } from "@/lib/utils";
import { cnpjMask } from "@/utils/masks";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Edit2,
  MapPin,
  MapPinned,
  Trash2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UnitDetails() {
  const { id: clientId, unitId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } =
    useLayout();
  const [isUnidadeDialogOpen, setIsUnidadeDialogOpen] = useState(false);

  const { data: clients } = useClients({ includeId: clientId });
  const client = clients?.find((c) => c.id.toString() === clientId);

  const { data: unit, isLoading: isUnitLoading } = useUnidade(unitId);
  const { data: collaborators, isLoading: isCollabsLoading } = useCollaborators(
    { cliente_id: clientId },
    { enabled: !!clientId },
  );

  const deleteUnidade = useDeleteUnidade();
  const toggleStatus = useToggleUnidadeStatus();

  useEffect(() => {
    if (unit) {
      setPageTitle("Unidade");
    }
  }, [unit, setPageTitle]);

  const unitCollaborators = useMemo(() => {
    if (!collaborators || !unitId) return [];
    return collaborators.filter((collab) =>
      collab.links?.some((link: any) => link.unidade_id?.toString() === unitId),
    );
  }, [collaborators, unitId]);

  const handleToggleStatus = async () => {
    if (!unit) return;
    const newStatus = !unit.ativo;
    openConfirmationDialog({
      title: newStatus ? "Ativar Unidade" : "Desativar Unidade",
      description: newStatus
        ? "Deseja reativar esta unidade para operações?"
        : "Ao desativar, novas operações para esta unidade serão restritas. Continuar?",
      confirmText: "Confirmar",
      variant: newStatus ? "success" : "warning",
      onConfirm: async () => {
        await toggleStatus.mutateAsync({ id: unit.id, ativo: newStatus });
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleDelete = () => {
    if (!unit) return;
    openConfirmationDialog({
      title: "Remover Unidade",
      description: `Tem certeza que deseja remover a unidade "${unit.nome_unidade}"? Esta ação não pode ser desfeita.`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteUnidade.mutateAsync(unit.id);
        safeCloseDialog(closeConfirmationDialog);
        navigate(`/clientes/${clientId}`);
      },
    });
  };

  if (isUnitLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse bg-[#f8f9fa] min-h-screen">
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
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#f8f9fa]">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <XCircle className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Unidade não encontrada
        </h2>
        <Button
          onClick={() => navigate(`/clientes/${clientId}`)}
          className="rounded-2xl px-8 shadow-lg shadow-primary/20"
        >
          Voltar para o Cliente
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
                {
                  label: client?.nome_fantasia || "Cliente",
                  href: `/clientes/${clientId}`,
                },
                { label: unit.nome_unidade },
              ]}
            />
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {unit.nome_unidade}
              </h1>
              <StatusBadge
                status={unit.ativo}
                className="text-xs uppercase tracking-wider h-6 px-3"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
              onClick={() => setIsUnidadeDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>

            <ActionsDropdown
              actions={[
                {
                  label: unit.ativo ? "Desativar Unidade" : "Ativar Unidade",
                  icon: unit.ativo ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  ),
                  onClick: handleToggleStatus,
                  variant: unit.ativo ? "destructive" : "default",
                },
                {
                  label: "Remover Unidade",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDelete,
                  variant: "destructive",
                },
              ]}
            >
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
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Profile Card */}
            <section className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <MapPinned className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {unit.nome_unidade}
                </h2>
                <p className="text-xs font-medium text-gray-400 mb-6 uppercase tracking-wider">
                  {unit.razao_social}
                </p>
                <div className="w-full space-y-3 pt-6 border-t border-gray-100 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CNPJ</span>
                    <span className="font-medium text-gray-900">
                      {cnpjMask(unit.cnpj)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Desde</span>
                    <span className="font-medium text-gray-900">
                      {unit.created_at
                        ? new Date(unit.created_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cliente</span>
                    <span
                      className="font-medium text-gray-900 border-gray-200 hover:border-primary transition-colors cursor-default"
                      title="Cliente Vinculado"
                    >
                      {client?.nome_fantasia || "—"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-50 mt-2">
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 capitalize leading-tight">
                          {unit.logradouro.toLowerCase()}, {unit.numero}
                          {unit.complemento && ` - ${unit.complemento}`}
                        </p>
                        <p className="text-[12px] text-gray-500 capitalize leading-tight mt-1">
                          {unit.bairro.toLowerCase()},{" "}
                          {unit.cidade.toLowerCase()} - {unit.estado}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Operation Scale Card */}
            <section className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-gray-900">Escala de Operação</h3>
              </div>

              <ScaleIndicators
                activeDays={unit.escala_semanal || []}
                size="md"
              />
            </section>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-primary/5 p-2 rounded-lg text-primary">
                    <Users className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Colaboradores
                  </span>
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {String(unitCollaborators.length).padStart(2, "0")}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-primary/5 p-2 rounded-lg text-primary">
                    <Zap className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    KM Contratado
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {unit.km_contratados || 0}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    KM / Mês
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={cn(
                      "p-2 rounded-lg",
                      unit.ativo
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600",
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      unit.ativo ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xl font-black",
                      unit.ativo ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {unit.ativo ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
            </div>

            {/* COLLABORATORS SECTION */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Colaboradores
                </h3>
                {unitCollaborators.length > 0 && (
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {unitCollaborators.length} Profissionais
                  </span>
                )}
              </div>

              {isCollabsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 rounded-3xl" />
                  <Skeleton className="h-24 rounded-3xl" />
                </div>
              ) : unitCollaborators.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-200" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">
                    Nenhum colaborador vinculado
                  </h4>
                  <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                    Vincule colaboradores a esta unidade através da tela de
                    detalhes do cliente.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/clientes/${clientId}`)}
                    className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors"
                  >
                    Ir para o Cliente <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unitCollaborators.map((collab) => {
                    const link = collab.links?.find(
                      (l: any) => l.unidade_id?.toString() === unitId,
                    );
                    const shiftDays =
                      link?.horarios?.map((h: any) => h.dia_semana) || [];
                    const firstShift = link?.horarios?.[0];
                    const shiftInterval = firstShift
                      ? `${firstShift.hora_inicio.substring(0, 5)} - ${firstShift.hora_fim.substring(0, 5)}`
                      : "S/ Horário";

                    return (
                      <CollaboratorCard
                        key={collab.id}
                        name={collab.nome_completo}
                        status={collab.status}
                        shiftInterval={shiftInterval}
                        shiftDays={shiftDays}
                        unitDays={unit.escala_semanal || []}
                        showUnit={false}
                        variant="condensed"
                        onClick={() => navigate(`/colaboradores/${collab.id}`)}
                      />
                    );
                  })}
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
        clienteId={Number(clientId)}
        editingUnidade={unit}
      />
    </div>
  );
}
