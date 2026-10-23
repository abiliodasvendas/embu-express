import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LancamentoConvenioFormValues } from "@/schemas/convenioSchema";

interface LancamentoDescricaoSectionProps {
  form: UseFormReturn<LancamentoConvenioFormValues>;
}

export function LancamentoDescricaoSection({
  form,
}: LancamentoDescricaoSectionProps) {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-semibold text-foreground">
            Descrição dos serviços / peças <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Ex: Troca de óleo, pastilhas de freio traseiras, relação..."
              className="rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all min-h-[85px] resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs text-destructive ml-1" />
        </FormItem>
      )}
    />
  );
}
