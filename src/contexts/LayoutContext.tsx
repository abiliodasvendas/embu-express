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
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useDialogClose } from "@/hooks/ui/useDialogClose";
import { Client, ColaboradorCliente, Usuario as Collaborator, Empresa, Feriado, Ocorrencia, Perfil, RegistroPonto } from '@/types/database';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ForgotPasswordDialog } from "@/components/dialogs/ForgotPasswordDialog";

// --- Interfaces ---

interface OpenConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
}

export interface OpenCollaboratorFormProps {
  mode: "create" | "edit";
  editingCollaborator?: Collaborator | null;
  onSuccess?: (collaborator: Collaborator) => void;
}

export interface OpenClientFormProps {
  editingClient?: Client | null;
  onSuccess?: () => void;
}

export interface OpenEmpresaFormProps {
  empresaToEdit?: Empresa;
  onSuccess?: () => void;
}

export interface OpenPerfilFormProps {
  perfilToEdit?: Perfil | null;
  onSuccess?: () => void;
}

export interface OpenMileageDialogProps {
  onConfirm: (km: number) => void;
  title: string;
  description: string;
  lastKm?: number;
}

export interface OpenCollaboratorTurnProps {
  collaboratorId: string;
  turnToEdit?: ColaboradorCliente | null;
  onSuccess?: () => void;
}

export interface OpenTimeRecordDetailsProps {
  record: RegistroPonto | null;
  onEdit?: (record: RegistroPonto) => void;
  onDelete?: (record: RegistroPonto) => void;
}

export interface OpenTimeRecordProps {
  record?: RegistroPonto | null;
}

export interface OpenSuccessRegistrationProps {
  collaborator: Collaborator;
  title?: string;
  description?: ReactNode;
  hideNewCollaboratorButton?: boolean;
}

export interface OpenOccurrenceFormProps {
  collaboratorId?: string;
  onSuccess?: () => void;
}

export interface OpenOccurrenceDetailsProps {
  occurrence: Ocorrencia | null;
  onDelete?: (id: number) => void | Promise<void>;
}

export interface OpenEndTurnProps {
  turnId: number;
  collaboratorId: string;
  clientName?: string;
  onSuccess?: () => void;
}

export interface OpenPasswordGuardProps {
  onSuccess?: () => void;
}

export interface OpenFeriadoFormProps {
  feriadoToEdit?: Feriado;
  onSuccess?: () => void;
}

export interface OpenForgotPasswordProps {
  onSuccess?: () => void;
}

