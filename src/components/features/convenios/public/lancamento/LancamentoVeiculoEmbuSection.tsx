import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { LancamentoConvenioFormValues } from "@/schemas/convenioSchema";

interface LancamentoVeiculoEmbuSectionProps {
  form: UseFormReturn<LancamentoConvenioFormValues>;
}

export function LancamentoVeiculoEmbuSection({
  form,
}: LancamentoVeiculoEmbuSectionProps) {
  return (
    <FormField
      control={form.control}
      name="moto_embu"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-muted/20 p-3.5 px-4">
          <div className="space-y-0.5 pr-2">
            <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
              Veículo da Embu Express?
            </FormLabel>
            <p className="text-[11px] text-muted-foreground">
              Ative se for moto ou veículo pertencente à frota da empresa
            </p>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
