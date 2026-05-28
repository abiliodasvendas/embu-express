import { ReactNode, useEffect, useState } from 'react';
import { LayoutContext, OpenConfirmationDialogProps, OpenCollaboratorFormProps, OpenClientFormProps, OpenEmpresaFormProps, OpenPerfilFormProps, OpenMileageDialogProps, OpenCollaboratorTurnProps, OpenTimeRecordDetailsProps, OpenTimeRecordProps, OpenSuccessRegistrationProps, OpenOccurrenceFormProps, OpenFeriadoFormProps, OpenEndTurnProps, OpenOccurrenceDetailsProps, OpenPasswordGuardProps, OpenAlocarEquipamentoProps, OpenItemEquipamentoFormProps, OpenCategoriasProps, OpenAlocadosPorItemProps } from './LayoutContext';
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useDialogClose } from "@/hooks/ui/useDialogClose";

// Dialogs
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import { CollaboratorTurnDialog } from "@/components/dialogs/CollaboratorTurnDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
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

  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  // --- Dialog States ---
  const [confirmationDialogState, setConfirmationDialogState] = useState<{ open: boolean; props?: OpenConfirmationDialogProps }>({ open: false });
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

  // --- Actions ---
  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => setConfirmationDialogState({ open: true, props });
  const closeConfirmationDialog = () => closeDialog(() => setConfirmationDialogState((prev) => ({ ...prev, open: false })));

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

  return (
    <LayoutContext.Provider value={{
      pageTitle, setPageTitle, pageSubtitle, setPageSubtitle,
      openConfirmationDialog, closeConfirmationDialog,
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
    }}>
      {children}
      {confirmationDialogState.props && <ConfirmationDialog open={confirmationDialogState.open} onOpenChange={(open) => setConfirmationDialogState((prev) => ({ ...prev, open }))} title={confirmationDialogState.props.title} description={confirmationDialogState.props.description} onConfirm={confirmationDialogState.props.onConfirm} confirmText={confirmationDialogState.props.confirmText} cancelText={confirmationDialogState.props.cancelText} variant={confirmationDialogState.props.variant} isLoading={confirmationDialogState.props.isLoading} />}
      {collaboratorFormDialogState.open && <CollaboratorFormDialog open={true} onOpenChange={(open) => !open && setCollaboratorFormDialogState(prev => ({ ...prev, open: false }))} onSuccess={(data) => { collaboratorFormDialogState.props?.onSuccess?.(data); setCollaboratorFormDialogState(prev => ({ ...prev, open: false })); }} collaboratorToEdit={collaboratorFormDialogState.props?.editingCollaborator} />}
      {clientFormDialogState.open && <ClientFormDialog isOpen={true} onClose={closeClientFormDialog} editingClient={clientFormDialogState.props?.editingClient} onSuccess={() => { clientFormDialogState.props?.onSuccess?.(); closeClientFormDialog(); }} />}
      {empresaFormDialogState.open && <EmpresaFormDialog open={true} onOpenChange={(open) => !open && closeEmpresaFormDialog()} empresaToEdit={empresaFormDialogState.props?.empresaToEdit} />}
      {perfilFormDialogState.open && <PerfilFormDialog open={true} onOpenChange={(open) => !open && closePerfilFormDialog()} perfilToEdit={perfilFormDialogState.props?.perfilToEdit} />}
      {mileageDialogState.open && <MileageDialog open={true} onClose={closeMileageDialog} onConfirm={(km) => { mileageDialogState.props?.onConfirm(km); closeMileageDialog(); }} title={mileageDialogState.props?.title || ""} description={mileageDialogState.props?.description || ""} lastKm={mileageDialogState.props?.lastKm} />}
      {collaboratorTurnDialogState.open && <CollaboratorTurnDialog open={true} onOpenChange={(open) => !open && closeCollaboratorTurnDialog()} collaboratorId={collaboratorTurnDialogState.props?.collaboratorId || ""} turnToEdit={collaboratorTurnDialogState.props?.turnToEdit} onSuccess={() => { collaboratorTurnDialogState.props?.onSuccess?.(); closeCollaboratorTurnDialog(); }} />}
      {timeRecordDetailsDialogState.open && timeRecordDetailsDialogState.props?.record && <TimeRecordDetailsDialog isOpen={true} onClose={closeTimeRecordDetailsDialog} record={timeRecordDetailsDialogState.props.record} onEdit={(record) => { timeRecordDetailsDialogState.props?.onEdit?.(record); }} onDelete={(record) => { timeRecordDetailsDialogState.props?.onDelete?.(record); }} />}
      {timeRecordDialogState.open && <TimeRecordDialog isOpen={true} onClose={closeTimeRecordDialog} record={timeRecordDialogState.props?.record} />}
      {successRegistrationDialogState.open && successRegistrationDialogState.props?.collaborator && <SuccessRegistrationDialog open={true} onOpenChange={(open) => !open && closeSuccessRegistrationDialog()} collaborator={successRegistrationDialogState.props.collaborator} title={successRegistrationDialogState.props.title} description={successRegistrationDialogState.props.description} hideNewCollaboratorButton={successRegistrationDialogState.props.hideNewCollaboratorButton} onOpenCollaboratorForm={() => openCollaboratorFormDialog({ mode: "create" })} />}
      {occurrenceFormDialogState.open && <OccurrenceFormDialog open={true} onOpenChange={(open) => !open && closeOccurrenceFormDialog()} collaboratorId={occurrenceFormDialogState.props?.collaboratorId} onSuccess={() => { occurrenceFormDialogState.props?.onSuccess?.(); closeOccurrenceFormDialog(); }} />}
      {occurrenceTypesDialogState.open && <OccurrenceTypesDialog open={true} onOpenChange={(open) => !open && closeOccurrenceTypesDialog()} />}
      {feriadoFormDialogState.open && <FeriadoFormDialog open={true} onOpenChange={(open) => !open && closeFeriadoFormDialog()} feriadoToEdit={feriadoFormDialogState.props?.feriadoToEdit} />}
      {endTurnDialogState.open && endTurnDialogState.props && <EndTurnDialog open={true} onOpenChange={(open) => !open && closeEndTurnDialog()} turnId={endTurnDialogState.props.turnId} collaboratorId={endTurnDialogState.props.collaboratorId} clientName={endTurnDialogState.props.clientName} onSuccess={endTurnDialogState.props.onSuccess} />}
      {occurrenceDetailsDialogState.open && occurrenceDetailsDialogState.props?.occurrence && <OccurrenceDetailsDialog open={true} onOpenChange={(open) => !open && closeOccurrenceDetailsDialog()} occurrence={occurrenceDetailsDialogState.props.occurrence} onDelete={occurrenceDetailsDialogState.props.onDelete} />}
      {alterarSenhaDialogState.open && <AlterarSenhaDialog isOpen={true} onClose={closeAlterarSenhaDialog} />}
      {editarCadastroDialogState.open && <EditarCadastroDialog isOpen={true} onClose={closeEditarCadastroDialog} />}
      {passwordGuardDialogState.open && passwordGuardDialogState.props && <PasswordGuardDialog open={true} onSuccess={() => { passwordGuardDialogState.props?.onSuccess?.(); closePasswordGuardDialog(); }} />}
      {locationTutorialDialogState.open && <LocationTutorialDialog isOpen={true} onClose={closeLocationTutorialDialog} />}
      {alocarEquipamentoDialogState.open && <AlocarEquipamentoDialog open={true} onOpenChange={(open) => !open && closeAlocarEquipamentoDialog()} {...alocarEquipamentoDialogState.props} />}
      {itemEquipamentoFormDialogState.open && <ItemEquipamentoFormDialog open={true} onOpenChange={(open) => !open && closeItemEquipamentoFormDialog()} itemToEdit={itemEquipamentoFormDialogState.props?.itemToEdit} />}
      {categoriasDialogState.open && <CategoriasDialog open={true} onOpenChange={(open) => !open && closeCategoriasDialog()} />}
      {alocadosPorItemDialogState.open && alocadosPorItemDialogState.props && <AlocadosPorItemDialog open={true} onOpenChange={(open) => !open && closeAlocadosPorItemDialog()} itemId={alocadosPorItemDialogState.props.itemId} itemName={alocadosPorItemDialogState.props.itemName} />}
    </LayoutContext.Provider>
  );
};
