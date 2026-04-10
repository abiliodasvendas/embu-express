import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Client, ColaboradorCliente, Usuario as Collaborator, Empresa, Feriado, Ocorrencia, Perfil, RegistroPonto } from '@/types/database';

// --- Interfaces ---

export interface OpenConfirmationDialogProps {
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

export interface LayoutContextType {
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

  openLocationTutorialDialog: () => void;
  closeLocationTutorialDialog: () => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};