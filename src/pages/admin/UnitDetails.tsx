import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CollaboratorCard } from "@/components/common/CollaboratorCard";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { useClients } from "@/hooks/api/useClients";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import {
  useDeleteUnidade,
  useToggleUnidadeStatus,
} from "@/hooks/api/useUnidadeMutations";
import { useUnidade } from "@/hooks/api/useUnidades";
import { Usuario } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
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
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UnitDetails() {
  const { id: clientId, unitId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openUnidadeFormDialog } =
    useLayout();

  const { data: clients } = useClients({ includeId: clientId });
  const client = clients?.find((c) => c.id.toString() === clientId);

  const { data: unit, isLoading: isUnitLoading } = useUnidade(unitId);
  const { data: collaboratorsResponse, isLoading: isCollabsLoading } = useCollaborators(
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
    if (!collaboratorsResponse || !unitId) return [];
    const list = Array.isArray(collaboratorsResponse)
      ? (collaboratorsResponse as Usuario[])
      : (collaboratorsResponse as { data?: Usuario[] }).data || [];
    return list.filter((collab) =>
      collab.links?.some((link) => link.unidade_id?.toString() === unitId),
    );
  }, [collaboratorsResponse, unitId]);

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
      <div className="p-4 sm:p-6 space-y-6 animate-pulse">
        <Skeleton className="h-6 w-48 rounded-[14px]" />
        <div className="flex justify-between items-center bg-card p-5 rounded-[18px] border border-border shadow-xs">
          <Skeleton className="h-10 w-32 rounded-[14px]" />
          <Skeleton className="h-10 w-24 rounded-[14px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-64 rounded-[18px]" />
            <Skeleton className="h-32 rounded-[18px]" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-[18px]" />
              <Skeleton className="h-24 rounded-[18px]" />
            </div>
            <Skeleton className="h-[400px] rounded-[18px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-[18px] bg-muted/70 text-destructive border border-border flex items-center justify-center">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Unidade não encontrada
        </h2>
        <Button
          onClick={() => navigate(`/clientes/${clientId}`)}
          className="rounded-[18px] h-11 px-6 bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs"
        >
          Voltar para o Cliente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {unit.nome_unidade}
              </h1>
              <StatusBadge status={unit.ativo} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => openUnidadeFormDialog({ clienteId: Number(clientId), editingUnidade: unit })}
              className="h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-sm shadow-xs gap-1.5 px-4"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
              <span>Editar</span>
            </Button>

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
              <Button
                variant="outline"
                className="h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-sm shadow-xs gap-1.5 px-4"
              >
                <span>Ações</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </ActionsDropdown>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <Card className="rounded-[18px] border border-border bg-card shadow-xs">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[18px] bg-muted/70 border border-border flex items-center justify-center mb-4">
                  <MapPinned className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">
                  {unit.nome_unidade}
                </h2>
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  {unit.razao_social}
                </p>
                <div className="w-full space-y-3 pt-5 border-t border-border mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CNPJ</span>
                    <span className="font-medium text-foreground font-mono text-xs">
                      {cnpjMask(unit.cnpj)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desde</span>
                    <span className="font-medium text-foreground">
                      {unit.created_at
                        ? new Date(unit.created_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium text-foreground">
                      {client?.nome_fantasia || "—"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border mt-2">
                    <div className="flex gap-3 text-left">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-foreground capitalize leading-snug">
                          {unit.logradouro.toLowerCase()}, {unit.numero}
                          {unit.complemento && ` - ${unit.complemento}`}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize leading-snug mt-0.5">
                          {unit.bairro.toLowerCase()},{" "}
                          {unit.cidade.toLowerCase()} - {unit.estado}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[18px] border border-border bg-card shadow-xs">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Escala de Operação</h3>
                </div>

                <ScaleIndicators
                  activeDays={unit.escala_semanal || []}
                  size="md"
                />
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-8 flex flex-col gap-6">
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-3">
              <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Colaboradores
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {String(unitCollaborators.length).padStart(2, "0")}
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      KM Contratado
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {unit.km_contratados || 0}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      KM / Mês
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <StatusBadge status={unit.ativo} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  Colaboradores
                </h3>
                {unitCollaborators.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted/70 border border-border px-3 py-1 rounded-[12px]">
                    {unitCollaborators.length} {unitCollaborators.length === 1 ? "Colaborador" : "Colaboradores"}
                  </span>
                )}
              </div>

              {isCollabsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 rounded-[18px]" />
                  <Skeleton className="h-24 rounded-[18px]" />
                </div>
              ) : unitCollaborators.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-[18px] border border-dashed border-border p-6">
                  <div className="h-12 w-12 rounded-[14px] bg-muted/70 text-muted-foreground border border-border flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    Nenhum colaborador vinculado
                  </h4>
                  <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-xs">
                    Vincule colaboradores a esta unidade através da tela de detalhes do cliente.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/clientes/${clientId}`)}
                    className="mt-4 h-9 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-xs gap-1.5"
                  >
                    <span>Ir para o Cliente</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unitCollaborators.map((collab) => {
                    const link = collab.links?.find(
                      (l) => l.unidade_id?.toString() === unitId,
                    );
                    const shiftDays =
                      link?.horarios?.map(
                        (h: { dia_semana: number; hora_inicio: string; hora_fim: string }) =>
                          h.dia_semana,
                      ) || [];
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
    </div>
  );
}
