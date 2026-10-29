import { isAxiosError } from "axios";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useMovimentacaoAvulsaForm } from "@/hooks/form/useMovimentacaoAvulsaForm";
import { MovimentacaoAvulsaFormData } from "@/schemas/movimentacaoAvulsaSchema";
import {
  MovimentacaoAvulsa,
  TipoMovimentacaoAvulsa,
  CategoriaMovimentacaoAvulsa,
} from "@/types/database";
import {
  TIPO_MOVIMENTACAO_AVULSA,
  CATEGORIAS_ENTRADA,
  CATEGORIAS_SAIDA,
} from "@/constants/financeiro.constants";
import { toast } from "sonner";
import { Banknote, Wand2 } from "lucide-react";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { mockGenerator } from "@/utils/mocks/generator";
import { TipoMovimentacaoToggle } from "./movimentacao-avulsa/TipoMovimentacaoToggle";
import { MovimentacaoAvulsaCampos } from "./movimentacao-avulsa/MovimentacaoAvulsaCampos";

export interface MovimentacaoAvulsaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  forcedTipo?: TipoMovimentacaoAvulsa;
  onSuccess?: () => void | Promise<void>;
}

export function MovimentacaoAvulsaFormDialog({
  open,
  onOpenChange,
  movimentacaoToEdit,
  forcedTipo,
  onSuccess,
}: MovimentacaoAvulsaFormDialogProps) {
  const { createMutation, updateMutation } = useMovimentacoesAvulsas();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });

  const defaultEmpresaId = empresas[0]?.id;
  const { form } = useMovimentacaoAvulsaForm({
    open,
    movimentacaoToEdit,
    defaultEmpresaId,
    forcedTipo,
  });

  const tipo = form.watch("tipo_movimentacao");
  const empresaId = form.watch("empresa_id");
  const { contas = [] } = useContasBancarias(empresaId ? Number(empresaId) : undefined);

  const categoriasDisponiveis =
    tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  const handleTipoChange = (novoTipo: TipoMovimentacaoAvulsa) => {
    form.setValue("tipo_movimentacao", novoTipo);
    if (novoTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA) {
      form.setValue("categoria", CATEGORIAS_ENTRADA[0]);
    } else {
      form.setValue("categoria", CATEGORIAS_SAIDA[0]);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: MovimentacaoAvulsaFormData) => {
    const payload = {
      tipo_movimentacao: values.tipo_movimentacao,
      empresa_id: Number(values.empresa_id),
      conta_bancaria_id:
        values.conta_bancaria_id && values.conta_bancaria_id !== "none"
          ? values.conta_bancaria_id
          : null,
      categoria: values.categoria as CategoriaMovimentacaoAvulsa,
      descricao: values.descricao.trim(),
      valor: values.valor,
      data_movimentacao: values.data_movimentacao,
    };

    try {
      if (movimentacaoToEdit) {
        await updateMutation.mutateAsync({ id: movimentacaoToEdit.id, data: payload });
        toast.success("Movimentação atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Lançamento avulso registrado com sucesso!");
      }
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao salvar movimentação avulsa.";
      toast.error(msg);
    }
  };

  const handleFillMock = () => {
    const empId = empresas[0]?.id || 1;
    const mockData = mockGenerator.movimentacaoAvulsa(empId);
    form.reset(mockData);
  };

  const handleClose = () => {
    if (isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={<Banknote className="h-5 w-5 text-foreground" />}
        title={
          movimentacaoToEdit
            ? "Editar Movimentação Avulsa"
            : forcedTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
            ? "Nova Entrada Avulsa"
            : forcedTipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
            ? "Nova Saída Avulsa"
            : "Novo Lançamento Avulso"
        }
        subtitle={
          forcedTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
            ? "Registre fretes esporádicos, rendimentos ou outros créditos avulsos em conta bancária."
            : forcedTipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
            ? "Registre tarifas bancárias, retiradas ou outras despesas operacionais avulsas."
            : "Registre entradas ou saídas pontuais na conta bancária que não passam por fatura ou folha."
        }
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
              <TipoMovimentacaoToggle
                tipo={tipo}
                forcedTipo={forcedTipo}
                onTipoChange={handleTipoChange}
              />

              <MovimentacaoAvulsaCampos
                control={form.control}
                empresas={empresas}
                contas={contas}
                categoriasDisponiveis={categoriasDisponiveis}
              />
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
              label={movimentacaoToEdit ? "Salvar Alterações" : "Confirmar Lançamento"}
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

export default MovimentacaoAvulsaFormDialog;
