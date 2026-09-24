import { ReactNode, useEffect, useState } from 'react';
import { LayoutContext, OpenConfirmationDialogProps, OpenConfirmarAdiantamentoDialogProps, OpenCollaboratorFormProps, OpenClientFormProps, OpenEmpresaFormProps, OpenPerfilFormProps, OpenMileageDialogProps, OpenCollaboratorTurnProps, OpenTimeRecordDetailsProps, OpenTimeRecordProps, OpenSuccessRegistrationProps, OpenOccurrenceFormProps, OpenFeriadoFormProps, OpenEndTurnProps, OpenOccurrenceDetailsProps, OpenPasswordGuardProps, OpenAlocarEquipamentoProps, OpenItemEquipamentoFormProps, OpenCategoriasProps, OpenAlocadosPorItemProps, OpenCreateTicketProps, OpenTicketDetailsProps, OpenConvenioFormProps, OpenFaturaFormProps, OpenLoteRecebimentoProps, OpenAcertoIntercompanyProps, OpenAlocacaoTemporariaProps, OpenContasBancariasProps, OpenDespesaFormProps, OpenMovimentacaoAvulsaFormProps, OpenUnidadeFormProps, OpenLancamentoConvenioFormProps, OpenFaturaFornecedorDialogProps, OpenGerenciarBloqueioConvenioProps } from './LayoutContext';
import { useDialogClose } from "@/hooks/ui/useDialogClose";

// Dialogs
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import { CollaboratorTurnDialog } from "@/components/dialogs/CollaboratorTurnDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ConfirmarAdiantamentoDialog from "@/components/dialogs/ConfirmarAdiantamentoDialog";

import { TimeRecordDialog } from "@/components/dialogs/TimeRecordDialog";
import { EmpresaFormDialog } from "@/components/dialogs/EmpresaFormDialog";
import { FeriadoFormDialog } from "@/components/dialogs/FeriadoFormDialog";
import { MileageDialog } from "@/components/dialogs/MileageDialog";
import { OccurrenceFormDialog } from "@/components/dialogs/OccurrenceFormDialog";
import { OccurrenceTypesDialog } from "@/components/dialogs/OccurrenceTypesDialog";
import { PerfilFormDialog } from "@/components/dialogs/PerfilFormDialog";
import { SuccessRegistrationDialog } from "@/components/dialogs/SuccessRegistrationDialog";
import { TimeRecordDetailsDialog } from "@/components/dialogs/TimeRecordDetailsDialog";
import AlterarSenhaDialog from "@/components/dialogs/AlterarSenhaDialog";
import EditarCadastroDialog from "@/components/dialogs/EditarCadastroDialog";
import { EndTurnDialog } from "@/components/dialogs/EndTurnDialog";
import { OccurrenceDetailsDialog } from "@/components/dialogs/OccurrenceDetailsDialog";
import { PasswordGuardDialog } from "@/components/dialogs/PasswordGuardDialog";
import { LocationTutorialDialog } from "@/components/dialogs/LocationTutorialDialog";
import { AlocarEquipamentoDialog } from "@/components/dialogs/AlocarEquipamentoDialog";
import { ItemEquipamentoFormDialog } from "@/components/dialogs/ItemEquipamentoFormDialog";
import { CategoriasDialog } from "@/components/dialogs/CategoriasDialog";
import { AlocadosPorItemDialog } from "@/components/dialogs/AlocadosPorItemDialog";
import { CreateTicketDialog } from "@/components/dialogs/CreateTicketDialog";
import { TicketDetailsDialog } from "@/components/dialogs/TicketDetailsDialog";
import { ConvenioFormDialog } from "@/components/dialogs/ConvenioFormDialog";
import { FaturaFormDialog } from "@/components/dialogs/FaturaFormDialog";
import { LoteRecebimentoDialog } from "@/components/dialogs/LoteRecebimentoDialog";
import { AcertoIntercompanyDialog } from "@/components/dialogs/AcertoIntercompanyDialog";
import { AlocacaoTemporariaDialog } from "@/components/dialogs/AlocacaoTemporariaDialog";
import { ContasBancariasDialog } from "@/components/dialogs/ContasBancariasDialog";
import { DespesaFormDialog } from "@/components/dialogs/DespesaFormDialog";
import { MovimentacaoAvulsaFormDialog } from "@/components/dialogs/MovimentacaoAvulsaFormDialog";
import { UnidadeFormDialog } from "@/components/dialogs/UnidadeFormDialog";
import { LancamentoForm } from "@/components/features/convenios/public/LancamentoForm";
import { FaturaFornecedorConvenioDialog } from "@/components/dialogs/FaturaFornecedorConvenioDialog";
import { GerenciarBloqueioConvenioDialog } from "@/components/dialogs/GerenciarBloqueioConvenioDialog";


