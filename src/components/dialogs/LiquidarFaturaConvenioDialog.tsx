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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { NativeSelect } from "@/components/ui/native-select";
import { Banner } from "@/components/ui/Banner";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useLiquidarFaturaConvenio } from "@/hooks/api/useConvenioAuditoria";
import { useLiquidarFaturaConvenioForm } from "@/hooks/form/useLiquidarFaturaConvenioForm";
import { LiquidarFaturaConvenioFormData } from "@/schemas/liquidarFaturaConvenioSchema";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { formatContaBancaria } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { CheckCircle2, Loader2, Handshake } from "lucide-react";
import { useMemo } from "react";

export interface LiquidarFaturaConvenioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioId: string;
  convenioNome: string;
  faturaId?: string | null;
  mesCompetencia: number;
  anoCompetencia: number;
  dataVencimento: string;
  valorTotalFatura: number;
  empresaPadraoId?: number | null;
  contaBancariaPadraoId?: string | null;
  onSuccess?: () => void;
}

export function LiquidarFaturaConvenioDialog({
  open,
  onOpenChange,
  convenioId,
  convenioNome,
  faturaId,
  mesCompetencia,
  anoCompetencia,
  dataVencimento,
  valorTotalFatura,
  empresaPadraoId,
  contaBancariaPadraoId,
  onSuccess,
}: LiquidarFaturaConvenioDialogProps) {
  const { data: empresas = [] } = useEmpresas();
  const { data: contasBancarias = [] } = useContasBancarias();
  const liquidarMutation = useLiquidarFaturaConvenio();

  const { form } = useLiquidarFaturaConvenioForm({
    open,
    convenioId,
    faturaId,
    mesCompetencia,
    anoCompetencia,
    dataVencimento,
    valorTotalFatura,
    empresaPadraoId,
    contaBancariaPadraoId,
  });

  const selectedEmpresaId = form.watch("empresa_id");

  const contasFiltradas = useMemo(() => {
    if (!selectedEmpresaId) return contasBancarias.filter((c) => c.ativo);
    return contasBancarias.filter(
      (c) => c.ativo && Number(c.empresa_id) === Number(selectedEmpresaId)
    );
  }, [contasBancarias, selectedEmpresaId]);

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleSubmit = async (values: LiquidarFaturaConvenioFormData) => {
    try {
      await liquidarMutation.mutateAsync({
        fatura_id: values.fatura_id || null,
        convenio_id: values.convenio_id,
        mes_competencia: Number(values.mes_competencia),
        ano_competencia: Number(values.ano_competencia),
        data_vencimento: values.data_vencimento,
        valor_total_fatura: Number(values.valor_total_fatura),
        valor_pago: Number(values.valor_pago),
        data_pagamento: values.data_pagamento,
        empresa_id: Number(values.empresa_id),
        conta_bancaria_id: values.conta_bancaria_id,
        observacoes: values.observacoes || null,
      });

      toast.success("Fatura do convênio quitada com sucesso!");
      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Erro ao liquidar fatura do convênio.";
      toast.error(msg);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="md"
      lockClose={liquidarMutation.isPending}
    >
      <BaseDialog.Header
        icon={<Handshake className="w-5 h-5 text-foreground" />}
        title="Quitar Fatura de Convênio"
        subtitle={`${convenioNome} - Competência ${String(mesCompetencia).padStart(2, "0")}/${anoCompetencia}`}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <Banner variant="info">
            Liquidação da fatura com vencimento dia 15 referente aos abastecimentos e manutenções do convênio.
          </Banner>

          <Form {...form}>
            <form
              id="liquidar-fatura-convenio-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="valor_total_fatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Valor da Fatura <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10 rounded-[14px]"
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
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Valor Efetivamente Pago <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10 rounded-[14px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data_vencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Data de Vencimento <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 rounded-[14px]" />
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
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Data do Pagamento <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 rounded-[14px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="empresa_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Empresa Pagadora <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-10 rounded-[14px]"
                        >
                          <option value="">Selecione a empresa...</option>
                          {empresas
                            .filter((e) => e.ativo)
                            .map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.nome_fantasia}
                              </option>
                            ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conta_bancaria_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Conta Bancária de Débito <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 rounded-[14px]"
                        >
                          <option value="">Selecione a conta...</option>
                          {contasFiltradas.map((conta) => (
                            <option key={conta.id} value={conta.id}>
                              {formatContaBancaria(conta)}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Observações
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Pago via PIX, desconto negociado, etc."
                        {...field}
                        value={field.value || ""}
                        className="h-10 rounded-[14px]"
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
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={liquidarMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="liquidar-fatura-convenio-form"
          disabled={liquidarMutation.isPending}
        >
          {liquidarMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirmar Pagamento
            </>
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default LiquidarFaturaConvenioDialog;