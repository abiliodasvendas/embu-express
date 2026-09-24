import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Client, ColaboradorCliente, Usuario as Collaborator, Empresa, Feriado, Ocorrencia, Perfil, RegistroPonto, ItemEquipamento, CategoriaItem, Ticket, Convenio, FaturaCliente, TransferenciaIntercompany, DespesaOperacional, MovimentacaoAvulsa, Unidade, LancamentoConvenio, FaturaFornecedorConvenio } from '@/types/database';
import { OccurrenceFormData } from '@/schemas/occurrenceSchema';
import { OccurrenceFormMode } from '@/types/enums';

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
  hideTurnButton?: boolean;
}

export interface OpenOccurrenceFormProps {
  collaboratorId?: string;
  onSuccess?: () => void;
  defaultValues?: Partial<OccurrenceFormData> & { id?: number };
  mode?: OccurrenceFormMode;
}

export interface OpenOccurrenceDetailsProps {
  occurrence: Ocorrencia | null;
  onDelete?: (id: number) => void | Promise<void>;
  onEdit?: (occurrence: Ocorrencia) => void;
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

export interface OpenAlocarEquipamentoProps {
  colaboradorId?: string;
  onSuccess?: () => void;
}

export interface OpenItemEquipamentoFormProps {
  itemToEdit?: ItemEquipamento | null;
  onSuccess?: () => void;
}

export interface OpenCategoriasProps {
  onSuccess?: () => void;
}

export interface OpenAlocadosPorItemProps {
  itemId: number;
  itemName: string;
}

export interface OpenCreateTicketProps {
  ticketToEdit?: Ticket | null;
  onSuccess?: () => void;
}

export interface OpenTicketDetailsProps {
  ticketId: string;
  onSuccess?: () => void;
}

export interface OpenConvenioFormProps {
  convenioToEdit?: Convenio | null;
  onSuccess?: () => void;
}

export interface OpenConfirmarAdiantamentoDialogProps {
  valorSugerido: number;
  onConfirm: (valor: number) => Promise<void>;
  isLoading?: boolean;
}

export interface OpenFaturaFormProps {
  faturaToEdit?: FaturaCliente | null;
  onSuccess?: () => void;
}

export interface OpenLoteRecebimentoProps {
  onSuccess?: () => void;
}

export interface OpenAcertoIntercompanyProps {
  transferencia: TransferenciaIntercompany;
  onSuccess?: () => void;
}

export interface OpenAlocacaoTemporariaProps {
  onSuccess?: () => void;
}

export interface OpenContasBancariasProps {
  empresaIdInicial?: number;
}

export interface OpenDespesaFormProps {
  despesaToEdit?: DespesaOperacional | null;
  onSuccess?: () => void;
}

export interface OpenMovimentacaoAvulsaFormProps {
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  onSuccess?: () => void;
}

export interface OpenUnidadeFormProps {
  clienteId: number;
  editingUnidade?: Unidade | null;
  onSuccess?: () => void;
}

export interface OpenLancamentoConvenioFormProps {
  convenioId?: string;
  token?: string;
  lancamentoToEdit?: LancamentoConvenio | null;
  onSuccess?: () => void;
}

export interface OpenFaturaFornecedorDialogProps {
  convenioId: string;
  convenioNome?: string;
  mesCompetencia: number;
  anoCompetencia: number;
  faturaToEdit?: FaturaFornecedorConvenio | null;
  onSuccess?: () => void;
}

export interface OpenGerenciarBloqueioConvenioProps {
  colaboradorId: string;
  colaboradorNome: string;
}

export interface LayoutContextType {

  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;

  // Dialogs
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  closeConfirmationDialog: () => void;

  openConfirmarAdiantamentoDialog: (props: OpenConfirmarAdiantamentoDialogProps) => void;
  closeConfirmarAdiantamentoDialog: () => void;


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

  openAlocarEquipamentoDialog: (props: OpenAlocarEquipamentoProps) => void;
  closeAlocarEquipamentoDialog: () => void;

  openItemEquipamentoFormDialog: (props: OpenItemEquipamentoFormProps) => void;
  closeItemEquipamentoFormDialog: () => void;

  openCategoriasDialog: (props: OpenCategoriasProps) => void;
  closeCategoriasDialog: () => void;

  openAlocadosPorItemDialog: (props: OpenAlocadosPorItemProps) => void;
  closeAlocadosPorItemDialog: () => void;

  openCreateTicketDialog: (props: OpenCreateTicketProps) => void;
  closeCreateTicketDialog: () => void;

  openTicketDetailsDialog: (props: OpenTicketDetailsProps) => void;
  closeTicketDetailsDialog: () => void;

  openConvenioFormDialog: (props: OpenConvenioFormProps) => void;
  closeConvenioFormDialog: () => void;

  openFaturaFormDialog: (props: OpenFaturaFormProps) => void;
  closeFaturaFormDialog: () => void;

  openLoteRecebimentoDialog: (props: OpenLoteRecebimentoProps) => void;
  closeLoteRecebimentoDialog: () => void;

  openAcertoIntercompanyDialog: (props: OpenAcertoIntercompanyProps) => void;
  closeAcertoIntercompanyDialog: () => void;

  openAlocacaoTemporariaDialog: (props: OpenAlocacaoTemporariaProps) => void;
  closeAlocacaoTemporariaDialog: () => void;

  openContasBancariasDialog: (props?: OpenContasBancariasProps) => void;
  closeContasBancariasDialog: () => void;

  openDespesaFormDialog: (props?: OpenDespesaFormProps) => void;
  closeDespesaFormDialog: () => void;

  openMovimentacaoAvulsaDialog: (props?: OpenMovimentacaoAvulsaFormProps) => void;
  closeMovimentacaoAvulsaDialog: () => void;

  openUnidadeFormDialog: (props: OpenUnidadeFormProps) => void;
  closeUnidadeFormDialog: () => void;

  openLancamentoConvenioDialog: (props: OpenLancamentoConvenioFormProps) => void;
  closeLancamentoConvenioDialog: () => void;

  openFaturaFornecedorDialog: (props: OpenFaturaFornecedorDialogProps) => void;
  closeFaturaFornecedorDialog: () => void;

  openGerenciarBloqueioConvenioDialog: (props: OpenGerenciarBloqueioConvenioProps) => void;
  closeGerenciarBloqueioConvenioDialog: () => void;
}


export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};