// --- Context Type ---

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;

  // Dialogs
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;

  openCollaboratorFormDialog: (props: OpenCollaboratorFormProps) => void;
  closeCollaboratorFormDialog: () => void;

  openClientFormDialog: (props: OpenClientFormProps) => void;
  closeClientFormDialog: () => void;

  openEmpresaFormDialog: (props: OpenEmpresaFormProps) => void;
  closeEmpresaFormDialog: () => void;

  openPerfilFormDialog: (props: OpenPerfilFormProps) => void;
  closePerfilFormDialog: () => void;

  openMileageDialog: (props: OpenMileageDialogProps) => void;
  closeMileageDialog: () => void;

  openCollaboratorTurnDialog: (props: OpenCollaboratorTurnProps) => void;
  closeCollaboratorTurnDialog: () => void;

  openTimeRecordDetailsDialog: (props: OpenTimeRecordDetailsProps) => void;
  closeTimeRecordDetailsDialog: () => void;

  openTimeRecordDialog: (props: OpenTimeRecordProps) => void;
  closeTimeRecordDialog: () => void;

  openSuccessRegistrationDialog: (props: OpenSuccessRegistrationProps) => void;
  closeSuccessRegistrationDialog: () => void;

  openOccurrenceFormDialog: (props: OpenOccurrenceFormProps) => void;
  closeOccurrenceFormDialog: () => void;

  openOccurrenceTypesDialog: () => void;
  closeOccurrenceTypesDialog: () => void;

  openFeriadoFormDialog: (props: OpenFeriadoFormProps) => void;
  closeFeriadoFormDialog: () => void;

  openEndTurnDialog: (props: OpenEndTurnProps) => void;
  closeEndTurnDialog: () => void;

  openOccurrenceDetailsDialog: (props: OpenOccurrenceDetailsProps) => void;
  closeOccurrenceDetailsDialog: () => void;

  openAlterarSenhaDialog: () => void;
  closeAlterarSenhaDialog: () => void;

  openEditarCadastroDialog: () => void;
  closeEditarCadastroDialog: () => void;

  openPasswordGuardDialog: (props: OpenPasswordGuardProps) => void;
  closePasswordGuardDialog: () => void;

  openForgotPasswordDialog: (props: OpenForgotPasswordProps) => void;
  closeForgotPasswordDialog: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// --- Provider ---

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

  const [confirmationDialogState, setConfirmationDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmationDialogProps;
  }>({
    open: false,
  });

  const [collaboratorFormDialogState, setCollaboratorFormDialogState] = useState<{
    open: boolean;
    props?: OpenCollaboratorFormProps;
  }>({
    open: false,
  });

  const [clientFormDialogState, setClientFormDialogState] = useState<{
    open: boolean;
    props?: OpenClientFormProps;
  }>({
    open: false,
  });

  const [empresaFormDialogState, setEmpresaFormDialogState] = useState<{
    open: boolean;
    props?: OpenEmpresaFormProps;
  }>({
    open: false,
  });

  const [perfilFormDialogState, setPerfilFormDialogState] = useState<{
    open: boolean;
    props?: OpenPerfilFormProps;
  }>({
    open: false,
  });

  const [mileageDialogState, setMileageDialogState] = useState<{
    open: boolean;
    props?: OpenMileageDialogProps;
  }>({
    open: false,
  });

  const [collaboratorTurnDialogState, setCollaboratorTurnDialogState] = useState<{
    open: boolean;
    props?: OpenCollaboratorTurnProps;
  }>({
    open: false,
  });

  const [timeRecordDetailsDialogState, setTimeRecordDetailsDialogState] = useState<{
    open: boolean;
    props?: OpenTimeRecordDetailsProps;
  }>({
    open: false,
  });

  const [timeRecordDialogState, setTimeRecordDialogState] = useState<{
    open: boolean;
    props?: OpenTimeRecordProps;
  }>({
    open: false,
  });

  const [successRegistrationDialogState, setSuccessRegistrationDialogState] = useState<{
    open: boolean;
    props?: OpenSuccessRegistrationProps;
  }>({
    open: false,
  });

  const [occurrenceFormDialogState, setOccurrenceFormDialogState] = useState<{
    open: boolean;
    props?: OpenOccurrenceFormProps;
  }>({
    open: false,
  });

  const [occurrenceTypesDialogState, setOccurrenceTypesDialogState] = useState({
    open: false,
  });

  const [feriadoFormDialogState, setFeriadoFormDialogState] = useState<{
    open: boolean;
    props?: OpenFeriadoFormProps;
  }>({
    open: false,
  });

  const [endTurnDialogState, setEndTurnDialogState] = useState<{
    open: boolean;
    props?: OpenEndTurnProps;
  }>({
    open: false,
  });

  const [occurrenceDetailsDialogState, setOccurrenceDetailsDialogState] = useState<{
    open: boolean;
    props?: OpenOccurrenceDetailsProps;
  }>({
    open: false,
  });

  const [alterarSenhaDialogState, setAlterarSenhaDialogState] = useState({
    open: false,
  });

  const [editarCadastroDialogState, setEditarCadastroDialogState] = useState({
    open: false,
  });

  const [passwordGuardDialogState, setPasswordGuardDialogState] = useState<{
    open: boolean;
    props?: OpenPasswordGuardProps;
  }>({
    open: false,
  });

  const [forgotPasswordDialogState, setForgotPasswordDialogState] = useState<{
    open: boolean;
    props?: OpenForgotPasswordProps;
  }>({
    open: false,
  });

  // --- Actions ---

  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => {
    setConfirmationDialogState({
      open: true,
      props,
    });
  };

  const closeConfirmationDialog = () => {
    closeDialog(() => {
      setConfirmationDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openCollaboratorFormDialog = (props: OpenCollaboratorFormProps) => {
    setCollaboratorFormDialogState({
      open: true,
      props,
    });
  };

  const closeCollaboratorFormDialog = () => {
    closeDialog(() => {
      setCollaboratorFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openClientFormDialog = (props: OpenClientFormProps) => {
    setClientFormDialogState({ open: true, props });
  };

  const closeClientFormDialog = () => {
    closeDialog(() => {
      setClientFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openEmpresaFormDialog = (props: OpenEmpresaFormProps) => {
    setEmpresaFormDialogState({ open: true, props });
  };

  const closeEmpresaFormDialog = () => {
    closeDialog(() => {
      setEmpresaFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openPerfilFormDialog = (props: OpenPerfilFormProps) => {
    setPerfilFormDialogState({ open: true, props });
  };

  const closePerfilFormDialog = () => {
    closeDialog(() => {
      setPerfilFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openMileageDialog = (props: OpenMileageDialogProps) => {
    setMileageDialogState({ open: true, props });
  };

  const closeMileageDialog = () => {
    closeDialog(() => {
      setMileageDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openCollaboratorTurnDialog = (props: OpenCollaboratorTurnProps) => {
    setCollaboratorTurnDialogState({ open: true, props });
  };

  const closeCollaboratorTurnDialog = () => {
    closeDialog(() => {
      setCollaboratorTurnDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openTimeRecordDetailsDialog = (props: OpenTimeRecordDetailsProps) => {
    setTimeRecordDetailsDialogState({ open: true, props });
  };

  const closeTimeRecordDetailsDialog = () => {
    closeDialog(() => {
      setTimeRecordDetailsDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openTimeRecordDialog = (props: OpenTimeRecordProps) => {
    setTimeRecordDialogState({ open: true, props });
  };

  const closeTimeRecordDialog = () => {
    closeDialog(() => {
      setTimeRecordDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openSuccessRegistrationDialog = (props: OpenSuccessRegistrationProps) => {
    setSuccessRegistrationDialogState({ open: true, props });
  };

  const closeSuccessRegistrationDialog = () => {
    closeDialog(() => {
      setSuccessRegistrationDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openOccurrenceFormDialog = (props: OpenOccurrenceFormProps) => {
    setOccurrenceFormDialogState({ open: true, props });
  };

  const closeOccurrenceFormDialog = () => {
    closeDialog(() => {
      setOccurrenceFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openOccurrenceTypesDialog = () => {
    setOccurrenceTypesDialogState({ open: true });
  };

  const closeOccurrenceTypesDialog = () => {
    closeDialog(() => {
      setOccurrenceTypesDialogState({ open: false });
    });
  };

  const openFeriadoFormDialog = (props: OpenFeriadoFormProps) => {
    setFeriadoFormDialogState({ open: true, props });
  };

  const closeFeriadoFormDialog = () => {
    closeDialog(() => {
      setFeriadoFormDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openEndTurnDialog = (props: OpenEndTurnProps) => {
    setEndTurnDialogState({ open: true, props });
  };

  const closeEndTurnDialog = () => {
    closeDialog(() => {
      setEndTurnDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openOccurrenceDetailsDialog = (props: OpenOccurrenceDetailsProps) => {
    setOccurrenceDetailsDialogState({ open: true, props });
  };

  const closeOccurrenceDetailsDialog = () => {
    closeDialog(() => {
      setOccurrenceDetailsDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openAlterarSenhaDialog = () => {
    setAlterarSenhaDialogState({ open: true });
  };

  const closeAlterarSenhaDialog = () => {
    closeDialog(() => {
      setAlterarSenhaDialogState({ open: false });
    });
  };

  const openEditarCadastroDialog = () => {
    setEditarCadastroDialogState({ open: true });
  };

  const closeEditarCadastroDialog = () => {
    closeDialog(() => {
      setEditarCadastroDialogState({ open: false });
    });
  };

  const openPasswordGuardDialog = (props: OpenPasswordGuardProps) => {
    setPasswordGuardDialogState({ open: true, props });
  };

  const closePasswordGuardDialog = () => {
    closeDialog(() => {
      setPasswordGuardDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  const openForgotPasswordDialog = (props: OpenForgotPasswordProps) => {
    setForgotPasswordDialogState({ open: true, props });
  };

  const closeForgotPasswordDialog = () => {
    closeDialog(() => {
      setForgotPasswordDialogState((prev) => ({ ...prev, open: false }));
    });
  };

  return (
    <LayoutContext.Provider value={{
      pageTitle,
      setPageTitle,
      pageSubtitle,
      setPageSubtitle,
      openConfirmationDialog,
      closeConfirmationDialog,
      openCollaboratorFormDialog,
      closeCollaboratorFormDialog,
      openClientFormDialog,
      closeClientFormDialog,
      openEmpresaFormDialog,
      closeEmpresaFormDialog,
      openPerfilFormDialog,
      closePerfilFormDialog,
      openMileageDialog,
      closeMileageDialog,
      openCollaboratorTurnDialog,
      closeCollaboratorTurnDialog,
      openTimeRecordDetailsDialog,
      closeTimeRecordDetailsDialog,
      openTimeRecordDialog,
      closeTimeRecordDialog,
      openSuccessRegistrationDialog,
      closeSuccessRegistrationDialog,
      openOccurrenceFormDialog,
      closeOccurrenceFormDialog,
      openOccurrenceTypesDialog,
      closeOccurrenceTypesDialog,
      openFeriadoFormDialog,
      closeFeriadoFormDialog,
      openEndTurnDialog,
      closeEndTurnDialog,
      openOccurrenceDetailsDialog,
      closeOccurrenceDetailsDialog,
      openAlterarSenhaDialog,
      closeAlterarSenhaDialog,
      openEditarCadastroDialog,
      closeEditarCadastroDialog,
      openPasswordGuardDialog,
      closePasswordGuardDialog,
      openForgotPasswordDialog,
      closeForgotPasswordDialog
    }}>
      {children}

      {confirmationDialogState.props && (
        <ConfirmationDialog
          open={confirmationDialogState.open}
          onOpenChange={(open) =>
            setConfirmationDialogState((prev) => ({ ...prev, open }))
          }
          title={confirmationDialogState.props.title}
          description={confirmationDialogState.props.description}
          onConfirm={confirmationDialogState.props.onConfirm}
          confirmText={confirmationDialogState.props.confirmText}
          cancelText={confirmationDialogState.props.cancelText}
          variant={confirmationDialogState.props.variant}
          isLoading={confirmationDialogState.props.isLoading}
        />
      )}

      {collaboratorFormDialogState.open && (
        <CollaboratorFormDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setCollaboratorFormDialogState(prev => ({ ...prev, open: false }));
            }
          }}
          onSuccess={(data) => {
            collaboratorFormDialogState.props?.onSuccess?.(data);
            setCollaboratorFormDialogState(prev => ({ ...prev, open: false }));
          }}
          collaboratorToEdit={collaboratorFormDialogState.props?.editingCollaborator}
        />
      )}

      {clientFormDialogState.open && (
        <ClientFormDialog
          isOpen={true}
          onClose={closeClientFormDialog}
          editingClient={clientFormDialogState.props?.editingClient}
          onSuccess={() => {
            clientFormDialogState.props?.onSuccess?.();
            closeClientFormDialog();
          }}
        />
      )}

      {empresaFormDialogState.open && (
        <EmpresaFormDialog
          open={true}
          onOpenChange={(open) => !open && closeEmpresaFormDialog()}
          empresaToEdit={empresaFormDialogState.props?.empresaToEdit}
        />
      )}

      {perfilFormDialogState.open && (
        <PerfilFormDialog
          open={true}
          onOpenChange={(open) => !open && closePerfilFormDialog()}
          perfilToEdit={perfilFormDialogState.props?.perfilToEdit}
        />
      )}

      {mileageDialogState.open && (
        <MileageDialog
          open={true}
          onClose={closeMileageDialog}
          onConfirm={(km) => {
            mileageDialogState.props?.onConfirm(km);
            closeMileageDialog();
          }}
          title={mileageDialogState.props?.title || ""}
          description={mileageDialogState.props?.description || ""}
          lastKm={mileageDialogState.props?.lastKm}
        />
      )}

      {collaboratorTurnDialogState.open && (
        <CollaboratorTurnDialog
          open={true}
          onOpenChange={(open) => !open && closeCollaboratorTurnDialog()}
          collaboratorId={collaboratorTurnDialogState.props?.collaboratorId || ""}
          turnToEdit={collaboratorTurnDialogState.props?.turnToEdit}
          onSuccess={() => {
            collaboratorTurnDialogState.props?.onSuccess?.();
            closeCollaboratorTurnDialog();
          }}
        />
      )}

      {timeRecordDetailsDialogState.open && timeRecordDetailsDialogState.props?.record && (
        <TimeRecordDetailsDialog
          isOpen={true}
          onClose={closeTimeRecordDetailsDialog}
          record={timeRecordDetailsDialogState.props.record}
          onEdit={(record) => {
            timeRecordDetailsDialogState.props?.onEdit?.(record);
            // We usually don't close details when editing, they stack
          }}
          onDelete={(record) => {
            timeRecordDetailsDialogState.props?.onDelete?.(record);
          }}
        />
      )}

      {timeRecordDialogState.open && (
        <TimeRecordDialog
          isOpen={true}
          onClose={closeTimeRecordDialog}
          record={timeRecordDialogState.props?.record}
        />
      )}

      {successRegistrationDialogState.open && successRegistrationDialogState.props?.collaborator && (
        <SuccessRegistrationDialog
          open={true}
          onOpenChange={(open) => !open && closeSuccessRegistrationDialog()}
          collaborator={successRegistrationDialogState.props.collaborator}
          title={successRegistrationDialogState.props.title}
          description={successRegistrationDialogState.props.description}
          hideNewCollaboratorButton={successRegistrationDialogState.props.hideNewCollaboratorButton}
          onOpenCollaboratorForm={() => openCollaboratorFormDialog({ mode: "create" })}
        />
      )}

      {occurrenceFormDialogState.open && (
        <OccurrenceFormDialog
          open={true}
          onOpenChange={(open) => !open && closeOccurrenceFormDialog()}
          collaboratorId={occurrenceFormDialogState.props?.collaboratorId}
          onSuccess={() => {
            occurrenceFormDialogState.props?.onSuccess?.();
            closeOccurrenceFormDialog();
          }}
        />
      )}

      {occurrenceTypesDialogState.open && (
        <OccurrenceTypesDialog
          open={true}
          onOpenChange={(open) => !open && closeOccurrenceTypesDialog()}
        />
      )}

      {feriadoFormDialogState.open && (
        <FeriadoFormDialog
          open={true}
          onOpenChange={(open) => !open && closeFeriadoFormDialog()}
          feriadoToEdit={feriadoFormDialogState.props?.feriadoToEdit}
        />
      )}

      {endTurnDialogState.open && endTurnDialogState.props && (
        <EndTurnDialog
          open={true}
          onOpenChange={(open) => !open && closeEndTurnDialog()}
          turnId={endTurnDialogState.props.turnId}
          collaboratorId={endTurnDialogState.props.collaboratorId}
          clientName={endTurnDialogState.props.clientName}
          onSuccess={endTurnDialogState.props.onSuccess}
        />
      )}

      {occurrenceDetailsDialogState.open && occurrenceDetailsDialogState.props?.occurrence && (
        <OccurrenceDetailsDialog
          open={true}
          onOpenChange={(open) => !open && closeOccurrenceDetailsDialog()}
          occurrence={occurrenceDetailsDialogState.props.occurrence}
          onDelete={occurrenceDetailsDialogState.props.onDelete}
        />
      )}

      {alterarSenhaDialogState.open && (
        <AlterarSenhaDialog
          isOpen={true}
          onClose={closeAlterarSenhaDialog}
        />
      )}

      {editarCadastroDialogState.open && (
        <EditarCadastroDialog
          isOpen={true}
          onClose={closeEditarCadastroDialog}
        />
      )}

      {passwordGuardDialogState.open && passwordGuardDialogState.props && (
        <PasswordGuardDialog
          open={true}
          onSuccess={() => {
            passwordGuardDialogState.props?.onSuccess?.();
            closePasswordGuardDialog();
          }}
        />
      )}

      {forgotPasswordDialogState.open && (
        <ForgotPasswordDialog
          open={true}
          onOpenChange={(open) => !open && closeForgotPasswordDialog()}
        />
      )}

    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};