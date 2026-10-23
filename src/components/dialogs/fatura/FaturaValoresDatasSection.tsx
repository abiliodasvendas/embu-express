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
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { STATUS_FATURA } from "@/constants/financeiro.constants";
import { FaturaFormData } from "@/schemas/faturaSchema";

interface FaturaValoresDatasSectionProps {
  form: UseFormReturn<FaturaFormData>;
}

export function FaturaValoresDatasSection({ form }: FaturaValoresDatasSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="data_emissao"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">Data de Emissão</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium shadow-xs"
                  aria-invalid={!!fieldState.error}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_vencimento"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Data de Vencimento <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium shadow-xs"
                  aria-invalid={!!fieldState.error}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="valor_faturado"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Valor Faturado (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value || 0}
                  onChange={field.onChange}
                  placeholder="0,00"
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                  aria-invalid={!!fieldState.error}
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
              <FormLabel className="text-xs font-semibold text-foreground">Status da Fatura</FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                >
                  <option value={STATUS_FATURA.PENDENTE}>Pendente / Aguardando</option>
                  <option value={STATUS_FATURA.PAGO_PARCIAL}>Pago Parcial</option>
                  <option value={STATUS_FATURA.LIQUIDADA}>Quitado / Recebido</option>
                  <option value={STATUS_FATURA.CANCELADA}>Cancelada</option>
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="numero_os"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Número da OS (Ordem de Serviço)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: OS-10492 ou 4821"
                value={field.value || ""}
                onChange={field.onChange}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium shadow-xs"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Observações da Fatura
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva detalhes, acordos adicionais ou informações da fatura..."
                value={field.value || ""}
                onChange={field.onChange}
                rows={2}
                className="rounded-[18px] bg-background border-border text-xs sm:text-sm shadow-xs"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />
    </>
  );
}
