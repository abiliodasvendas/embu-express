import { CollaboratorItemsView } from "@/components/features/collaborator/CollaboratorItemsView";
import {
  CollaboratorDadosTab,
  CollaboratorDetailsHeader,
  CollaboratorFinanceiroTab,
  CollaboratorOcorrenciasTab,
  CollaboratorPontoTab,
  CollaboratorTurnosTab,
} from "@/components/features/collaborator/details";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollaboratorDetailsViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { OccurrenceFormMode } from "@/types/enums";
import { cpfMask } from "@/utils/masks";
import { Clock, History, Package, User, Wallet } from "lucide-react";

export default function CollaboratorDetails() {
  const vm = useCollaboratorDetailsViewModel();

  if (vm.isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-1 border rounded-[24px]" />
          <Skeleton className="h-[600px] lg:col-span-2 border rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (!vm.collaborator) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Colaborador não encontrado.</p>
        <Button onClick={() => vm.navigate("/colaboradores")} variant="link">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CollaboratorDetailsHeader
        collaborator={vm.collaborator}
        roleName={vm.role?.nome}
        possuiItens={vm.possuiItens}
        bloqueioData={vm.bloqueioData}
        editAction={vm.editAction}
        statusAction={vm.statusAction}
        resetAction={vm.resetAction}
        deleteAction={vm.deleteAction}
        onOpenGerenciarConvenios={vm.handleOpenGerenciarConvenios}
      />

      <Tabs value={vm.activeTab} onValueChange={vm.handleTabChange} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none] print:hidden">
          <TabsTrigger
            value="dados"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <User className="h-4 w-4" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger
            value="turnos"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Clock className="h-4 w-4" />
            <span>Turnos</span>
          </TabsTrigger>
          <TabsTrigger
            value="itens"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Package className="h-4 w-4" />
            <span>Itens</span>
          </TabsTrigger>
          <TabsTrigger
            value="ocorrencias"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <History className="h-4 w-4" />
            <span>Ocorrências</span>
          </TabsTrigger>
          <TabsTrigger
            value="ponto"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Clock className="h-4 w-4" />
            <span>Atividade</span>
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Wallet className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="dados"
          forceMount
          className={cn(
            "space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300",
            vm.activeTab !== "dados" && "hidden"
          )}
        >
          <CollaboratorDadosTab collaborator={vm.collaborator} roleName={vm.role?.nome} />
        </TabsContent>

        <TabsContent
          value="turnos"
          forceMount
          className={cn(
            "mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6",
            vm.activeTab !== "turnos" && "hidden"
          )}
        >
          <CollaboratorTurnosTab
            activeLinks={vm.activeLinks}
            closedLinks={vm.closedLinks}
            onAddTurn={vm.handleAddTurn}
            onEditTurn={vm.handleEditTurn}
            onEndTurn={vm.handleEndTurn}
            onReactivateTurn={vm.handleReactivateTurn}
            onDeleteTurn={vm.handleDeleteTurn}
          />
        </TabsContent>

        <TabsContent
          value="itens"
          forceMount
          className={cn(
            "mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300",
            vm.activeTab !== "itens" && "hidden"
          )}
        >
          <CollaboratorItemsView colaboradorId={vm.id!} />
        </TabsContent>

        <TabsContent
          value="ocorrencias"
          forceMount
          className={cn(
            "mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300",
            vm.activeTab !== "ocorrencias" && "hidden"
          )}
        >
          <CollaboratorOcorrenciasTab
            colaboradorId={vm.id!}
            selectedMes={vm.filters.selectedMes}
            selectedAno={vm.filters.selectedAno}
            onSelectMes={(mes) => vm.filters.setSelectedMes?.(mes)}
            onSelectAno={(ano) => vm.filters.setSelectedAno?.(ano)}
            onRegisterOccurrence={() =>
              vm.openOccurrenceFormDialog({
                collaboratorId: vm.id,
                mode: OccurrenceFormMode.GENERAL,
                onSuccess: () => vm.financeiroVm.refetch(),
              })
            }
            onOccurrenceDeleted={() => vm.financeiroVm.refetch()}
          />
        </TabsContent>

        <TabsContent
          value="ponto"
          forceMount
          className={cn(
            "mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300",
            vm.activeTab !== "ponto" && "hidden"
          )}
        >
          <CollaboratorPontoTab
            colaboradorId={vm.id!}
            colaboradorNome={vm.collaborator.nome_completo}
            cpf={vm.collaborator.cpf ? cpfMask(vm.collaborator.cpf) : undefined}
            cargo={vm.role?.nome}
            selectedMes={vm.filters.selectedMes}
            selectedAno={vm.filters.selectedAno}
            selectedShift={vm.pontoVm.filters.selectedTurno}
            availableShifts={vm.pontoVm.availableShifts}
            onSelectMes={(mes) => vm.filters.setSelectedMes?.(mes)}
            onSelectAno={(ano) => vm.filters.setSelectedAno?.(ano)}
            onSelectShift={(shiftId) => vm.pontoVm.setShift?.(shiftId)}
          />
        </TabsContent>

        <TabsContent
          value="financeiro"
          forceMount
          className={cn(
            "mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300",
            vm.activeTab !== "financeiro" && "hidden"
          )}
        >
          <CollaboratorFinanceiroTab
            colaboradorId={vm.id!}
            colaboradorNome={vm.collaborator.nome_completo}
            cpf={vm.collaborator.cpf ? cpfMask(vm.collaborator.cpf) : undefined}
            cargo={vm.role?.nome}
            selectedMes={vm.filters.selectedMes}
            selectedAno={vm.filters.selectedAno}
            modoComprovanteRenda={vm.modoComprovanteRenda}
            onSelectMes={(mes) => vm.filters.setSelectedMes?.(mes)}
            onSelectAno={(ano) => vm.filters.setSelectedAno?.(ano)}
            onRegisterOccurrence={() =>
              vm.openOccurrenceFormDialog({
                collaboratorId: vm.id,
                mode: OccurrenceFormMode.FINANCIAL,
                onSuccess: () => vm.financeiroVm.refetch(),
              })
            }
            onToggleModoComprovanteRenda={() =>
              vm.setModoComprovanteRenda((prev) => !prev)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
