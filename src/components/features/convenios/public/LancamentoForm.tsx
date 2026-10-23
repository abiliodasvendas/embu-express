import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { LancamentoConvenio } from "@/types/database";
import { Loader2, Receipt } from "lucide-react";
import { useLancamentoConvenioForm } from "@/hooks/form/useLancamentoConvenioForm";
import {
  LancamentoVeiculoEmbuSection,
  LancamentoColaboradorSection,
  LancamentoValoresSection,
  LancamentoDescricaoSection,
} from "./lancamento";

interface LancamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token?: string;
  convenioId?: string;
  lancamentoToEdit?: LancamentoConvenio | null;
}

export function LancamentoForm({
  open,
  onOpenChange,
  token,
  convenioId,
  lancamentoToEdit,
}: LancamentoFormProps) {
  const {
    form,
    collaboratorOptions,
    isEditing,
    isLoading,
    isPublicBlocked,
    publicBlockedReason,
    isAdminWarning,
    adminWarningReason,
    onSubmit,
    handleClose,
  } = useLancamentoConvenioForm({
    open,
    onOpenChange,
    token,
    convenioId,
    lancamentoToEdit,
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && handleClose()}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Receipt className="h-5 w-5 text-foreground" />}
        title={isEditing ? "Editar Lançamento" : "Novo Lançamento"}
        subtitle={
          isEditing
            ? "Modifique os dados do lançamento de manutenção"
            : "Registre uma nova despesa ou ordem de serviço no convênio"
        }
        onClose={handleClose}
      />

      <BaseDialog.Body className="py-5 px-6 space-y-4">
        <Form {...form}>
          <form
            id="lancamento-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <LancamentoVeiculoEmbuSection form={form} />

            <LancamentoColaboradorSection
              form={form}
              collaboratorOptions={collaboratorOptions}
              isPublicBlocked={isPublicBlocked}
              publicBlockedReason={publicBlockedReason}
              isAdminWarning={isAdminWarning}
              adminWarningReason={adminWarningReason}
            />

            <LancamentoValoresSection form={form} isEditing={isEditing} />

            <LancamentoDescricaoSection form={form} />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="lancamento-form"
          disabled={isLoading || isPublicBlocked}
          variant={isPublicBlocked ? "destructive" : "default"}
          className={cn(isPublicBlocked && "opacity-80 cursor-not-allowed")}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isPublicBlocked ? (
            "Bloqueado para Lançamento"
          ) : isEditing ? (
            "Atualizar"
          ) : (
            "Salvar"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default LancamentoForm;
