import { useMemo } from "react";
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
import {
  TIPO_PERIODO_FATURA,
  TipoPeriodoFaturaType,
} from "@/constants/financeiro.constants";
import { FaturaFormData } from "@/schemas/faturaSchema";
import { Client } from "@/types/database";
import { meses } from "@/utils/formatters/constants";
import {
  getSemanasCompetenciaUI,
  getQuinzenasCompetenciaUI,
  getMensalCompetenciaUI,
} from "@/utils/domain/periodoFaturamentoUtils";

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
  const mesAtual = form.watch("mes_competencia") || 1;
  const anoAtual = form.watch("ano_competencia") || new Date().getFullYear();
  const clienteId = form.watch("cliente_id");

  const clienteSel = useMemo(
    () => clientes.find((c) => c.id === clienteId),
    [clientes, clienteId]
  );

  const semanas = useMemo(
    () => getSemanasCompetenciaUI(mesAtual, anoAtual),
    [mesAtual, anoAtual]
  );

  const quinzenas = useMemo(
    () => getQuinzenasCompetenciaUI(mesAtual, anoAtual),
    [mesAtual, anoAtual]
  );

  const mensal = useMemo(
    () => getMensalCompetenciaUI(mesAtual, anoAtual, clienteSel?.dia_vencimento_padrao || 10),
    [mesAtual, anoAtual, clienteSel]
  );

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
                onChange={(e) => {
                  const novoMes = Number(e.target.value);
                  field.onChange(novoMes);
                }}
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
                  const val = e.target.value as TipoPeriodoFaturaType;
                  field.onChange(val);
                  form.setValue("numero_periodo", 1);

                  const valorCadastrado = Number(
                    clienteSel?.valor_contrato_mensal || clienteSel?.valor_base || 0
                  );

                  if (val === TIPO_PERIODO_FATURA.SEMANAL) {
                    const s1 = semanas[0];
                    if (s1) {
                      form.setValue("data_vencimento", s1.data_vencimento, { shouldValidate: true });
                    }
                    if (valorCadastrado > 0) {
                      form.setValue("valor_faturado", valorCadastrado, { shouldValidate: true });
                    }
                  } else if (val === TIPO_PERIODO_FATURA.QUINZENAL) {
                    const q1 = quinzenas[0];
                    if (q1) {
                      form.setValue("data_vencimento", q1.data_vencimento, { shouldValidate: true });
                    }
                    if (valorCadastrado > 0) {
                      const valorSugerido = Math.round((valorCadastrado / 2) * 100) / 100;
                      form.setValue("valor_faturado", valorSugerido, { shouldValidate: true });
                    }
                  } else {
                    const m1 = mensal[0];
                    if (m1) {
                      form.setValue("data_vencimento", m1.data_vencimento, { shouldValidate: true });
                    }
                    if (valorCadastrado > 0) {
                      form.setValue("valor_faturado", valorCadastrado, { shouldValidate: true });
                    }
                  }
                }}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
              >
                <option value={TIPO_PERIODO_FATURA.QUINZENAL}>Quinzenal</option>
                <option value={TIPO_PERIODO_FATURA.MENSAL}>Mensal (Integral)</option>
                <option value={TIPO_PERIODO_FATURA.SEMANAL}>Semanal</option>
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
              ) : selectedTipoPeriodo === TIPO_PERIODO_FATURA.SEMANAL ? (
                <NativeSelect
                  value={String(field.value)}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    field.onChange(num);
                    const semanaEscolhida = semanas.find((s) => s.numero_periodo === num);
                    if (semanaEscolhida) {
                      form.setValue("data_vencimento", semanaEscolhida.data_vencimento, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                >
                  {semanas.map((s) => (
                    <option key={s.numero_periodo} value={String(s.numero_periodo)}>
                      {s.descricao}
                    </option>
                  ))}
                </NativeSelect>
              ) : (
                <NativeSelect
                  value={String(field.value)}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    field.onChange(num);
                    const qEscolhida = quinzenas.find((q) => q.numero_periodo === num);
                    if (qEscolhida) {
                      form.setValue("data_vencimento", qEscolhida.data_vencimento, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold shadow-xs"
                >
                  {quinzenas.map((q) => (
                    <option key={q.numero_periodo} value={String(q.numero_periodo)}>
                      {q.descricao}
                    </option>
                  ))}
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
