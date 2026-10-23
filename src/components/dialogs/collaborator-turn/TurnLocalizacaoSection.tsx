import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { TurnFormInput } from "@/schemas/turnSchema";
import { MapPin } from "lucide-react";

interface TurnLocalizacaoSectionProps {
  control: Control<TurnFormInput>;
}

export function TurnLocalizacaoSection({ control }: TurnLocalizacaoSectionProps) {
  return (
    <section>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-foreground" /> Localização & Raio
      </h3>
      <div className="bg-muted/20 p-5 rounded-[20px] border border-border shadow-2xs">
        <FormField
          control={control}
          name="validar_localizacao"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-background p-3.5 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
                  Validar localização ao registrar atividade
                </FormLabel>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Obriga o colaborador a registrar atividade dentro do raio geográfico
                  configurado da unidade deste turno.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
