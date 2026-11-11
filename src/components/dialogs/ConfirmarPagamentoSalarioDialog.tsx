import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { ContaBancariaSelect } from "@/components/ui/ContaBancariaSelect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useConfirmarPagamentoSalarioForm } from "@/hooks/form/useConfirmarPagamentoSalarioForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ConfirmarPagamentoSalarioFormData } from "@/schemas/confirmarPagamentoSalarioSchema";
import { formatCurrency } from "@/utils/formatters/currency";
import { CheckCircle2 } from "lucide-react";

export interface ConfirmarPagamentoSalarioSubmitPayload {
  contaBancariaId: string;
  dataPagamento: string;
}

export interface ConfirmarPagamentoSalarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorLiquido: number;
  colaboradorNome?: string;
  referenciaLabel?: string;
  contaBancariaInicialId?: string | null;
  onConfirm: (payload: ConfirmarPagamentoSalarioSubmitPayload) => Promise<void>;
  isLoading?: boolean;
}

export function ConfirmarPagamentoSalarioDialog({
  open,
  onOpenChange,
  valorLiquido,
  colaboradorNome,
  referenciaLabel,
  contaBancariaInicialId,
  onConfirm,
  isLoading = false,
}: ConfirmarPagamentoSalarioDialogProps) {
  const { contas = [] } = useContasBancarias();
  const contasAtivas = contas.filter((c) => c.ativo !== false);
  const [internalLoading, setInternalLoading] = useState(false);

  const { form } = useConfirmarPagamentoSalarioForm({
    open,
    contaBancariaInicialId,
  });

  const showLoading = isLoading || internalLoading;

  const handleSubmit = async (values: ConfirmarPagamentoSalarioFormData) => {
    setInternalLoading(true);
    try {
      await onConfirm({
        contaBancariaId: values.conta_bancaria_id,
        dataPagamento: values.data_pagamento,
      });
      safeCloseDialog(() => onOpenChange(false));
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    if (showLoading) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="md"
      lockClose={showLoading}
    >
      <BaseDialog.Header
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        title="Confirmar Pagamento de Salário"
        subtitle={
          colaboradorNome
            ? `${colaboradorNome}${referenciaLabel ? ` • Ref. ${referenciaLabel}` : ""}`
            : "Confirme a conta bancária e a data para liquidar o fechamento mensal."
        }
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="w-full space-y-4 pt-1">
          <div className="p-4 rounded-[18px] bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">
                Saldo Líquido a Pagar
              </span>
              <span className="text-[11px] text-muted-foreground">
                Valor calculado no fechamento (não editável)
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold tabular-nums text-foreground">
              {formatCurrency(valorLiquido)}
            </span>
          </div>

          {contasAtivas.length === 0 && (
            <Banner
              variant="warning"
              description="Nenhuma conta bancária ativa encontrada. Cadastre uma conta em Financeiro > Contas Bancárias para registrar o pagamento."
            />
          )}

          <Form {...form}>
            <form
              id="confirmar-pagamento-salario-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="conta_bancaria_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Conta Bancária Pagadora <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <ContaBancariaSelect
                        contas={contasAtivas}
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={showLoading || contasAtivas.length === 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Data do Pagamento <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-11 rounded-[18px] text-sm font-medium bg-background"
                        disabled={showLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={showLoading}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label={showLoading ? "Processando..." : "Confirmar Pagamento"}
          variant="primary"
          isLoading={showLoading}
          disabled={showLoading || contasAtivas.length === 0}
          type="submit"
          form="confirmar-pagamento-salario-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ConfirmarPagamentoSalarioDialog;
