import { Control } from "react-hook-form";
import { Zap } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WeeklyScaleSelection } from "@/components/common/WeeklyScaleSelection";
import type { UnidadeFormData } from "@/schemas/unidadeSchema";

interface UnidadeOperacaoSectionProps {
  control: Control<UnidadeFormData>;
}

export function UnidadeOperacaoSection({ control }: UnidadeOperacaoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-5 rounded-[18px] border border-border">
      <FormField
        control={control}
        name="km_contratados"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              KM Contratados (Mês) <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  className="pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ativo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border p-3.5 bg-background mt-auto">
            <FormLabel className="text-xs font-semibold text-foreground">Unidade Ativa</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="escala_semanal"
        render={({ field }) => (
          <FormItem className="md:col-span-2 space-y-3">
            <FormLabel className="text-xs font-semibold text-foreground">
              Escala Semanal da Unidade <span className="text-destructive">*</span>
            </FormLabel>
            <WeeklyScaleSelection value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
