import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ManualTimeRecordFormValues } from "@/schemas/pontoSchema";
import { ColaboradorCliente, Usuario } from "@/types/database";

interface TimeRecordTurnoSectionProps {
  form: UseFormReturn<ManualTimeRecordFormValues>;
  selectedCollaborator?: Usuario | null;
  selectedCollaboratorId?: string;
  hasTurnos: boolean;
  isManualMode: boolean;
}

export function TimeRecordTurnoSection({
  form,
  selectedCollaborator,
  selectedCollaboratorId,
  hasTurnos,
  isManualMode,
}: TimeRecordTurnoSectionProps) {
  if (!isManualMode || !selectedCollaboratorId || !hasTurnos) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="colaborador_cliente_id"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-medium text-muted-foreground">
            Turno / Vínculo <span className="text-destructive">*</span>
          </FormLabel>
          <div className="space-y-2">
            {selectedCollaborator?.links?.map((link: ColaboradorCliente) => (
              <div
                key={link.id}
                onClick={() => field.onChange(String(link.id))}
                className={cn(
                  "flex items-center justify-between p-3 rounded-[16px] border transition-all cursor-pointer",
                  field.value === String(link.id)
                    ? "border-2 border-foreground/30 bg-muted/60 shadow-xs"
                    : "border-border hover:bg-muted/40 bg-background"
                )}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-tight">
                    {link.unidade?.nome_unidade}
                  </span>
                  <span className="text-[11px] text-muted-foreground italic">
                    {link.cliente?.nome_fantasia}
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground mt-0.5">
                    {link.hora_inicio?.slice(0, 5)} - {link.hora_fim?.slice(0, 5)}
                  </span>
                </div>
                {field.value === String(link.id) && (
                  <Check className="w-4 h-4 text-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
