import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCollaboratorTurnForm } from "@/hooks";
import { ColaboradorCliente } from "@/types/database";
import { CalendarDays, Wand2 } from "lucide-react";
import {
  TurnEscalaSemanalSection,
  TurnFinanceiroSection,
  TurnInstitucionalSection,
  TurnLocalizacaoSection,
} from "./collaborator-turn";

interface CollaboratorTurnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId: string;
  turnToEdit?: ColaboradorCliente | null;
  onSuccess?: () => void;
}

export function CollaboratorTurnDialog({
  open,
  onOpenChange,
  collaboratorId,
  turnToEdit,
  onSuccess,
}: CollaboratorTurnDialogProps) {
  const {
    form,
    collaborator,
    clients,
    unidades,
    empresas,
    selectedClientId,
    selectedUnidadeId,
    clientScale,
    watchedHorarios,
    isSubmitting,
    handleClose,
    handleFillMagic,
    onSubmit,
    onFormError,
    toggleDia,
    handleRepeatAll,
    getHorarioError,
  } = useCollaboratorTurnForm({
    open,
    onOpenChange,
    collaboratorId,
    turnToEdit,
    onSuccess,
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="5xl"
      lockClose={isSubmitting}
    >
      <BaseDialog.Header
        icon={<CalendarDays className="w-5 h-5 text-foreground" />}
        title={turnToEdit ? "Editar Turno" : "Novo Turno"}
        subtitle={
          collaborator
            ? `Colaborador: ${collaborator.nome_completo}`
            : "Configuração de vínculo, escala e condições de remuneração"
        }
        onClose={handleClose}
        leftAction={
          import.meta.env.DEV ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[12px] text-xs font-semibold gap-1.5 cursor-pointer"
              onClick={handleFillMagic}
              title="Preencher com dados de teste"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Preencher
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            id="collaborator-turn-form"
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="lg:grid lg:grid-cols-12 lg:gap-8 pt-1"
          >
            <div className="lg:col-span-7 space-y-6">
              <TurnInstitucionalSection
                control={form.control}
                clients={clients}
                unidades={unidades}
                empresas={empresas}
                selectedClientId={selectedClientId}
              />

              <TurnLocalizacaoSection control={form.control} />

              <TurnEscalaSemanalSection
                form={form}
                watchedHorarios={watchedHorarios}
                clientScale={clientScale}
                selectedUnidadeId={selectedUnidadeId}
                turnToEdit={turnToEdit}
                toggleDia={toggleDia}
                handleRepeatAll={handleRepeatAll}
                getHorarioError={getHorarioError}
              />
            </div>

            <div className="lg:col-span-5 space-y-6 mt-6 lg:mt-0">
              <TurnFinanceiroSection control={form.control} />
            </div>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
          type="button"
        />
        <BaseDialog.Action
          label={turnToEdit ? "Salvar Alterações" : "Salvar"}
          variant="primary"
          isLoading={isSubmitting}
          type="submit"
          form="collaborator-turn-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
