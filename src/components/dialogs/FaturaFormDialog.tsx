import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FaturaCliente } from "@/types/database";
import { FileText, Wand2 } from "lucide-react";
import { useFaturaForm } from "@/hooks/form/useFaturaForm";
import {
  FaturaClienteEmpresaSection,
  FaturaCompetenciaPeriodoSection,
  FaturaValoresDatasSection,
} from "./fatura";

export interface FaturaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faturaToEdit?: FaturaCliente | null;
  onSuccess?: () => void | Promise<void>;
}

export function FaturaFormDialog({
  open,
  onOpenChange,
  faturaToEdit,
  onSuccess,
}: FaturaFormDialogProps) {
  const {
    form,
    clientes,
    empresas,
    selectedTipoPeriodo,
    isPending,
    handleClienteChange,
    onSubmit,
    handleClose,
    handleFillMock,
  } = useFaturaForm({ open, onOpenChange, faturaToEdit, onSuccess });

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={<FileText className="h-5 w-5 text-foreground" />}
        title={faturaToEdit ? "Editar Fatura" : "Nova Fatura de Cobrança"}
        subtitle="Emissão e controle de faturas de clientes."
        onClose={handleClose}
        leftAction={
          process.env.NODE_ENV === "development" ? (
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
              <FaturaClienteEmpresaSection
                form={form}
                clientes={clientes}
                empresas={empresas}
                onClienteChange={handleClienteChange}
              />
              <FaturaCompetenciaPeriodoSection
                form={form}
                clientes={clientes}
                selectedTipoPeriodo={selectedTipoPeriodo}
              />
              <FaturaValoresDatasSection form={form} />
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
              label={faturaToEdit ? "Salvar Alterações" : "Emitir Fatura"}
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

export default FaturaFormDialog;
