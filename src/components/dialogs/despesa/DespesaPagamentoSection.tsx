import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import { DespesaFormData } from "@/schemas/despesaSchema";
import { ContaBancaria } from "@/types/database";

interface DespesaPagamentoSectionProps {
  form: UseFormReturn<DespesaFormData>;
  status: string;
  contas: ContaBancaria[];
}

export function DespesaPagamentoSection({
  form,
  status,
  contas,
}: DespesaPagamentoSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="valor_previsto"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Valor Previsto (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="0,00"
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Status do Pagamento
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value={STATUS_DESPESA.PENDENTE}>A Pagar (Pendente)</option>
                  <option value={STATUS_DESPESA.PAGO}>Pago / Liquidado</option>
                  <option value={STATUS_DESPESA.ADIADA}>Adiada</option>
                  <option value={STATUS_DESPESA.CANCELADO}>Cancelada</option>
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conta_bancaria_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Conta Bancária {status === STATUS_DESPESA.PAGO && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                >
                  <option value="">{status === STATUS_DESPESA.PAGO ? "Selecione a conta..." : "Conta não definida"}</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.banco_nome} - Ag: {conta.agencia || "S/A"} CC: {conta.conta || "S/C"}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      {status === STATUS_DESPESA.PAGO && (
        <div className="p-3.5 bg-muted/30 border border-border rounded-[18px] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="valor_pago"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Valor Efetivamente Pago (R$)
                </FormLabel>
                <FormControl>
                  <MoneyInput
                    value={field.value || form.getValues("valor_previsto")}
                    onChange={field.onChange}
                    placeholder="0,00"
                    className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_pagamento"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Data do Pagamento
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value || form.getValues("data_vencimento")}
                    onChange={field.onChange}
                    className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
}
