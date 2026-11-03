import { useMemo } from "react";
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Banner } from "@/components/ui/Banner";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { formatContaBancaria } from "@/utils/formatters";
import {
  PERIODICIDADE_FATURAMENTO,
  PERIODICIDADE_FATURAMENTO_LABELS,
} from "@/constants/financeiro.constants";
import type { UnidadeFormData } from "@/schemas/unidadeSchema";
import { DollarSign } from "lucide-react";

interface UnidadeContratoSectionProps {
  control: Control<UnidadeFormData>;
  watch: UseFormWatch<UnidadeFormData>;
  setValue?: UseFormSetValue<UnidadeFormData>;
}

export function UnidadeContratoSection({ control, watch, setValue }: UnidadeContratoSectionProps) {
  const { data: empresas = [] } = useEmpresas();
  const { data: contas = [] } = useContasBancarias();
  const periodicidade = watch("periodicidade");
  const empresaEmissoraId = watch("empresa_emissora_padrao_id");

  const contasFiltradas = useMemo(() => {
    if (!empresaEmissoraId) return [];
    return contas.filter(
      (c) => c.ativo !== false && Number(c.empresa_id) === Number(empresaEmissoraId)
    );
  }, [contas, empresaEmissoraId]);

  return (
    <div className="space-y-4 bg-muted/30 p-5 rounded-[18px] border border-border">
      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Contrato & Faturamento da Unidade
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="empresa_emissora_padrao_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Empresa Emissora <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  value={field.value ? String(field.value) : ""}
                  onChange={(e) => {
                    const novoId = e.target.value ? Number(e.target.value) : undefined;
                    field.onChange(novoId);
                    if (setValue) {
                      setValue("conta_bancaria_padrao_id", "", { shouldValidate: true });
                    }
                  }}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                >
                  <option value="">Selecione a empresa emissora...</option>
                  {empresas
                    .filter((e) => e.ativo)
                    .map((emp) => (
                      <option key={emp.id} value={String(emp.id)}>
                        {emp.nome_fantasia} ({emp.cnpj})
                      </option>
                    ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conta_bancaria_padrao_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Conta Bancária <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || "")}
                  disabled={!empresaEmissoraId}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs disabled:opacity-60"
                >
                  <option value="">
                    {!empresaEmissoraId
                      ? "Selecione a empresa emissora antes..."
                      : contasFiltradas.length === 0
                      ? "Nenhuma conta cadastrada nesta empresa"
                      : "Selecione a conta bancária..."}
                  </option>
                  {contasFiltradas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {formatContaBancaria(conta)}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-3.5 ${
          periodicidade === PERIODICIDADE_FATURAMENTO.MENSAL ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <FormField
          control={control}
          name="periodicidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Periodicidade da Fatura <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  value={field.value || PERIODICIDADE_FATURAMENTO.QUINZENAL}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                >
                  <option value={PERIODICIDADE_FATURAMENTO.QUINZENAL}>
                    {PERIODICIDADE_FATURAMENTO_LABELS[PERIODICIDADE_FATURAMENTO.QUINZENAL]}
                  </option>
                  <option value={PERIODICIDADE_FATURAMENTO.MENSAL}>
                    {PERIODICIDADE_FATURAMENTO_LABELS[PERIODICIDADE_FATURAMENTO.MENSAL]}
                  </option>
                  <option value={PERIODICIDADE_FATURAMENTO.SEMANAL}>
                    {PERIODICIDADE_FATURAMENTO_LABELS[PERIODICIDADE_FATURAMENTO.SEMANAL]}
                  </option>
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        {periodicidade === PERIODICIDADE_FATURAMENTO.MENSAL && (
          <FormField
            control={control}
            name="dia_vencimento_padrao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground">
                  Dia do Vencimento <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ex: 10, 15 ou 25"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="valor_contrato_mensal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Valor do Contrato Mensal (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value || 0}
                  onChange={(val) => field.onChange(val)}
                  placeholder="0,00"
                  className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold focus:border-primary shadow-xs"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      {periodicidade === PERIODICIDADE_FATURAMENTO.QUINZENAL && (
        <Banner
          variant="info"
          title="Vencimentos Quinzenais da Unidade"
          description="A 1ª Quinzena vence no dia 16 e a 2ª Quinzena vence no último dia do mês."
        />
      )}

      {periodicidade === PERIODICIDADE_FATURAMENTO.SEMANAL && (
        <Banner
          variant="info"
          title="Ciclo Semanal da Unidade"
          description="Apuração de segunda a domingo com vencimento na terça-feira subsequente."
        />
      )}
    </div>
  );
}
