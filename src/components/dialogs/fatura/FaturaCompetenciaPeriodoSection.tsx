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
import { TIPO_PERIODO_FATURA } from "@/constants/financeiro.constants";
import { FaturaFormData } from "@/schemas/faturaSchema";
import { Client } from "@/types/database";
import { meses } from "@/utils/formatters/constants";

interface FaturaCompetenciaPeriodoSectionProps {
  form: UseFormReturn<FaturaFormData>;
  clientes: Client[];
  selectedTipoPeriodo: string;
}

export function FaturaCompetenciaPeriodoSection({
  form,
  clientes,
  selectedTipoPeriodo,
}: FaturaCompetenciaPeriodoSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <FormField
        control={form.control}
        name="mes_competencia"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">Mês</FormLabel>
            <FormControl>
              <NativeSelect
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
              >
                {meses.map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {m}
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
        name="ano_competencia"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">Ano</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium shadow-xs"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_periodo"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">Periodicidade</FormLabel>
            <FormControl>
              <NativeSelect
                value={field.value}
                onChange={(e) => {
                  const val = e.target.value as "QUINZENAL" | "MENSAL";
                  field.onChange(val);
                  form.setValue("numero_periodo", 1);
                  const mes = form.getValues("mes_competencia");
                  const ano = form.getValues("ano_competencia");
                  const mesStr = String(mes).padStart(2, "0");
                  const clienteSel = clientes.find((c) => c.id === form.getValues("cliente_id"));
                  const valorMensal = Number(clienteSel?.valor_contrato_mensal || clienteSel?.valor_base || 0);
                  if (valorMensal > 0) {
                    const valorSugerido =
                      val === TIPO_PERIODO_FATURA.QUINZENAL
                        ? Math.round((valorMensal / 2) * 100) / 100
                        : valorMensal;
                    form.setValue("valor_faturado", valorSugerido, { shouldValidate: true });
                  }
                  if (val === TIPO_PERIODO_FATURA.QUINZENAL) {
                    form.setValue("data_vencimento", `${ano}-${mesStr}-16`, { shouldValidate: true });
                  } else {
                    const dia = String(clienteSel?.dia_vencimento_padrao || 10).padStart(2, "0");
                    form.setValue("data_vencimento", `${ano}-${mesStr}-${dia}`, { shouldValidate: true });
                  }
                }}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
              >
                <option value={TIPO_PERIODO_FATURA.QUINZENAL}>Quinzenal</option>
                <option value={TIPO_PERIODO_FATURA.MENSAL}>Mensal (Integral)</option>
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numero_periodo"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">Período / Parcela</FormLabel>
            <FormControl>
              {selectedTipoPeriodo === TIPO_PERIODO_FATURA.MENSAL ? (
                <NativeSelect
                  value="1"
                  disabled
                  className="h-11 rounded-[18px] bg-muted/60 border-border text-xs sm:text-sm font-semibold shadow-xs cursor-not-allowed opacity-80"
                >
                  <option value="1">Mês Completo (Integral)</option>
                </NativeSelect>
              ) : (
                <NativeSelect
                  value={String(field.value)}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    field.onChange(num);
                    const mes = form.getValues("mes_competencia");
                    const ano = form.getValues("ano_competencia");
                    const mesStr = String(mes).padStart(2, "0");
                    const ultimoDia = new Date(ano, mes, 0).getDate();
                    if (num === 1) {
                      form.setValue("data_vencimento", `${ano}-${mesStr}-16`, { shouldValidate: true });
                    } else {
                      form.setValue("data_vencimento", `${ano}-${mesStr}-${String(ultimoDia).padStart(2, "0")}`, { shouldValidate: true });
                    }
                  }}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                >
                  <option value="1">1ª Quinzena (01 a 15)</option>
                  <option value="2">2ª Quinzena (16 a 31)</option>
                </NativeSelect>
              )}
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />
    </div>
  );
}
