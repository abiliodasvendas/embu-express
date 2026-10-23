import { Building2, Loader2, Wand2 } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useUnidadeForm } from "@/hooks";
import {
  UnidadeIdentificacaoSection,
  UnidadeEnderecoSection,
  UnidadeOperacaoSection,
} from "./unidade";
import type { Unidade } from "@/types/database";

interface UnidadeFormDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  clienteId: number;
  editingUnidade?: Unidade | null;
  onSuccess?: () => void;
}

export function UnidadeFormDialog({
  isOpen,
  open,
  onClose,
  clienteId,
  editingUnidade = null,
  onSuccess,
}: UnidadeFormDialogProps) {
  const isDialogOpen = open ?? isOpen ?? false;

  const {
    form,
    isPending,
    isCepLoading,
    setIsCepLoading,
    handleFillMagic,
    onSubmit,
    onFormError,
    handleClose,
  } = useUnidadeForm({
    isDialogOpen,
    clienteId,
    editingUnidade,
    onClose,
    onSuccess,
  });

  return (
    <BaseDialog
      open={isDialogOpen}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      maxWidth="2xl"
      description="Formulário de cadastro e edição de unidade"
    >
      <BaseDialog.Header
        title={editingUnidade ? "Editar Unidade" : "Nova Unidade"}
        subtitle="Preencha os dados da filial ou unidade operacional"
        icon={<Building2 className="h-5 w-5" />}
        onClose={handleClose}
        leftAction={
          import.meta.env.DEV ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-[12px] border-border text-muted-foreground hover:text-foreground hover:bg-surface-alt"
              onClick={handleFillMagic}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body className="p-6 space-y-6">
        <Form {...form}>
          <form
            id="unidade-form"
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="space-y-6"
          >
            <UnidadeIdentificacaoSection
              control={form.control}
              errors={form.formState.errors}
            />

            <UnidadeEnderecoSection
              control={form.control}
              isCepLoading={isCepLoading}
              setIsCepLoading={setIsCepLoading}
            />

            <UnidadeOperacaoSection control={form.control} />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="unidade-form"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Unidade"}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
