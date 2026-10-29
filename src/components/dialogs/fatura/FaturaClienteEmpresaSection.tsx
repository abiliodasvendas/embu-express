import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { getPeriodicidadeLabel } from "@/constants/financeiro.constants";
import { FaturaFormData } from "@/schemas/faturaSchema";
import { Client, Empresa } from "@/types/database";

interface FaturaClienteEmpresaSectionProps {
  form: UseFormReturn<FaturaFormData>;
  clientes: Client[];
  empresas: Empresa[];
  onClienteChange: (clienteId: number) => void;
}

export function FaturaClienteEmpresaSection({
  form,
  clientes,
  empresas,
  onClienteChange,
}: FaturaClienteEmpresaSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cliente_id"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Cliente <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <NativeSelect
                value={field.value ? String(field.value) : ""}
                onChange={(e) => onClienteChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                error={!!fieldState.error}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nome_fantasia} ({getPeriodicidadeLabel(c.periodicidade)})
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="empresa_id"
        render={({ field, fieldState }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              CNPJ Emissor <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <NativeSelect
                value={field.value ? String(field.value) : ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                error={!!fieldState.error}
              >
                <option value="">Selecione o CNPJ emissor</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.nome_fantasia || emp.razao_social}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />
    </div>
  );
}
