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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { getMessage } from "@/constants/messages";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useConfirmarAdiantamentoForm } from "@/hooks/form/useConfirmarAdiantamentoForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ConfirmarAdiantamentoFormData } from "@/schemas/confirmarAdiantamentoSchema";
import { Wallet } from "lucide-react";

export interface ConfirmarAdiantamentoSubmitPayload {
  valor: number;
  contaBancariaId: string;
  dataPagamento: string;
}

export interface ConfirmarAdiantamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorSugerido: number;
  colaboradorNome?: string;
  referenciaLabel?: string;
  contaBancariaInicialId?: string | null;
  dataPagamentoInicial?: string | null;
  isEditMode?: boolean;
  onConfirm: (payload: ConfirmarAdiantamentoSubmitPayload) => Promise<void>;
  isLoading?: boolean;
}

export default function ConfirmarAdiantamentoDialog({
  open,
  onOpenChange,
  valorSugerido,
  colaboradorNome,
  referenciaLabel,
  contaBancariaInicialId,
  dataPagamentoInicial,
  isEditMode = false,
  onConfirm,
  isLoading = false,
}: ConfirmarAdiantamentoDialogProps) {
  const { contas = [] } = useContasBancarias();
  const contasAtivas = contas.filter((c) => c.ativo !== false);
  const [internalLoading, setInternalLoading] = useState(false);

  const { form } = useConfirmarAdiantamentoForm({
    open,
    valorSugerido,
    contaBancariaInicialId,
    dataPagamentoInicial,
  });

  const showLoading = isLoading || internalLoading;

  const handleSubmit = async (values: ConfirmarAdiantamentoFormData) => {
    setInternalLoading(true);
    try {
      await onConfirm({
        valor: Number(values.valor),
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
        icon={<Wallet className="w-5 h-5 text-foreground" />}
        title={
          isEditMode
            ? "Editar Pagamento de Adiantamento"
            : getMessage("financeiro.confirmacao.adiantamento.titulo")
        }
        subtitle={
          colaboradorNome
            ? `${colaboradorNome}${referenciaLabel ? ` • Ref. ${referenciaLabel}` : ""}`
            : getMessage("financeiro.confirmacao.adiantamento.descricao")
        }
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="w-full space-y-4 pt-1">
          {contasAtivas.length === 0 && (
            <Banner
              variant="warning"
              description="Nenhuma conta bancária ativa encontrada. Cadastre uma conta em Financeiro > Contas Bancárias para registrar o pagamento."
            />
          )}

          <Form {...form}>
            <form
              id="confirmar-adiantamento-form"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Valor do Adiantamento (R$) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 rounded-[18px] text-sm font-semibold bg-background"
                          disabled={showLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
          label={
            showLoading
              ? "Processando..."
              : isEditMode
              ? "Salvar Alterações"
              : "Confirmar Adiantamento"
          }
          variant="primary"
          isLoading={showLoading}
          disabled={showLoading || contasAtivas.length === 0}
          type="submit"
          form="confirmar-adiantamento-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
