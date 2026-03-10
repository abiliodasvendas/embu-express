import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/constants/messages";
import { STATUS } from "@/constants/roles";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteClient, useToggleClientStatus } from "@/hooks/api/useClientMutations";
import { useClients } from "@/hooks/api/useClients";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useClientActions } from "@/hooks/business/useClientActions";
import { cn } from "@/lib/utils";
import { Client, ColaboradorCliente } from "@/types/database";
import { cnpjMask } from "@/utils/masks";
import { Building2, ChevronDown, ChevronLeft, MapPin, MoreVertical, User, Users, Zap, CalendarDays } from "lucide-react";
import { WeeklyScale } from "@/components/common/WeeklyScale";
import { useNavigate, useParams } from "react-router-dom";

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Usamos includeId para garantir que o cliente virá mesmo se estiver inativo, caso a query default oculte inativos sem esse parametro.
    const { data: clients, isLoading: isClientLoading } = useClients({ includeId: id });
    const client = clients?.find(c => c.id.toString() === id);

    // Fetching collaborators vinculados a esse cliente
    const { data: collaborators, isLoading: isCollabsLoading } = useCollaborators({ cliente_id: id });

    const toggleStatus = useToggleClientStatus();
    const deleteClient = useDeleteClient();
    const { openConfirmationDialog, closeConfirmationDialog, openClientFormDialog } = useLayout();


    const handleToggleStatus = async () => {
        if (!client) return;
        const newStatus = !client.ativo;
        const confirmMessage = newStatus ? messages.dialogo.ativar.descricao : messages.dialogo.desativar.descricao;

        openConfirmationDialog({
            title: newStatus ? "Ativar Cliente" : "Desativar Cliente",
            description: confirmMessage,
            confirmText: "Confirmar",
            variant: newStatus ? "success" : "warning",
            onConfirm: async () => {
                try {
                    await toggleStatus.mutateAsync({ id: client.id, ativo: newStatus });
                    closeConfirmationDialog();
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }

    const handleDelete = () => {
        if (!client) return;
        openConfirmationDialog({
            title: messages.dialogo.remover.titulo,
            description: `Tem certeza que deseja remover o cliente "${client.nome_fantasia}"? Esta ação não pode ser desfeita.`,
            confirmText: messages.dialogo.remover.botao,
            variant: "destructive",
            onConfirm: async () => {
                try {
                    await deleteClient.mutateAsync(client.id);
                    closeConfirmationDialog();
                    navigate("/clientes");
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }

    const actions = useClientActions({
        client: client as unknown as Client,
        onEdit: () => openClientFormDialog({ editingClient: client }),
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete,
    });

    if (isClientLoading) {
        return (
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] lg:col-span-1 border rounded-3xl" />
                    <Skeleton className="h-[600px] lg:col-span-2 border rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Cliente não encontrado.</p>
                <Button onClick={() => navigate("/clientes")} variant="link">Voltar para a lista</Button>
            </div>
        );
    }

    const totalCollaborators = collaborators?.length || 0;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/clientes")}
                    className="hover:bg-gray-100 rounded-xl px-2"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Voltar
                </Button>
                <div className="flex gap-2 items-center">
                    <ActionsDropdown actions={actions}>
                        <Button variant="outline" className="rounded-xl border-gray-200 shadow-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1 px-3">
                            <span className="hidden sm:inline font-semibold">Ações</span>
                            <MoreVertical className="h-4 w-4 sm:hidden -mx-1" />
                            <ChevronDown className="h-4 w-4 hidden sm:block opacity-50 text-gray-500" />
                        </Button>
                    </ActionsDropdown>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info - Left Column */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-b from-primary/5 to-white">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="mx-auto w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                                <Building2 className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{client.nome_fantasia}</h2>
                            {client.razao_social && (
                                <p className="text-xs text-muted-foreground mt-1">{client.razao_social}</p>
                            )}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "mt-3 px-3 py-1 rounded-full font-bold border",
                                    client.ativo
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-red-100 text-red-700 border-red-200"
                                )}
                            >
                                {client.ativo ? STATUS.ATIVO : STATUS.INATIVO}
                            </Badge>
                        </CardContent>
                        <CardContent className="border-t border-gray-100 space-y-4 pt-6">

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">CNPJ</p>
                                    <p className="text-sm font-medium text-gray-700">{client.cnpj ? cnpjMask(client.cnpj) : 'Não informado'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                                    <MapPin className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                                    <p className="text-sm font-medium text-gray-700 leading-tight">
                                        {client.logradouro ? (
                                            <>
                                                {client.logradouro}, {client.numero} {client.complemento && ` - ${client.complemento}`} <br />
                                                {client.bairro}, {client.cidade} - {client.estado}
                                            </>
                                        ) : 'Não informado'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                                    <Zap className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">KM Contratados (Mês)</p>
                                    <p className="text-sm font-medium text-gray-700">{client.km_contratados || '0'} KM / Motoboy</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                                    <CalendarDays className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Escala Semanal</p>
                                    <WeeklyScale escala={client.escala_semanal || []} />
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Total de Colaboradores</span>
                                </div>
                                <span className="text-lg font-extrabold text-primary">{totalCollaborators}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Linked Collaborators - Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm rounded-3xl min-h-[500px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Colaboradores Vinculados
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Lista de profissionais designados para este cliente.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1">
                            {isCollabsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                                </div>
                            ) : !collaborators || collaborators.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-700">Nenhum colaborador</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                        Nenhum vínculo profissional foi atribuído a este cliente ainda.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {collaborators.map((collab) => {
                                        // Extract only the links specific to this client for display
                                        const clientLinks = collab.links?.filter((l: ColaboradorCliente) => l.cliente_id?.toString() === id) || [];

                                        return (
                                            <div
                                                key={collab.id}
                                                className="group border border-gray-100 p-5 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative cursor-pointer"
                                                onClick={() => navigate(`/colaboradores/${collab.id}`)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 shadow-sm border border-primary/20 rounded-xl">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 leading-tight">
                                                                {collab.nome_completo}
                                                            </h4>
                                                            <div className="flex gap-2 items-center mt-1">
                                                                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 bg-gray-100 text-gray-600">
                                                                    {collab.perfil?.nome.toUpperCase()}
                                                                </Badge>
                                                                <StatusBadge status={collab.status} className="scale-75 origin-left h-5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {clientLinks.length > 0 && (
                                                    <div className="space-y-3 mt-4 border-t border-gray-50 pt-3">
                                                        {clientLinks.map((link: ColaboradorCliente, idx: number) => (
                                                            <div key={idx} className="flex flex-col gap-2">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Horário</p>
                                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                                            <span className="text-xs font-bold text-gray-700">
                                                                                {link.hora_inicio?.substring(0, 5)} — {link.hora_fim?.substring(0, 5)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empresa Pg.</p>
                                                                        <p className="text-xs font-medium text-gray-600 mt-0.5">
                                                                            {link.empresa?.nome_fantasia || link.empresa?.razao_social || '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
