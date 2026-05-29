// Business hooks
export { usePermissions } from "./business/usePermissions";
export { useTimeTrackingBusiness } from "./business/useTimeTrackingBusiness";
export { useOccurrenceBusiness } from "./business/useOccurrenceBusiness";
export { useFinancialReportBusiness } from "./business/useFinancialReportBusiness";
export { useProfile } from "./business/useProfile";
export { useSession } from "./business/useSession";
export { useRegistrarPontoBusiness } from "./business/useRegistrarPontoBusiness";

// Form Hooks
export { useCollaboratorForm } from "./form/useCollaboratorForm";
export { useSelfRegistrationForm } from "./form/useSelfRegistrationForm";

// UI Hooks
export * from "./ui/useAnimatedNumber";
export * from "./ui/useDebounce";
export { safeCloseDialog, useDialogClose } from "./ui/useDialogClose";
export {
  useFilters,
  useSearchFilters,
  useStatusFilters,
  useCategoryFilters,
  useDateFilters,
  useDateRangeFilters,
  useHierarchyFilters,
  usePontoFilters,
  useFiltersManager,
  useBatchFilters,
} from "./ui/useFilters";
export type { UseFiltersOptions, UseFiltersReturn } from "./ui/useFilters";
export { useLoadingState } from "./ui/useLoadingState";
export { useTimeTrackingViewModel } from "./ui/useTimeTrackingViewModel";
export { useTimeMirrorViewModel } from "./ui/useTimeMirrorViewModel";
export { useOccurrenceViewModel } from "./ui/useOccurrenceViewModel";
export { useFinancialReportViewModel } from "./ui/useFinancialReportViewModel";
export { useRegistrarPontoViewModel } from "./ui/useRegistrarPontoViewModel";
export { useCollaboratorsViewModel } from "./ui/useCollaboratorsViewModel";
export { useClientsViewModel } from "./ui/useClientsViewModel";
export { useCountdown } from "./ui/useCountdown";

// Embu Express Hooks
export { useCreateClient, useDeleteClient, useToggleClientStatus, useUpdateClient } from "./api/useClientMutations";
export { useClients } from "./api/useClients";
export { useUnidades } from "./api/useUnidades";
export { useCreateUnidade, useDeleteUnidade, useToggleUnidadeStatus, useUpdateUnidade } from "./api/useUnidadeMutations";
export {
    useCreateCollaborator, useCreateVinculo, useDeleteCollaborator, useDeleteVinculo, useUpdateCollaborator,
    useUpdateCollaboratorStatus, useUpdateVinculo
} from "./api/useCollaboratorMutations";
export { useActiveCollaborators, useCollaborator, useCollaborators, useRoles } from "./api/useCollaborators";
export { useCreateEmpresa, useDeleteEmpresa, useToggleEmpresaStatus, useUpdateEmpresa } from "./api/useEmpresaMutations";
export { useEmpresa, useEmpresas } from "./api/useEmpresas";
export { useCreateFeriado, useDeleteFeriado, useFeriados, useUpdateFeriado } from "./api/useFeriados";
export { useCreatePonto, useDeletePonto, useFinalizarPausa, useIniciarPausa, useTogglePonto, useUpdatePonto } from "./api/usePontoMutations";
export { useCreateOcorrencia, useDeleteOcorrencia, useUpdateOcorrencia } from "./api/useOcorrenciaMutations";
export { useClientActions } from "./business/useClientActions";
export { useCollaboratorActions } from "./business/useCollaboratorActions";
export { useCollaboratorMap } from "./api/useCollaboratorMap";



// Context Hooks
export { useLayout } from "../contexts/LayoutContext";
