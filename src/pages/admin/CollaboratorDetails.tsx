import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import { CollaboratorTurnDialog } from "@/components/dialogs/CollaboratorTurnDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollaborator, useDeleteVinculo, useRoles } from "@/hooks";
import { useUpdateCollaboratorStatus } from "@/hooks/api/useCollaboratorMutations";
import { cn } from "@/lib/utils";
import { ColaboradorCliente } from "@/types/database";
import { cnpjMask, cpfMask, dateMask, phoneMask } from "@/utils/masks";
import { Bike, Calendar, ChevronLeft, Clock, CreditCard, Edit2, Mail, MapPin, Phone, Plus, Power, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CollaboratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: collaborator, isLoading, refetch } = useCollaborator(id);
  const { data: roles } = useRoles();
  const deleteVinculo = useDeleteVinculo();
  const updateStatus = useUpdateCollaboratorStatus();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTurnDialogOpen, setIsTurnDialogOpen] = useState(false);
  const [turnToEdit, setTurnToEdit] = useState<ColaboradorCliente | null>(null);

  if (isLoading) {
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

  if (!collaborator) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Colaborador não encontrado.</p>
        <Button onClick={() => navigate("/colaboradores")} variant="link">Voltar para a lista</Button>
      </div>
    );
  }

  const role = roles?.find(r => r.id === collaborator.perfil_id);

  const handleAddTurn = () => {
    setTurnToEdit(null);
    setIsTurnDialogOpen(true);
  };

  const handleEditTurn = (turn: ColaboradorCliente) => {
    setTurnToEdit(turn);
    setIsTurnDialogOpen(true);
  };

  const handleDeleteTurn = async (turnId: number) => {
    if (window.confirm("Deseja realmente remover este vínculo?")) {
      await deleteVinculo.mutateAsync(turnId);
    }
  };

  const handleToggleStatus = async () => {
      const newStatus = collaborator.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
      if(window.confirm(`Deseja realmente alterar o status para ${newStatus}?`)) {
          await updateStatus.mutateAsync({ id: collaborator.id, status: newStatus });
      }
  }

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ATIVO': return "bg-green-100 text-green-700 border-green-200";
          case 'INATIVO': return "bg-red-100 text-red-700 border-red-200";
          case 'PENDENTE': return "bg-yellow-100 text-yellow-700 border-yellow-200";
          default: return "bg-gray-100 text-gray-600 border-gray-200";
      }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/colaboradores")}
          className="hover:bg-gray-100 rounded-xl px-2"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Voltar
        </Button>
        <div className="flex gap-2">
            <Button 
                onClick={handleToggleStatus}
                variant="outline"
                className={cn(
                    "rounded-xl border-gray-200", 
                    collaborator.status === 'ATIVO' ? "text-red-600 hover:bg-red-50 hover:border-red-200" : "text-green-600 hover:bg-green-50 hover:border-green-200"
                )}
            >
                <Power className="h-4 w-4 mr-2" />
                {collaborator.status === 'ATIVO' ? "Desativar" : "Ativar"}
            </Button>
            <Button 
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5"
            >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info - Left Column */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-b from-primary/5 to-white">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{collaborator.nome_completo}</h2>
              <Badge 
                variant="secondary" 
                className={cn(
                  "mt-2 px-3 py-1 rounded-full font-bold border",
                  getStatusColor(collaborator.status)
                )}
              >
                {collaborator.status}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {role?.nome === 'motoboy' ? '🏍️ ' : ''}{role?.descricao || 'Colaborador'}
              </p>
            </CardContent>
            <CardContent className="border-t border-gray-100 space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">E-mail</p>
                  <p className="text-sm font-medium text-gray-700 truncate">{collaborator.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div className="w-full">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Documentos</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">CPF</p>
                        <p className="text-sm font-medium text-gray-700">{cpfMask(collaborator.cpf)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">RG</p>
                        <p className="text-sm font-medium text-gray-700">{collaborator.rg || '-'}</p>
                    </div>
                    {collaborator.cnpj && (
                         <div className="col-span-2">
                            <p className="text-[10px] text-muted-foreground font-semibold">CNPJ (MEI)</p>
                            <p className="text-sm font-medium text-gray-700">{cnpjMask(collaborator.cnpj)}</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>

               <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg shrink-0">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Nascimento</p>
                  <p className="text-sm font-medium text-gray-700">{collaborator.data_nascimento ? dateMask(collaborator.data_nascimento) : '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg shrink-0">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Telefone</p>
                  <p className="text-sm font-medium text-gray-700">{collaborator.telefone ? phoneMask(collaborator.telefone) : 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                   <div className="h-4 w-4 font-bold text-emerald-600 flex items-center justify-center text-[10px]">R$</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Chave PIX</p>
                  <p className="text-sm font-medium text-gray-700 break-all">{collaborator.chave_pix || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                  <p className="text-sm font-medium text-gray-700 leading-tight">{collaborator.endereco_completo || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {role?.id === 3 && (
            <Card className="border-0 shadow-sm rounded-3xl border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bike className="h-4 w-4 text-primary" />
                  Veículo & CNH
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Moto / Modelo</p>
                  <p className="text-sm font-bold">{collaborator.moto_modelo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Placa</p>
                  <Badge variant="outline" className="font-mono bg-yellow-50">{collaborator.moto_placa || '-'}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cor / Ano</p>
                  <p className="text-sm font-medium">{collaborator.moto_cor || '-'} / {collaborator.moto_ano || '-'}</p>
                </div>
                 <div>
                  <p className="text-xs text-muted-foreground">CNH</p>
                  <p className="text-sm font-medium">{collaborator.cnh_registro || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="text-sm font-medium">{collaborator.cnh_categoria || '-'}</p>
                </div>
                <div>
                   <p className="text-xs text-muted-foreground">Vencimento CNH</p>
                   <p className="text-sm font-medium">{collaborator.cnh_vencimento ? dateMask(collaborator.cnh_vencimento) : '-'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Turns Management - Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Vínculos & Turnos
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Configure onde e quando o colaborador trabalha.</p>
              </div>
              <Button onClick={handleAddTurn} size="sm" className="rounded-xl shadow-md shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Novo Vínculo
              </Button>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {!collaborator.links || collaborator.links.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-700">Nenhum turno configurado</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                    Este colaborador ainda não tem vínculos de trabalho atribuídos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collaborator.links.map((link, index) => (
                    <div 
                      key={link.id || index} 
                      className="group border border-gray-100 p-5 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative bg-gray-50/10"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl">
                          <Bike className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => handleEditTurn(link)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary rounded-lg">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDeleteTurn(link.id)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-lg">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cliente</p>
                          <h4 className="font-bold text-gray-800 leading-tight">
                            {link.cliente?.nome_fantasia || 'Cliente não identificado'}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Horário</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="bg-white border-primary/20 text-primary font-bold">
                                {link.hora_inicio?.substring(0, 5)} — {link.hora_fim?.substring(0, 5)}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empresa</p>
                            <p className="text-sm font-medium text-gray-600 mt-0.5">
                              {link.empresa?.nome_fantasia || link.empresa?.razao_social || 'EE'}
                            </p>
                          </div>
                        </div>

                        {link.valor_contrato && (
                          <div className="pt-3 mt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Valor Total</span>
                            <span className="text-sm font-extrabold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                (link.valor_contrato || 0) + 
                                (link.valor_aluguel || 0) + 
                                (link.valor_bonus || 0) + 
                                (link.ajuda_custo || 0)
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CollaboratorFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        collaboratorToEdit={collaborator}
        onSuccess={() => {
          setIsEditDialogOpen(false);
        }}
      />

      <CollaboratorTurnDialog
        open={isTurnDialogOpen}
        onOpenChange={setIsTurnDialogOpen}
        collaboratorId={id!}
        turnToEdit={turnToEdit}
        onSuccess={() => {
          setIsTurnDialogOpen(false);
        }}
      />
    </div>
  );
}
