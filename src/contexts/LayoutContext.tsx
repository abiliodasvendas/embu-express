import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useDialogClose } from "@/hooks/ui/useDialogClose";
import { Usuario as Collaborator } from '@/types/database';
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

  return (
    <LayoutContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      pageSubtitle, 
      setPageSubtitle, 
      openConfirmationDialog,
      closeConfirmationDialog,
      openCollaboratorFormDialog,
      closeCollaboratorFormDialog
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