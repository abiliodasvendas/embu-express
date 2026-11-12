import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMovimentacaoAvulsaForm } from "@/hooks/form/useMovimentacaoAvulsaForm";
import { ModoLancamentoAvulso } from "@/schemas/movimentacaoAvulsaSchema";
import { MovimentacaoAvulsa, TipoMovimentacaoAvulsa } from "@/types/database";
import {
  MODO_LANCAMENTO_AVULSO,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";
import { ArrowLeftRight, Banknote, Wand2 } from "lucide-react";
import { TipoMovimentacaoToggle } from "./movimentacao-avulsa/TipoMovimentacaoToggle";
import { MovimentacaoAvulsaCampos } from "./movimentacao-avulsa/MovimentacaoAvulsaCampos";

export interface MovimentacaoAvulsaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  forcedTipo?: TipoMovimentacaoAvulsa;
  initialMode?: ModoLancamentoAvulso;
  contaBancariaInicialId?: string | null;
  empresaIdInicial?: number | null;
  onSuccess?: () => void | Promise<void>;
}

export function MovimentacaoAvulsaFormDialog({
  open,
  onOpenChange,
  movimentacaoToEdit,
  forcedTipo,
  initialMode,
  contaBancariaInicialId,
  empresaIdInicial,
  onSuccess,
}: MovimentacaoAvulsaFormDialogProps) {
  const {
    form,
    modo,
    empresas,
    contasAtivas,
    contasEmpresa,
    contaOrigemId,
    categoriasOpcoes,
    categoriaSelecionadaAfetaDre,
    isPending,
    handleModoChange,
    handleGerenciarCategorias,
    handleFillMock,
    handleClose,
    onSubmit,
  } = useMovimentacaoAvulsaForm({
    open,
    onOpenChange,
    movimentacaoToEdit,
    forcedTipo,
    initialMode,
    contaBancariaInicialId,
    empresaIdInicial,
    onSuccess,
  });

  const isTransferencia = modo === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={
          isTransferencia ? (
            <ArrowLeftRight className="h-5 w-5 text-foreground" />
          ) : (
            <Banknote className="h-5 w-5 text-foreground" />
          )
        }
        title={
          movimentacaoToEdit
            ? "Editar Movimentação Avulsa"
            : isTransferencia
            ? "Transferência entre Contas"
            : forcedTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
            ? "Nova Entrada Avulsa"
            : forcedTipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
            ? "Nova Saída Avulsa"
            : "Novo Lançamento Bancário / Avulso"
        }
        subtitle={
          isTransferencia
            ? "Movimente saldo entre duas contas bancárias sem afetar o Resultado (DRE)."
            : "Registre entradas, saídas ou transferências diretamente na conta bancária."
        }
        onClose={handleClose}
        leftAction={
          process.env.NODE_ENV === "development" && !movimentacaoToEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillMock}
              className="h-9 px-2 rounded-[18px] text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                modo={modo}
                forcedTipo={forcedTipo}
                hideTransferencia={Boolean(movimentacaoToEdit)}
                onModoChange={handleModoChange}
              />

              <MovimentacaoAvulsaCampos
                control={form.control}
                modo={modo}
                empresas={empresas}
                contasEmpresa={contasEmpresa}
                todasContas={contasAtivas}
                contaOrigemId={contaOrigemId}
                categoriasOpcoes={categoriasOpcoes}
                categoriaSelecionadaAfetaDre={categoriaSelecionadaAfetaDre}
                onGerenciarCategorias={handleGerenciarCategorias}
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
              label={
                movimentacaoToEdit
                  ? "Salvar Alterações"
                  : isTransferencia
                  ? "Confirmar Transferência"
                  : "Confirmar Lançamento"
              }
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
