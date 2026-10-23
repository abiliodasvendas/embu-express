import { useMemo } from "react";
import { isAxiosError } from "axios";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Banner } from "@/components/ui/Banner";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { useLiquidarFaturaForm } from "@/hooks/form/useLiquidarFaturaForm";
import { LiquidarFaturaFormData } from "@/schemas/liquidarFaturaSchema";
import { FaturaCliente } from "@/types/database";
import { toast } from "sonner";
import { Banknote, Loader2 } from "lucide-react";
import { formatCurrency, formatContaBancaria } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface LiquidarFaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fatura?: FaturaCliente | null;
  onSuccess?: () => void | Promise<void>;
}

export function LiquidarFaturaDialog({
  open,
  onOpenChange,
  fatura,
  onSuccess,
}: LiquidarFaturaDialogProps) {
  const { liquidarMutation } = useFaturas();
  const { contas = [] } = useContasBancarias();
  const { form } = useLiquidarFaturaForm({ open, fatura, contas });

  const valorFaturado = Number(fatura?.valor_faturado || 0);
  const valorJaPago = Number(fatura?.valor_pago || 0);
  const saldoRestante = Math.max(0, valorFaturado - valorJaPago);

  const contaBancariaId = form.watch("conta_bancaria_id");
  const contaSelecionada = useMemo(
    () => contas.find((c) => c.id === contaBancariaId),
    [contas, contaBancariaId]
  );

  const haIntercompany = useMemo(() => {
    if (!fatura || !contaSelecionada) return false;
    return fatura.empresa_id !== contaSelecionada.empresa_id;
  }, [fatura, contaSelecionada]);

  if (!fatura) return null;

  const handleSubmit = async (values: LiquidarFaturaFormData) => {
    try {
      await liquidarMutation.mutateAsync({
        id: fatura.id,
        payload: {
          conta_bancaria_id: values.conta_bancaria_id,
          data_recebimento: values.data_recebimento,
          valor_pago: values.valor_pago,
          observacao: values.observacao?.trim() || null,
        },
      });

      toast.success("Baixa na fatura realizada com sucesso!");
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao dar baixa na fatura.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (liquidarMutation.isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="lg"
      lockClose={liquidarMutation.isPending}
    >
      <BaseDialog.Header
        icon={<Banknote className="w-5 h-5 text-emerald-600" />}
        title="Receber / Dar Baixa na Fatura"
        subtitle={`Cliente: ${fatura.cliente?.nome_fantasia || "Não identificado"} • Vencimento: ${new Date(
          fatura.data_vencimento + "T00:00:00"
        ).toLocaleDateString("pt-BR")}`}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-[16px] text-xs">
            <div>
              <span className="text-muted-foreground block">Valor Faturado</span>
              <span className="font-semibold text-foreground text-sm">
                {formatCurrency(valorFaturado)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Já Recebido</span>
              <span className="font-semibold text-emerald-600 text-sm">
                {formatCurrency(valorJaPago)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Saldo em Aberto</span>
              <span className="font-bold text-primary text-sm">
                {formatCurrency(saldoRestante)}
              </span>
            </div>
          </div>

          {haIntercompany && (
            <Banner
              variant="warning"
              description={`A fatura pertence à empresa ${fatura.empresa?.nome_fantasia || `#${fatura.empresa_id}`}, mas o recebimento está entrando na conta da ${contaSelecionada?.empresa?.nome_fantasia || `#${contaSelecionada?.empresa_id}`}. Um acerto entre as empresas será registrado automaticamente para compensação posterior.`}
            />
          )}

          <Form {...form}>
            <form id="liquidar-fatura-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="conta_bancaria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Conta Bancária de Destino <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value || ""}
                        className="bg-background rounded-[18px]"
                      >
                        <option value="">Selecione a conta de recebimento...</option>
                        {contas.map((c) => (
                          <option key={c.id} value={c.id}>
                            {formatContaBancaria(c)}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data_recebimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data do Recebimento <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-background rounded-[18px]"
                        />
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
                      <FormLabel>
                        Valor Recebido (R$) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="R$ 0,00"
                          className="bg-background rounded-[18px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações do Recebimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Pagamento parcial via PIX, restante na próxima semana"
                        rows={2}
                        {...field}
                        className="bg-background rounded-[18px]"
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
          disabled={liquidarMutation.isPending}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label="Confirmar Recebimento"
          variant="primary"
          isLoading={liquidarMutation.isPending}
          type="submit"
          form="liquidar-fatura-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
