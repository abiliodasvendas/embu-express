import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/constants/messages";
import { STATUS } from "@/constants/roles";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteClient, useToggleClientStatus } from "@/hooks/api/useClientMutations";
import { useClients } from "@/hooks/api/useClients";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useUnidades } from "@/hooks/api/useUnidades";
import { useDeleteUnidade, useToggleUnidadeStatus } from "@/hooks/api/useUnidadeMutations";
import { useClientActions } from "@/hooks/business/useClientActions";
import { cn } from "@/lib/utils";
import { Client, ColaboradorCliente, Unidade } from "@/types/database";
import { cnpjMask } from "@/utils/masks";
import { Building2, ChevronDown, ChevronLeft, MapPin, MoreVertical, User, Users, Zap, CalendarDays, ExternalLink, Copy, CopyCheck, Plus, Edit2, Trash2, MapPinned } from "lucide-react";
import { WeeklyScale } from "@/components/common/WeeklyScale";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { UnidadeFormDialog } from "@/components/dialogs/UnidadeFormDialog";

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isCopied, setIsCopied] = useState(false);
    const [isUnidadeDialogOpen, setIsUnidadeDialogOpen] = useState(false);
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    const { data: clients, isLoading: isClientLoading } = useClients({ includeId: id });
    const client = clients?.find(c => c.id.toString() === id);

    const { data: unidades, isLoading: isUnidadesLoading } = useUnidades(Number(id));
    const { data: collaborators, isLoading: isCollabsLoading } = useCollaborators({ cliente_id: id });

    const toggleStatus = useToggleClientStatus();
    const deleteClient = useDeleteClient();
    const deleteUnidade = useDeleteUnidade();
    const toggleUnidadeStatus = useToggleUnidadeStatus();
    
    const { openConfirmationDialog, closeConfirmationDialog, openClientFormDialog, setPageTitle } = useLayout();

    useEffect(() => {
        if (client) {
            setPageTitle(client.nome_fantasia);
        } else if (!isClientLoading) {
            setPageTitle("Cliente não encontrado");
        } else {
            setPageTitle("Carregando Cliente...");
        }
    }, [client, isClientLoading, setPageTitle]);

    useEffect(() => {
        if (!hasAutoOpened && searchParams.get('openUnitDialog') === 'true' && client && !isClientLoading) {
            setHasAutoOpened(true);
            handleAddUnidade();

            // Properly clear the search param
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('openUnitDialog');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, client, isClientLoading, hasAutoOpened, setSearchParams]);

    const handleToggleStatus = async () => {
        if (!client) return;
        const newStatus = !client.ativo;
        
        openConfirmationDialog({
            title: newStatus ? "Ativar Cliente" : "Desativar Cliente",
            description: newStatus ? messages.dialogo.ativar.descricao : messages.dialogo.desativar.descricao,
            confirmText: "Confirmar",
            variant: newStatus ? "success" : "warning",
            onConfirm: async () => {
                await toggleStatus.mutateAsync({ id: client.id, ativo: newStatus });
                closeConfirmationDialog();
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
                await deleteClient.mutateAsync(client.id);
                closeConfirmationDialog();
                navigate("/clientes");
            },
        });
    }

    const handleEditUnidade = (unidade: Unidade) => {
        setEditingUnidade(unidade);
        setIsUnidadeDialogOpen(true);
    }

    const handleAddUnidade = () => {
        setEditingUnidade(null);
        setIsUnidadeDialogOpen(true);
    }

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

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <Button variant="ghost" onClick={() => navigate("/clientes")} className="rounded-xl px-2">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Voltar
                </Button>
                <div className="flex gap-2 items-center">
                    {client.public_id && (
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-blue-100 bg-blue-50 text-blue-600 hidden sm:flex items-center gap-2 font-bold shadow-none"
                            onClick={() => window.open(`/public/c/${client.public_id}/controle`, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Painel Público
                        </Button>
                    )}
                    <ActionsDropdown actions={actions}>
                        <Button variant="outline" className="rounded-xl border-gray-200">
                            Ações
                            <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
                        </Button>
                    </ActionsDropdown>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Administrative Profile Section */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-b from-primary/5 to-white">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="mx-auto w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                                <Building2 className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{client.nome_fantasia}</h2>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "mt-3 px-3 py-1 rounded-full font-bold border",
                                    client.ativo ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                                )}
                            >
                                {client.ativo ? "ATIVO" : "INATIVO"}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Shared Public Link Card */}
                    {client.public_id && (
                        <Card className="border-0 shadow-sm rounded-3xl bg-primary/5 overflow-hidden">
                            <CardHeader className="pb-2 pt-6 px-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                                    <ExternalLink className="h-4 w-4" />
                                    Link de Acesso Público
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={`${window.location.origin}/public/c/${client.public_id}`}
                                        className="h-9 text-[10px] font-medium bg-white rounded-xl"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 rounded-xl shrink-0"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/public/c/${client.public_id}`);
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                    >
                                        {isCopied ? <CopyCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Units and Collaborators Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Units Section */}
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MapPinned className="h-5 w-5 text-primary" />
                                    Unidades / Filiais
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Gerencie os pontos operacionais deste cliente.</p>
                            </div>
                            <Button className="rounded-xl font-bold gap-2" size="sm" onClick={handleAddUnidade}>
                                <Plus className="h-4 w-4" />
                                Adicionar Unidade
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isUnidadesLoading ? (
                                <Skeleton className="h-40 w-full rounded-2xl" />
                            ) : !unidades || unidades.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">Nenhuma unidade cadastrada para este cliente.</p>
                                    <Button variant="link" onClick={handleAddUnidade} className="mt-2">Cadastrar a primeira unidade agora</Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {unidades.map((unidade) => (
                                        <div key={unidade.id} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{unidade.nome_unidade}</h3>
                                                    <p className="text-xs text-muted-foreground">{cnpjMask(unidade.cnpj)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEditUnidade(unidade)}>
                                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDeleteUnidade(unidade)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex gap-2 items-start">
                                                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                        <p className="text-xs text-gray-600 leading-normal">
                                                            {unidade.logradouro}, {unidade.numero} {unidade.complemento && ` - ${unidade.complemento}`} <br />
                                                            {unidade.bairro}, {unidade.cidade} - {unidade.estado}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        <p className="text-xs text-gray-600 font-bold">{unidade.km_contratados} KM / Motoboy</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CalendarDays className="h-3.5 w-3.5 text-purple-500" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Escala Operacional</span>
                                                    </div>
                                                    <WeeklyScale escala={unidade.escala_semanal || []} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Linked Collaborators Section */}
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Colaboradores Atribuídos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isCollabsLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : !collaborators || collaborators.length === 0 ? (
                                <p className="text-center text-gray-500 py-6">Nenhum colaborador vinculado a este cliente.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {collaborators.map((collab) => {
                                        const clientLinks = collab.links?.filter((l: ColaboradorCliente) => l.cliente_id?.toString() === id) || [];
                                        return (
                                            <div
                                                key={collab.id}
                                                className="border border-gray-100 p-4 rounded-2xl hover:border-primary/20 transition-all cursor-pointer bg-white"
                                                onClick={() => navigate(`/colaboradores/${collab.id}`)}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-primary/10 rounded-xl">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{collab.nome_completo}</h4>
                                                        <StatusBadge status={collab.status} className="scale-75 origin-left" />
                                                    </div>
                                                </div>
                                                {clientLinks.map((link: ColaboradorCliente, idx: number) => {
                                                    const unit = unidades?.find(u => u.id === link.unidade_id);
                                                    return (
                                                        <div key={idx} className="bg-gray-50 p-2 rounded-lg mt-2 text-[10px]">
                                                            <p className="font-bold text-gray-500 mb-1 flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {unit?.nome_unidade || "Sem Unidade"}
                                                            </p>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-700 font-bold">{link.hora_inicio?.substring(0, 5)} - {link.hora_fim?.substring(0, 5)}</span>
                                                                <span className="text-gray-500">{link.empresa?.nome_fantasia || "-"}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <UnidadeFormDialog 
                isOpen={isUnidadeDialogOpen}
                onClose={() => setIsUnidadeDialogOpen(false)}
                clienteId={Number(id)}
                editingUnidade={editingUnidade}
            />
        </div>
    );
}
