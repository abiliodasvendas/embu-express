import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import { CollaboratorTurnDialog } from "@/components/dialogs/CollaboratorTurnDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { EditTimeRecordDialog } from "@/components/dialogs/EditTimeRecordDialog";
import { EmpresaFormDialog } from "@/components/dialogs/EmpresaFormDialog";
import { MileageDialog } from "@/components/dialogs/MileageDialog";
import { PerfilFormDialog } from "@/components/dialogs/PerfilFormDialog";
import { SuccessRegistrationDialog } from "@/components/dialogs/SuccessRegistrationDialog";
import { TimeRecordDetailsDialog } from "@/components/dialogs/TimeRecordDetailsDialog";
import { OccurrenceFormDialog } from "@/components/dialogs/OccurrenceFormDialog";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useDialogClose } from "@/hooks/ui/useDialogClose";
import { Client, ColaboradorCliente, Usuario as Collaborator, Empresa, Perfil, RegistroPonto } from '@/types/database';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
  onSuccess?: (collaborator: any) => void;
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

export interface OpenEditTimeRecordProps {
  record: RegistroPonto | null;
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

  openEditTimeRecordDialog: (props: OpenEditTimeRecordProps) => void;
  closeEditTimeRecordDialog: () => void;

  openSuccessRegistrationDialog: (props: OpenSuccessRegistrationProps) => void;
  closeSuccessRegistrationDialog: () => void;

  openOccurrenceFormDialog: (props: OpenOccurrenceFormProps) => void;
  closeOccurrenceFormDialog: () => void;
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

  const [editTimeRecordDialogState, setEditTimeRecordDialogState] = useState<{
    open: boolean;
    props?: OpenEditTimeRecordProps;
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

  const openEditTimeRecordDialog = (props: OpenEditTimeRecordProps) => {
    setEditTimeRecordDialogState({ open: true, props });
  };

  const closeEditTimeRecordDialog = () => {
    closeDialog(() => {
      setEditTimeRecordDialogState((prev) => ({ ...prev, open: false }));
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
      openEditTimeRecordDialog,
      closeEditTimeRecordDialog,
      openSuccessRegistrationDialog,
      closeSuccessRegistrationDialog,
      openOccurrenceFormDialog,
      closeOccurrenceFormDialog
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

      {editTimeRecordDialogState.open && editTimeRecordDialogState.props?.record && (
        <EditTimeRecordDialog
          isOpen={true}
          onClose={closeEditTimeRecordDialog}
          record={editTimeRecordDialogState.props.record}
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