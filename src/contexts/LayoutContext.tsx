import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface OpenConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
}

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Carregando...');
  const [pageSubtitle, setPageSubtitle] = useState('Por favor, aguarde.');
  
  // Sync document title with page title
  useEffect(() => {
    if (pageTitle && pageTitle !== 'Carregando...') {
       document.title = `${pageTitle} | Embu Express`;
    }
  }, [pageTitle]);
  
  // Confirmation Dialog State
  const [confirmationDialogState, setConfirmationDialogState] = useState<{
    open: boolean;
    props?: OpenConfirmationDialogProps;
  }>({
    open: false,
  });

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  
  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => {
    setConfirmationDialogState({
      open: true,
      props,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialogState((prev) => ({ ...prev, open: false }));
  };

  return (
    <LayoutContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      pageSubtitle, 
      setPageSubtitle, 
      openConfirmationDialog,
      closeConfirmationDialog,
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