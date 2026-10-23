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
import { dateMask } from "@/utils/masks";
import { CreditCard } from "lucide-react";

interface CnhSectionProps {
  form: UseFormReturn<SelfRegistrationFormData>;
}

export function CnhSection({ form }: CnhSectionProps) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            Dados da CNH
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Documentação de habilitação de trânsito
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="cnh_registro"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Registro CNH <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="Nº Registro"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnh_vencimento"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Vencimento <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  {...field}
                  onChange={(e) => field.onChange(dateMask(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnh_categoria"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Categoria <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn("uppercase", fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="Ex: A, AB"
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
