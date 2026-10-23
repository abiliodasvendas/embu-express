import { Control } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { TurnFormInput } from "@/schemas/turnSchema";
import { Briefcase } from "lucide-react";

interface OptionItem {
  id: number | string;
  nome_fantasia?: string;
  nome_unidade?: string;
}

interface TurnInstitucionalSectionProps {
  control: Control<TurnFormInput>;
  clients?: OptionItem[];
  unidades?: OptionItem[];
  empresas?: OptionItem[];
  selectedClientId?: string;
}

export function TurnInstitucionalSection({
  control,
  clients,
  unidades,
  empresas,
  selectedClientId,
}: TurnInstitucionalSectionProps) {
  return (
    <section>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-foreground" /> Dados Institucionais
      </h3>
      <div className="bg-muted/20 p-5 rounded-[20px] border border-border shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="cliente_id"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Cliente <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Combobox
                    options={
                      clients?.map((client) => ({
                        value: client.id.toString(),
                        label: client.nome_fantasia || "",
                      })) || []
                    }
                    value={field.value}
                    onSelect={field.onChange}
                    placeholder="Selecione o Cliente"
                    modal={true}
                    className={cn(
                      "h-11 w-full rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs",
                      fieldState.error && "border-destructive focus:ring-destructive/20"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="unidade_id"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Unidade <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Combobox
                    options={
                      unidades?.map((unidade) => ({
                        value: unidade.id.toString(),
                        label: unidade.nome_unidade || "",
                      })) || []
                    }
                    value={field.value}
                    onSelect={field.onChange}
                    placeholder={
                      !selectedClientId ? "Aguardando Cliente" : "Selecione a Unidade"
                    }
                    disabled={!selectedClientId}
                    modal={true}
                    className={cn(
                      "h-11 w-full rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs disabled:opacity-60",
                      fieldState.error && "border-destructive focus:ring-destructive/20"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="empresa_id"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Empresa Contratante <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Combobox
                  options={
                    empresas?.map((emp) => ({
                      value: emp.id.toString(),
                      label: emp.nome_fantasia || "",
                    })) || []
                  }
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="Selecione a Empresa"
                  modal={true}
                  className={cn(
                    "h-11 w-full rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs",
                    fieldState.error && "border-destructive focus:ring-destructive/20"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
