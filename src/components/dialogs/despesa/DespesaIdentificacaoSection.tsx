import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { CATEGORIA_DESPESA_LABELS } from "@/constants/financeiro.constants";
import { DespesaFormData } from "@/schemas/despesaSchema";
import { Empresa } from "@/types/database";

interface DespesaIdentificacaoSectionProps {
  form: UseFormReturn<DespesaFormData>;
  empresas: Empresa[];
}

export function DespesaIdentificacaoSection({
  form,
  empresas,
}: DespesaIdentificacaoSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Descrição da Conta <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Aluguel do Galpão Principal, DAS do mês, Seguro Frota"
                {...field}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Categoria de Despesa <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  {Object.entries(CATEGORIA_DESPESA_LABELS).map(([catKey, catLabel]) => (
                    <option key={catKey} value={catKey}>
                      {catLabel}
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
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Empresa Pagadora (CNPJ) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    form.setValue("is_holding", e.target.value === "holding");
                  }}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="holding">Geral da Holding (Rateio entre CNPJs)</option>
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
    </>
  );
}
