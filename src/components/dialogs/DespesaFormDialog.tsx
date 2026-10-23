import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DespesaOperacional } from "@/types/database";
import { Receipt, Wand2 } from "lucide-react";
import { useDespesaForm } from "@/hooks/form/useDespesaForm";
import {
  DespesaIdentificacaoSection,
  DespesaCompetenciaSection,
  DespesaPagamentoSection,
  DespesaParcelamentoSection,
} from "./despesa";

export interface DespesaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesaToEdit?: DespesaOperacional | null;
  onSuccess?: () => void | Promise<void>;
}

export function DespesaFormDialog({
  open,
  onOpenChange,
  despesaToEdit,
  onSuccess,
}: DespesaFormDialogProps) {
  const {
    form,
    empresas,
    status,
    isPending,
    onSubmit,
    handleClose,
    handleFillMock,
  } = useDespesaForm({ open, onOpenChange, despesaToEdit, onSuccess });

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="lg"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={<Receipt className="h-5 w-5 text-foreground" />}
        title={despesaToEdit ? "Editar Conta a Pagar" : "Lançar Conta a Pagar / Despesa"}
        subtitle="Lançamento de despesas fixas, tributos e parcelamentos para apuração do DRE e Curva de Caixa."
        onClose={handleClose}
        leftAction={
          process.env.NODE_ENV === "development" && !despesaToEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillMock}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Mock
            </Button>
          ) : undefined
        }
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <BaseDialog.Body>
            <div className="space-y-4 pt-1">
              <DespesaIdentificacaoSection form={form} empresas={empresas} />
              <DespesaCompetenciaSection form={form} />
              <DespesaPagamentoSection form={form} status={status} />
              <DespesaParcelamentoSection form={form} despesaToEdit={despesaToEdit} />
            </div>
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              disabled={isPending}
              onClick={handleClose}
              type="button"
            />
            <BaseDialog.Action
              label={despesaToEdit ? "Salvar Alterações" : "Confirmar Lançamento"}
              variant="primary"
              isLoading={isPending}
              type="submit"
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}

export default DespesaFormDialog;
