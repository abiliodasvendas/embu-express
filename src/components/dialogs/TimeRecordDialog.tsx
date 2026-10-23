import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RegistroPonto } from "@/types/database";
import { Edit2, Loader2, PlusCircle, Save } from "lucide-react";
import { useTimeRecordForm } from "@/hooks/form";
import {
  TimeRecordCollaboratorSection,
  TimeRecordTurnoSection,
  TimeRecordFieldsSection,
} from "./time-record";

interface TimeRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record?: RegistroPonto | null;
}

export function TimeRecordDialog({ isOpen, onClose, record }: TimeRecordDialogProps) {
  const {
    form,
    collaborators,
    openCombobox,
    setOpenCombobox,
    selectedCollaborator,
    selectedCollaboratorId,
    hasTurnos,
    isEditMode,
    isInclusionMode,
    isManualMode,
    isFixingInconsistency,
    isMotoboyUser,
    isPending,
    onSubmit,
    handleClose,
    clearSelectedCollaborator,
  } = useTimeRecordForm({ isOpen, onClose, record });

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={isEditMode ? "Editar Atividade" : "Registrar Atividade"}
        subtitle={
          isEditMode
            ? "Atualize os dados e horários deste registro"
            : "Crie um novo lançamento de atividade para o colaborador"
        }
        icon={
          isEditMode ? (
            <Edit2 className="w-5 h-5 text-foreground" />
          ) : (
            <PlusCircle className="w-5 h-5 text-foreground" />
          )
        }
      />

      <BaseDialog.Body className="space-y-5">
        <Form {...form}>
          <form id="time-record-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TimeRecordCollaboratorSection
              form={form}
              record={record}
              selectedCollaborator={selectedCollaborator}
              selectedCollaboratorId={selectedCollaboratorId}
              collaborators={collaborators}
              openCombobox={openCombobox}
              setOpenCombobox={setOpenCombobox}
              isManualMode={isManualMode}
              onClear={clearSelectedCollaborator}
            />

            <TimeRecordTurnoSection
              form={form}
              selectedCollaborator={selectedCollaborator}
              selectedCollaboratorId={selectedCollaboratorId}
              hasTurnos={hasTurnos}
              isManualMode={isManualMode}
            />

            <TimeRecordFieldsSection
              form={form}
              isManualMode={isManualMode}
              isFixingInconsistency={isFixingInconsistency}
              isMotoboyUser={isMotoboyUser}
              record={record}
              selectedCollaboratorId={selectedCollaboratorId}
              hasTurnos={hasTurnos}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="time-record-form"
          disabled={isPending || (isManualMode && !!selectedCollaboratorId && !hasTurnos)}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditMode
                ? "Salvar Alterações"
                : isInclusionMode
                ? "Salvar Inclusão"
                : "Criar Registro"}
            </>
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
