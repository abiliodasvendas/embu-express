import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import type { OccurrenceFormData } from "@/schemas/occurrenceSchema";

interface OccurrenceColaboradorSectionProps {
  control: Control<OccurrenceFormData>;
  collaborators: Array<{ id: string | number; nome_completo: string }>;
}

export function OccurrenceColaboradorSection({
  control,
  collaborators,
}: OccurrenceColaboradorSectionProps) {
  return (
    <FormField
      control={control}
      name="colaborador_id"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-medium text-muted-foreground">
            Colaborador <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Combobox
              modal={true}
              options={collaborators.map((c) => ({
                value: String(c.id),
                label: c.nome_completo,
              }))}
              value={field.value}
              onSelect={field.onChange}
              placeholder="Selecione um colaborador"
              searchPlaceholder="Buscar colaborador..."
              emptyText="Nenhum colaborador encontrado."
              className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
