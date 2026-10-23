import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { aplicarMascaraPlaca } from "@/utils/masks";
import { Briefcase } from "lucide-react";

interface VehicleSectionProps {
  form: UseFormReturn<SelfRegistrationFormData>;
}

export function VehicleSection({ form }: VehicleSectionProps) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            Dados da Moto
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Especificações do veículo utilizado para operações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="moto_modelo"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Modelo da Moto <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="Ex: CG 160 Fan"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moto_placa"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Placa <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn("uppercase", fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="ABC-1234 ou ABC1D23"
                  {...field}
                  onChange={(e) => field.onChange(aplicarMascaraPlaca(e.target.value))}
                  maxLength={8}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moto_cor"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Cor <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="Ex: Preta"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moto_ano"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Ano <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="Ex: 2024"
                  maxLength={4}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
