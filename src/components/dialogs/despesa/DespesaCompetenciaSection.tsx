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
import { DespesaFormData } from "@/schemas/despesaSchema";
import { meses } from "@/utils/formatters/constants";

interface DespesaCompetenciaSectionProps {
  form: UseFormReturn<DespesaFormData>;
}

export function DespesaCompetenciaSection({ form }: DespesaCompetenciaSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <FormField
        control={form.control}
        name="mes_competencia"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Mês Competência <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <NativeSelect
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
              >
                {meses.map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ano_competencia"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Ano Competência <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="data_vencimento"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Vencimento <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />
    </div>
  );
}
