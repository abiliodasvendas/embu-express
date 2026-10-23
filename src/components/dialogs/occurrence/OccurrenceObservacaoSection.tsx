import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { OccurrenceFormData } from "@/schemas/occurrenceSchema";

interface OccurrenceObservacaoSectionProps {
  control: Control<OccurrenceFormData>;
}

export function OccurrenceObservacaoSection({ control }: OccurrenceObservacaoSectionProps) {
  return (
    <FormField
      control={control}
      name="observacao"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-medium text-muted-foreground">
            Observação <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder="Detalhes adicionais da ocorrência..."
              className="min-h-[80px] rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
