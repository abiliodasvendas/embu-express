import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { EmpresaFormDialog } from "@/components/dialogs/EmpresaFormDialog";
import { PerfilFormDialog } from "@/components/dialogs/PerfilFormDialog";
import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useDialogClose } from "@/hooks/ui/useDialogClose";
import { Usuario as Collaborator, Client, Empresa, Perfil } from '@/types/database';
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
      closePerfilFormDialog
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