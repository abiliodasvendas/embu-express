import { isAxiosError } from "axios";
import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ContaBancariaSelect } from "@/components/ui/ContaBancariaSelect";
import { Banner } from "@/components/ui/Banner";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useLiquidarDespesaForm } from "@/hooks/form/useLiquidarDespesaForm";
import { LiquidarDespesaFormData } from "@/schemas/liquidarDespesaSchema";
import { DespesaOperacional } from "@/types/database";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { CATEGORIA_DESPESA_LABELS } from "@/constants/financeiro.constants";

export interface LiquidarDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa?: DespesaOperacional | null;
  onSuccess?: () => void | Promise<void>;
}

export function LiquidarDespesaDialog({
  open,
  onOpenChange,
  despesa,
  onSuccess,
}: LiquidarDespesaDialogProps) {
  const { pagarMutation } = useDespesas();
  const { contas = [] } = useContasBancarias();
  const { form } = useLiquidarDespesaForm({ open, despesa });

  if (!despesa) return null;

  const contasAtivas = contas.filter((c) => c.ativo !== false);

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleSubmit = async (values: LiquidarDespesaFormData) => {
    try {
      await pagarMutation.mutateAsync({
        id: despesa.id,
        data: {
          data_pagamento: values.data_pagamento,
          valor_pago: values.valor_pago,
          conta_bancaria_id: values.conta_bancaria_id,
        },
      });

      toast.success("Conta a pagar liquidada com sucesso!");
      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Erro ao liquidar despesa.";
      toast.error(msg);
    }
  };

  const categoriaLabel = CATEGORIA_DESPESA_LABELS[despesa.categoria] || despesa.categoria;

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="md"
      lockClose={pagarMutation.isPending}
    >
      <BaseDialog.Header
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        title="Liquidar Conta a Pagar"
        subtitle={`Quitação de compromisso: ${despesa.descricao}`}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <Banner variant="info">
            <div className="flex flex-col gap-0.5 text-xs">
              <span>
                <strong>Empresa:</strong> {despesa.empresa?.nome_fantasia || despesa.empresa?.razao_social || (despesa.is_holding ? "Holding / Matriz" : "Empresa não definida")}
              </span>
              <span>
                <strong>Categoria:</strong> {categoriaLabel}
              </span>
              <span>
                <strong>Vencimento Original:</strong> {formatDateToBR(despesa.data_vencimento)} (Previsto: {formatCurrency(despesa.valor_previsto)})
              </span>
            </div>
          </Banner>

          {contasAtivas.length === 0 && (
            <Banner
              variant="warning"
              description="Nenhuma conta bancária ativa cadastrada. Cadastre uma conta em Financeiro > Contas Bancárias para realizar a quitação."
            />
          )}

          <Form {...form}>
            <form id="liquidar-despesa-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="conta_bancaria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Conta Bancária Pagadora <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <ContaBancariaSelect
                        contas={contasAtivas}
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={pagarMutation.isPending || contasAtivas.length === 0}
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
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Data do Pagamento <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10 rounded-[18px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Valor Efetivamente Pago (R$) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <MoneyInput
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 rounded-[18px]"
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
          onClick={handleClose}
          disabled={pagarMutation.isPending}
          type="button"
        />
        <BaseDialog.Action
          label={pagarMutation.isPending ? "Liquidando..." : "Confirmar Quitação"}
          variant="primary"
          isLoading={pagarMutation.isPending}
          disabled={contasAtivas.length === 0 || pagarMutation.isPending}
          type="submit"
          form="liquidar-despesa-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default LiquidarDespesaDialog;
