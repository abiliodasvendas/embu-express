import { AlertCircle, Loader2 } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useOccurrenceForm } from "@/hooks";
import {
  OccurrenceColaboradorSection,
  OccurrenceTipoDataSection,
  OccurrenceFinanceiroSection,
  OccurrenceObservacaoSection,
} from "./occurrence";
import { OccurrenceFormMode } from "@/types/enums";
import type { OccurrenceFormData } from "@/schemas/occurrenceSchema";

interface OccurrenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId?: string;
  onSuccess?: () => void;
  defaultValues?: Partial<OccurrenceFormData> & { id?: number };
  mode?: OccurrenceFormMode;
}

export function OccurrenceFormDialog({
  open,
  onOpenChange,
  collaboratorId,
  onSuccess,
  defaultValues,
  mode,
}: OccurrenceFormDialogProps) {
  const {
    form,
    collaborators,
    tipos,
    links,
    isEditing,
    isSaving,
    onSubmit,
    handleClose,
  } = useOccurrenceForm({
    open,
    onOpenChange,
    collaboratorId,
    onSuccess,
    defaultValues,
    mode,
  });

  return (
    <BaseDialog open={open} onOpenChange={(val) => !val && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={isEditing ? "Editar Ocorrência" : "Lançar Ocorrência"}
        subtitle={
          isEditing
            ? "Edite os dados desta ocorrência"
            : "Registre uma ocorrência para um colaborador"
        }
        icon={<AlertCircle className="w-5 h-5 text-foreground" />}
      />

      <BaseDialog.Body className="space-y-4">
        <Form {...form}>
          <form id="occurrence-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!collaboratorId && (
              <OccurrenceColaboradorSection
                control={form.control}
                collaborators={collaborators}
              />
            )}

            <OccurrenceTipoDataSection
              control={form.control}
              tipos={tipos}
              links={links}
            />

            <OccurrenceFinanceiroSection
              form={form}
              mode={mode}
              isEditing={isEditing}
            />

            <OccurrenceObservacaoSection control={form.control} />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button type="submit" form="occurrence-form" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Salvando..." : "Registrando..."}
            </>
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Registrar Ocorrência"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