export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Carregando...');
  const [pageSubtitle, setPageSubtitle] = useState('Por favor, aguarde.');
  const { closeDialog } = useDialogClose();

  // Sync document title with page title
  useEffect(() => {
    if (pageTitle && pageTitle !== 'Carregando...') {
      document.title = `${pageTitle} | Embu Express`;
    }
  }, [pageTitle]);

  // --- Dialog States ---
  const [confirmationDialogState, setConfirmationDialogState] = useState<{ open: boolean; props?: OpenConfirmationDialogProps }>({ open: false });
  const [confirmarAdiantamentoDialogState, setConfirmarAdiantamentoDialogState] = useState<{ open: boolean; props?: OpenConfirmarAdiantamentoDialogProps }>({ open: false });
  const [collaboratorFormDialogState, setCollaboratorFormDialogState] = useState<{ open: boolean; props?: OpenCollaboratorFormProps }>({ open: false });
  const [clientFormDialogState, setClientFormDialogState] = useState<{ open: boolean; props?: OpenClientFormProps }>({ open: false });
  const [empresaFormDialogState, setEmpresaFormDialogState] = useState<{ open: boolean; props?: OpenEmpresaFormProps }>({ open: false });
  const [perfilFormDialogState, setPerfilFormDialogState] = useState<{ open: boolean; props?: OpenPerfilFormProps }>({ open: false });
  const [mileageDialogState, setMileageDialogState] = useState<{ open: boolean; props?: OpenMileageDialogProps }>({ open: false });
  const [collaboratorTurnDialogState, setCollaboratorTurnDialogState] = useState<{ open: boolean; props?: OpenCollaboratorTurnProps }>({ open: false });
  const [timeRecordDetailsDialogState, setTimeRecordDetailsDialogState] = useState<{ open: boolean; props?: OpenTimeRecordDetailsProps }>({ open: false });
  const [timeRecordDialogState, setTimeRecordDialogState] = useState<{ open: boolean; props?: OpenTimeRecordProps }>({ open: false });
  const [successRegistrationDialogState, setSuccessRegistrationDialogState] = useState<{ open: boolean; props?: OpenSuccessRegistrationProps }>({ open: false });
  const [occurrenceFormDialogState, setOccurrenceFormDialogState] = useState<{ open: boolean; props?: OpenOccurrenceFormProps }>({ open: false });
  const [occurrenceTypesDialogState, setOccurrenceTypesDialogState] = useState({ open: false });
  const [feriadoFormDialogState, setFeriadoFormDialogState] = useState<{ open: boolean; props?: OpenFeriadoFormProps }>({ open: false });
  const [endTurnDialogState, setEndTurnDialogState] = useState<{ open: boolean; props?: OpenEndTurnProps }>({ open: false });
  const [occurrenceDetailsDialogState, setOccurrenceDetailsDialogState] = useState<{ open: boolean; props?: OpenOccurrenceDetailsProps }>({ open: false });
  const [alterarSenhaDialogState, setAlterarSenhaDialogState] = useState({ open: false });
  const [editarCadastroDialogState, setEditarCadastroDialogState] = useState({ open: false });
  const [passwordGuardDialogState, setPasswordGuardDialogState] = useState<{ open: boolean; props?: OpenPasswordGuardProps }>({ open: false });
  const [locationTutorialDialogState, setLocationTutorialDialogState] = useState({ open: false });
  const [alocarEquipamentoDialogState, setAlocarEquipamentoDialogState] = useState<{ open: boolean; props?: OpenAlocarEquipamentoProps }>({ open: false });
  const [itemEquipamentoFormDialogState, setItemEquipamentoFormDialogState] = useState<{ open: boolean; props?: OpenItemEquipamentoFormProps }>({ open: false });
  const [categoriasDialogState, setCategoriasDialogState] = useState<{ open: boolean; props?: OpenCategoriasProps }>({ open: false });
  const [alocadosPorItemDialogState, setAlocadosPorItemDialogState] = useState<{ open: boolean; props?: OpenAlocadosPorItemProps }>({ open: false });
  const [createTicketDialogState, setCreateTicketDialogState] = useState<{ open: boolean; props?: OpenCreateTicketProps }>({ open: false });
  const [ticketDetailsDialogState, setTicketDetailsDialogState] = useState<{ open: boolean; props?: OpenTicketDetailsProps }>({ open: false });
  const [convenioFormDialogState, setConvenioFormDialogState] = useState<{ open: boolean; props?: OpenConvenioFormProps }>({ open: false });
  const [faturaFormDialogState, setFaturaFormDialogState] = useState<{ open: boolean; props?: OpenFaturaFormProps }>({ open: false });
  const [loteRecebimentoDialogState, setLoteRecebimentoDialogState] = useState<{ open: boolean; props?: OpenLoteRecebimentoProps }>({ open: false });
  const [acertoIntercompanyDialogState, setAcertoIntercompanyDialogState] = useState<{ open: boolean; props?: OpenAcertoIntercompanyProps }>({ open: false });
  const [alocacaoTemporariaDialogState, setAlocacaoTemporariaDialogState] = useState<{ open: boolean; props?: OpenAlocacaoTemporariaProps }>({ open: false });
  const [contasBancariasDialogState, setContasBancariasDialogState] = useState<{ open: boolean; props?: OpenContasBancariasProps }>({ open: false });
  const [despesaFormDialogState, setDespesaFormDialogState] = useState<{ open: boolean; props?: OpenDespesaFormProps }>({ open: false });
  const [movimentacaoAvulsaDialogState, setMovimentacaoAvulsaDialogState] = useState<{ open: boolean; props?: OpenMovimentacaoAvulsaFormProps }>({ open: false });
  const [unidadeFormDialogState, setUnidadeFormDialogState] = useState<{ open: boolean; props?: OpenUnidadeFormProps }>({ open: false });
  const [lancamentoConvenioDialogState, setLancamentoConvenioDialogState] = useState<{ open: boolean; props?: OpenLancamentoConvenioFormProps }>({ open: false });
  const [faturaFornecedorDialogState, setFaturaFornecedorDialogState] = useState<{ open: boolean; props?: OpenFaturaFornecedorDialogProps }>({ open: false });
  const [gerenciarBloqueioConvenioDialogState, setGerenciarBloqueioConvenioDialogState] = useState<{ open: boolean; props?: OpenGerenciarBloqueioConvenioProps }>({ open: false });


  // --- Actions ---
  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => setConfirmationDialogState({ open: true, props });
  const closeConfirmationDialog = () => closeDialog(() => setConfirmationDialogState((prev) => ({ ...prev, open: false })));

  const openConfirmarAdiantamentoDialog = (props: OpenConfirmarAdiantamentoDialogProps) => setConfirmarAdiantamentoDialogState({ open: true, props });
  const closeConfirmarAdiantamentoDialog = () => closeDialog(() => setConfirmarAdiantamentoDialogState((prev) => ({ ...prev, open: false })));


  const openCollaboratorFormDialog = (props: OpenCollaboratorFormProps) => setCollaboratorFormDialogState({ open: true, props });
  const closeCollaboratorFormDialog = () => closeDialog(() => setCollaboratorFormDialogState((prev) => ({ ...prev, open: false })));

  const openClientFormDialog = (props: OpenClientFormProps) => setClientFormDialogState({ open: true, props });
  const closeClientFormDialog = () => closeDialog(() => setClientFormDialogState((prev) => ({ ...prev, open: false })));

  const openEmpresaFormDialog = (props: OpenEmpresaFormProps) => setEmpresaFormDialogState({ open: true, props });
  const closeEmpresaFormDialog = () => closeDialog(() => setEmpresaFormDialogState((prev) => ({ ...prev, open: false })));

  const openPerfilFormDialog = (props: OpenPerfilFormProps) => setPerfilFormDialogState({ open: true, props });
  const closePerfilFormDialog = () => closeDialog(() => setPerfilFormDialogState((prev) => ({ ...prev, open: false })));

  const openMileageDialog = (props: OpenMileageDialogProps) => setMileageDialogState({ open: true, props });
  const closeMileageDialog = () => closeDialog(() => setMileageDialogState((prev) => ({ ...prev, open: false })));

  const openCollaboratorTurnDialog = (props: OpenCollaboratorTurnProps) => setCollaboratorTurnDialogState({ open: true, props });
  const closeCollaboratorTurnDialog = () => closeDialog(() => setCollaboratorTurnDialogState((prev) => ({ ...prev, open: false })));

  const openTimeRecordDetailsDialog = (props: OpenTimeRecordDetailsProps) => setTimeRecordDetailsDialogState({ open: true, props });
  const closeTimeRecordDetailsDialog = () => closeDialog(() => setTimeRecordDetailsDialogState((prev) => ({ ...prev, open: false })));

  const openTimeRecordDialog = (props: OpenTimeRecordProps) => setTimeRecordDialogState({ open: true, props });
  const closeTimeRecordDialog = () => closeDialog(() => setTimeRecordDialogState((prev) => ({ ...prev, open: false })));

  const openSuccessRegistrationDialog = (props: OpenSuccessRegistrationProps) => setSuccessRegistrationDialogState({ open: true, props });
  const closeSuccessRegistrationDialog = () => closeDialog(() => setSuccessRegistrationDialogState((prev) => ({ ...prev, open: false })));

  const openOccurrenceFormDialog = (props: OpenOccurrenceFormProps) => setOccurrenceFormDialogState({ open: true, props });
  const closeOccurrenceFormDialog = () => closeDialog(() => setOccurrenceFormDialogState((prev) => ({ ...prev, open: false })));

  const openOccurrenceTypesDialog = () => setOccurrenceTypesDialogState({ open: true });
  const closeOccurrenceTypesDialog = () => closeDialog(() => setOccurrenceTypesDialogState({ open: false }));

  const openFeriadoFormDialog = (props: OpenFeriadoFormProps) => setFeriadoFormDialogState({ open: true, props });
  const closeFeriadoFormDialog = () => closeDialog(() => setFeriadoFormDialogState((prev) => ({ ...prev, open: false })));

  const openEndTurnDialog = (props: OpenEndTurnProps) => setEndTurnDialogState({ open: true, props });
  const closeEndTurnDialog = () => closeDialog(() => setEndTurnDialogState((prev) => ({ ...prev, open: false })));

  const openOccurrenceDetailsDialog = (props: OpenOccurrenceDetailsProps) => setOccurrenceDetailsDialogState({ open: true, props });
  const closeOccurrenceDetailsDialog = () => closeDialog(() => setOccurrenceDetailsDialogState((prev) => ({ ...prev, open: false })));

  const openAlterarSenhaDialog = () => setAlterarSenhaDialogState({ open: true });
  const closeAlterarSenhaDialog = () => closeDialog(() => setAlterarSenhaDialogState({ open: false }));

  const openEditarCadastroDialog = () => setEditarCadastroDialogState({ open: true });
  const closeEditarCadastroDialog = () => closeDialog(() => setEditarCadastroDialogState({ open: false }));

  const openPasswordGuardDialog = (props: OpenPasswordGuardProps) => setPasswordGuardDialogState({ open: true, props });
  const closePasswordGuardDialog = () => closeDialog(() => setPasswordGuardDialogState((prev) => ({ ...prev, open: false })));

  const openLocationTutorialDialog = () => setLocationTutorialDialogState({ open: true });
  const closeLocationTutorialDialog = () => setLocationTutorialDialogState({ open: false });

  const openAlocarEquipamentoDialog = (props: OpenAlocarEquipamentoProps) => setAlocarEquipamentoDialogState({ open: true, props });
  const closeAlocarEquipamentoDialog = () => closeDialog(() => setAlocarEquipamentoDialogState((prev) => ({ ...prev, open: false })));

  const openItemEquipamentoFormDialog = (props: OpenItemEquipamentoFormProps) => setItemEquipamentoFormDialogState({ open: true, props });
  const closeItemEquipamentoFormDialog = () => closeDialog(() => setItemEquipamentoFormDialogState((prev) => ({ ...prev, open: false })));

  const openCategoriasDialog = (props: OpenCategoriasProps) => setCategoriasDialogState({ open: true, props });
  const closeCategoriasDialog = () => closeDialog(() => setCategoriasDialogState((prev) => ({ ...prev, open: false })));

  const openAlocadosPorItemDialog = (props: OpenAlocadosPorItemProps) => setAlocadosPorItemDialogState({ open: true, props });
  const closeAlocadosPorItemDialog = () => closeDialog(() => setAlocadosPorItemDialogState((prev) => ({ ...prev, open: false })));

  const openCreateTicketDialog = (props: OpenCreateTicketProps) => setCreateTicketDialogState({ open: true, props });
  const closeCreateTicketDialog = () => closeDialog(() => setCreateTicketDialogState((prev) => ({ ...prev, open: false })));

  const openTicketDetailsDialog = (props: OpenTicketDetailsProps) => setTicketDetailsDialogState({ open: true, props });
  const closeTicketDetailsDialog = () => closeDialog(() => setTicketDetailsDialogState((prev) => ({ ...prev, open: false })));

  const openConvenioFormDialog = (props: OpenConvenioFormProps) => setConvenioFormDialogState({ open: true, props });
  const closeConvenioFormDialog = () => closeDialog(() => setConvenioFormDialogState((prev) => ({ ...prev, open: false })));

  const openFaturaFormDialog = (props: OpenFaturaFormProps) => setFaturaFormDialogState({ open: true, props });
  const closeFaturaFormDialog = () => closeDialog(() => setFaturaFormDialogState((prev) => ({ ...prev, open: false })));

  const openLoteRecebimentoDialog = (props: OpenLoteRecebimentoProps) => setLoteRecebimentoDialogState({ open: true, props });
  const closeLoteRecebimentoDialog = () => closeDialog(() => setLoteRecebimentoDialogState((prev) => ({ ...prev, open: false })));

  const openAcertoIntercompanyDialog = (props: OpenAcertoIntercompanyProps) => setAcertoIntercompanyDialogState({ open: true, props });
  const closeAcertoIntercompanyDialog = () => closeDialog(() => setAcertoIntercompanyDialogState((prev) => ({ ...prev, open: false })));

  const openAlocacaoTemporariaDialog = (props: OpenAlocacaoTemporariaProps) => setAlocacaoTemporariaDialogState({ open: true, props });
  const closeAlocacaoTemporariaDialog = () => closeDialog(() => setAlocacaoTemporariaDialogState((prev) => ({ ...prev, open: false })));

  const openContasBancariasDialog = (props?: OpenContasBancariasProps) => setContasBancariasDialogState({ open: true, props });
  const closeContasBancariasDialog = () => closeDialog(() => setContasBancariasDialogState((prev) => ({ ...prev, open: false })));

  const openDespesaFormDialog = (props?: OpenDespesaFormProps) => setDespesaFormDialogState({ open: true, props });
  const closeDespesaFormDialog = () => closeDialog(() => setDespesaFormDialogState((prev) => ({ ...prev, open: false })));

  const openMovimentacaoAvulsaDialog = (props?: OpenMovimentacaoAvulsaFormProps) => setMovimentacaoAvulsaDialogState({ open: true, props });
  const closeMovimentacaoAvulsaDialog = () => closeDialog(() => setMovimentacaoAvulsaDialogState((prev) => ({ ...prev, open: false })));

  const openUnidadeFormDialog = (props: OpenUnidadeFormProps) => setUnidadeFormDialogState({ open: true, props });
  const closeUnidadeFormDialog = () => closeDialog(() => setUnidadeFormDialogState((prev) => ({ ...prev, open: false })));

  const openLancamentoConvenioDialog = (props: OpenLancamentoConvenioFormProps) => setLancamentoConvenioDialogState({ open: true, props });
  const closeLancamentoConvenioDialog = () => closeDialog(() => setLancamentoConvenioDialogState((prev) => ({ ...prev, open: false })));

  const openFaturaFornecedorDialog = (props: OpenFaturaFornecedorDialogProps) => setFaturaFornecedorDialogState({ open: true, props });
  const closeFaturaFornecedorDialog = () => closeDialog(() => setFaturaFornecedorDialogState((prev) => ({ ...prev, open: false })));

  const openGerenciarBloqueioConvenioDialog = (props: OpenGerenciarBloqueioConvenioProps) => setGerenciarBloqueioConvenioDialogState({ open: true, props });
  const closeGerenciarBloqueioConvenioDialog = () => closeDialog(() => setGerenciarBloqueioConvenioDialogState((prev) => ({ ...prev, open: false })));


  return (
    <LayoutContext.Provider value={{
      pageTitle, setPageTitle, pageSubtitle, setPageSubtitle,
      openConfirmationDialog, closeConfirmationDialog,
      openConfirmarAdiantamentoDialog, closeConfirmarAdiantamentoDialog,
      openCollaboratorFormDialog, closeCollaboratorFormDialog,
      openClientFormDialog, closeClientFormDialog,
      openEmpresaFormDialog, closeEmpresaFormDialog,
      openPerfilFormDialog, closePerfilFormDialog,
      openMileageDialog, closeMileageDialog,
      openCollaboratorTurnDialog, closeCollaboratorTurnDialog,
      openTimeRecordDetailsDialog, closeTimeRecordDetailsDialog,
      openTimeRecordDialog, closeTimeRecordDialog,
      openSuccessRegistrationDialog, closeSuccessRegistrationDialog,
      openOccurrenceFormDialog, closeOccurrenceFormDialog,
      openOccurrenceTypesDialog, closeOccurrenceTypesDialog,
      openFeriadoFormDialog, closeFeriadoFormDialog,
      openEndTurnDialog, closeEndTurnDialog,
      openOccurrenceDetailsDialog, closeOccurrenceDetailsDialog,
      openAlterarSenhaDialog, closeAlterarSenhaDialog,
      openEditarCadastroDialog, closeEditarCadastroDialog,
      openPasswordGuardDialog, closePasswordGuardDialog,
      openLocationTutorialDialog, closeLocationTutorialDialog,
      openAlocarEquipamentoDialog, closeAlocarEquipamentoDialog,
      openItemEquipamentoFormDialog, closeItemEquipamentoFormDialog,
      openCategoriasDialog, closeCategoriasDialog,
      openAlocadosPorItemDialog, closeAlocadosPorItemDialog,
      openCreateTicketDialog, closeCreateTicketDialog,
      openTicketDetailsDialog, closeTicketDetailsDialog,
      openConvenioFormDialog, closeConvenioFormDialog,
      openFaturaFormDialog, closeFaturaFormDialog,
      openLoteRecebimentoDialog, closeLoteRecebimentoDialog,
      openAcertoIntercompanyDialog, closeAcertoIntercompanyDialog,
      openAlocacaoTemporariaDialog, closeAlocacaoTemporariaDialog,
      openContasBancariasDialog, closeContasBancariasDialog,
      openDespesaFormDialog, closeDespesaFormDialog,
      openMovimentacaoAvulsaDialog, closeMovimentacaoAvulsaDialog,
      openUnidadeFormDialog, closeUnidadeFormDialog,
      openLancamentoConvenioDialog, closeLancamentoConvenioDialog,
      openFaturaFornecedorDialog, closeFaturaFornecedorDialog,
      openGerenciarBloqueioConvenioDialog, closeGerenciarBloqueioConvenioDialog,
    }}>
      {children}
      {confirmationDialogState.props && <ConfirmationDialog open={confirmationDialogState.open} onOpenChange={(open) => setConfirmationDialogState((prev) => ({ ...prev, open }))} title={confirmationDialogState.props.title} description={confirmationDialogState.props.description} onConfirm={confirmationDialogState.props.onConfirm} confirmText={confirmationDialogState.props.confirmText} cancelText={confirmationDialogState.props.cancelText} variant={confirmationDialogState.props.variant} isLoading={confirmationDialogState.props.isLoading} />}
      {confirmarAdiantamentoDialogState.props && <ConfirmarAdiantamentoDialog open={confirmarAdiantamentoDialogState.open} onOpenChange={(open) => setConfirmarAdiantamentoDialogState((prev) => ({ ...prev, open }))} valorSugerido={confirmarAdiantamentoDialogState.props.valorSugerido} onConfirm={confirmarAdiantamentoDialogState.props.onConfirm} isLoading={confirmarAdiantamentoDialogState.props.isLoading} />}

      {collaboratorFormDialogState.open && <CollaboratorFormDialog open={true} onOpenChange={(open) => !open && setCollaboratorFormDialogState(prev => ({ ...prev, open: false }))} onSuccess={(data) => { collaboratorFormDialogState.props?.onSuccess?.(data); setCollaboratorFormDialogState(prev => ({ ...prev, open: false })); }} collaboratorToEdit={collaboratorFormDialogState.props?.editingCollaborator} />}
      {clientFormDialogState.open && <ClientFormDialog isOpen={true} onClose={closeClientFormDialog} editingClient={clientFormDialogState.props?.editingClient} onSuccess={() => { clientFormDialogState.props?.onSuccess?.(); closeClientFormDialog(); }} />}
      {empresaFormDialogState.open && <EmpresaFormDialog open={true} onOpenChange={(open) => !open && closeEmpresaFormDialog()} empresaToEdit={empresaFormDialogState.props?.empresaToEdit} />}
      {perfilFormDialogState.open && <PerfilFormDialog open={true} onOpenChange={(open) => !open && closePerfilFormDialog()} perfilToEdit={perfilFormDialogState.props?.perfilToEdit} />}
      {mileageDialogState.open && <MileageDialog open={true} onClose={closeMileageDialog} onConfirm={(km) => { mileageDialogState.props?.onConfirm(km); closeMileageDialog(); }} title={mileageDialogState.props?.title || ""} description={mileageDialogState.props?.description || ""} lastKm={mileageDialogState.props?.lastKm} />}
      {collaboratorTurnDialogState.open && <CollaboratorTurnDialog open={true} onOpenChange={(open) => !open && closeCollaboratorTurnDialog()} collaboratorId={collaboratorTurnDialogState.props?.collaboratorId || ""} turnToEdit={collaboratorTurnDialogState.props?.turnToEdit} onSuccess={() => { collaboratorTurnDialogState.props?.onSuccess?.(); closeCollaboratorTurnDialog(); }} />}
      {timeRecordDetailsDialogState.open && timeRecordDetailsDialogState.props?.record && <TimeRecordDetailsDialog isOpen={true} onClose={closeTimeRecordDetailsDialog} record={timeRecordDetailsDialogState.props.record} onEdit={(record) => { timeRecordDetailsDialogState.props?.onEdit?.(record); }} onDelete={(record) => { timeRecordDetailsDialogState.props?.onDelete?.(record); }} />}
      {timeRecordDialogState.open && <TimeRecordDialog isOpen={true} onClose={closeTimeRecordDialog} record={timeRecordDialogState.props?.record} />}
      {successRegistrationDialogState.open && successRegistrationDialogState.props?.collaborator && <SuccessRegistrationDialog open={true} onOpenChange={(open) => !open && closeSuccessRegistrationDialog()} collaborator={successRegistrationDialogState.props.collaborator} title={successRegistrationDialogState.props.title} description={successRegistrationDialogState.props.description} hideNewCollaboratorButton={successRegistrationDialogState.props.hideNewCollaboratorButton} hideTurnButton={successRegistrationDialogState.props.hideTurnButton} onOpenCollaboratorForm={() => openCollaboratorFormDialog({ mode: "create" })} />}
      {occurrenceFormDialogState.open && <OccurrenceFormDialog open={true} onOpenChange={(open) => !open && closeOccurrenceFormDialog()} collaboratorId={occurrenceFormDialogState.props?.collaboratorId} defaultValues={occurrenceFormDialogState.props?.defaultValues} mode={occurrenceFormDialogState.props?.mode} onSuccess={() => { occurrenceFormDialogState.props?.onSuccess?.(); closeOccurrenceFormDialog(); }} />}
      {occurrenceTypesDialogState.open && <OccurrenceTypesDialog open={true} onOpenChange={(open) => !open && closeOccurrenceTypesDialog()} />}
      {feriadoFormDialogState.open && <FeriadoFormDialog open={true} onOpenChange={(open) => !open && closeFeriadoFormDialog()} feriadoToEdit={feriadoFormDialogState.props?.feriadoToEdit} />}
      {endTurnDialogState.open && endTurnDialogState.props && <EndTurnDialog open={true} onOpenChange={(open) => !open && closeEndTurnDialog()} turnId={endTurnDialogState.props.turnId} collaboratorId={endTurnDialogState.props.collaboratorId} clientName={endTurnDialogState.props.clientName} onSuccess={endTurnDialogState.props.onSuccess} />}
      {occurrenceDetailsDialogState.open && occurrenceDetailsDialogState.props?.occurrence && <OccurrenceDetailsDialog open={true} onOpenChange={(open) => !open && closeOccurrenceDetailsDialog()} occurrence={occurrenceDetailsDialogState.props.occurrence} onDelete={occurrenceDetailsDialogState.props.onDelete} onEdit={occurrenceDetailsDialogState.props.onEdit} />}
      {alterarSenhaDialogState.open && <AlterarSenhaDialog isOpen={true} onClose={closeAlterarSenhaDialog} />}
      {editarCadastroDialogState.open && <EditarCadastroDialog isOpen={true} onClose={closeEditarCadastroDialog} />}
      {passwordGuardDialogState.open && passwordGuardDialogState.props && <PasswordGuardDialog open={true} onSuccess={() => { passwordGuardDialogState.props?.onSuccess?.(); closePasswordGuardDialog(); }} />}
      {locationTutorialDialogState.open && <LocationTutorialDialog isOpen={true} onClose={closeLocationTutorialDialog} />}
      {alocarEquipamentoDialogState.open && <AlocarEquipamentoDialog open={true} onOpenChange={(open) => !open && closeAlocarEquipamentoDialog()} {...alocarEquipamentoDialogState.props} />}
      {itemEquipamentoFormDialogState.open && <ItemEquipamentoFormDialog open={true} onOpenChange={(open) => !open && closeItemEquipamentoFormDialog()} itemToEdit={itemEquipamentoFormDialogState.props?.itemToEdit} />}
      {categoriasDialogState.open && <CategoriasDialog open={true} onOpenChange={(open) => !open && closeCategoriasDialog()} />}
      {alocadosPorItemDialogState.open && alocadosPorItemDialogState.props && <AlocadosPorItemDialog open={true} onOpenChange={(open) => !open && closeAlocadosPorItemDialog()} itemId={alocadosPorItemDialogState.props.itemId} itemName={alocadosPorItemDialogState.props.itemName} />}
      {createTicketDialogState.open && <CreateTicketDialog open={true} onOpenChange={(open) => !open && closeCreateTicketDialog()} ticketToEdit={createTicketDialogState.props?.ticketToEdit} onSuccess={() => { createTicketDialogState.props?.onSuccess?.(); closeCreateTicketDialog(); }} />}
      {ticketDetailsDialogState.open && ticketDetailsDialogState.props?.ticketId && <TicketDetailsDialog open={true} onOpenChange={(open) => !open && closeTicketDetailsDialog()} ticketId={ticketDetailsDialogState.props.ticketId} onSuccess={() => { ticketDetailsDialogState.props?.onSuccess?.(); }} />}
      {convenioFormDialogState.open && <ConvenioFormDialog open={true} onOpenChange={(open) => !open && closeConvenioFormDialog()} convenioToEdit={convenioFormDialogState.props?.convenioToEdit} />}
      {faturaFormDialogState.open && <FaturaFormDialog open={true} onOpenChange={(open) => !open && closeFaturaFormDialog()} faturaToEdit={faturaFormDialogState.props?.faturaToEdit} onSuccess={faturaFormDialogState.props?.onSuccess} />}
      {loteRecebimentoDialogState.open && <LoteRecebimentoDialog open={true} onOpenChange={(open) => !open && closeLoteRecebimentoDialog()} onSuccess={loteRecebimentoDialogState.props?.onSuccess} />}
      {acertoIntercompanyDialogState.open && acertoIntercompanyDialogState.props?.transferencia && <AcertoIntercompanyDialog open={true} onOpenChange={(open) => !open && closeAcertoIntercompanyDialog()} transferencia={acertoIntercompanyDialogState.props.transferencia} onSuccess={acertoIntercompanyDialogState.props.onSuccess} />}
      {alocacaoTemporariaDialogState.open && <AlocacaoTemporariaDialog open={true} onOpenChange={(open) => !open && closeAlocacaoTemporariaDialog()} onSuccess={alocacaoTemporariaDialogState.props?.onSuccess} />}
      {contasBancariasDialogState.open && <ContasBancariasDialog open={true} onOpenChange={(open) => !open && closeContasBancariasDialog()} empresaIdInicial={contasBancariasDialogState.props?.empresaIdInicial} />}
      {despesaFormDialogState.open && <DespesaFormDialog open={true} onOpenChange={(open) => !open && closeDespesaFormDialog()} despesaToEdit={despesaFormDialogState.props?.despesaToEdit} onSuccess={despesaFormDialogState.props?.onSuccess} />}
      {movimentacaoAvulsaDialogState.open && <MovimentacaoAvulsaFormDialog open={true} onOpenChange={(open) => !open && closeMovimentacaoAvulsaDialog()} movimentacaoToEdit={movimentacaoAvulsaDialogState.props?.movimentacaoToEdit} onSuccess={movimentacaoAvulsaDialogState.props?.onSuccess} />}
      {unidadeFormDialogState.open && unidadeFormDialogState.props && <UnidadeFormDialog isOpen={true} onClose={closeUnidadeFormDialog} clienteId={unidadeFormDialogState.props.clienteId} editingUnidade={unidadeFormDialogState.props.editingUnidade} onSuccess={() => { unidadeFormDialogState.props?.onSuccess?.(); closeUnidadeFormDialog(); }} />}
      {lancamentoConvenioDialogState.open && <LancamentoForm open={true} onOpenChange={(open) => !open && closeLancamentoConvenioDialog()} convenioId={lancamentoConvenioDialogState.props?.convenioId} token={lancamentoConvenioDialogState.props?.token} lancamentoToEdit={lancamentoConvenioDialogState.props?.lancamentoToEdit} />}
      {faturaFornecedorDialogState.open && faturaFornecedorDialogState.props && <FaturaFornecedorConvenioDialog open={true} onOpenChange={(open) => !open && closeFaturaFornecedorDialog()} {...faturaFornecedorDialogState.props} onSuccess={() => { faturaFornecedorDialogState.props?.onSuccess?.(); closeFaturaFornecedorDialog(); }} />}
      {gerenciarBloqueioConvenioDialogState.open && gerenciarBloqueioConvenioDialogState.props && <GerenciarBloqueioConvenioDialog open={true} onOpenChange={(open) => !open && closeGerenciarBloqueioConvenioDialog()} {...gerenciarBloqueioConvenioDialogState.props} />}
    </LayoutContext.Provider>
  );
};
