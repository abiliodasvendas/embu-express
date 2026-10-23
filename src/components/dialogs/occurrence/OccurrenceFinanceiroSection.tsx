import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ParcelasPreview } from "@/components/common/ParcelasPreview";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { OccurrenceFormMode } from "@/types/enums";
import type { OccurrenceFormData } from "@/schemas/occurrenceSchema";

interface OccurrenceFinanceiroSectionProps {
  form: UseFormReturn<OccurrenceFormData>;
  mode?: OccurrenceFormMode;
  isEditing: boolean;
}

export function OccurrenceFinanceiroSection({
  form,
  mode,
  isEditing,
}: OccurrenceFinanceiroSectionProps) {
  const hasImpacto = form.watch("impacto_financeiro");
  const isParcelado = form.watch("is_parcelado");
  const qtdParcelas = form.watch("quantidade_parcelas");

  return (
    <>
      {(!mode || mode === OccurrenceFormMode.FINANCIAL) && (
        <FormField
          control={form.control}
          name="impacto_financeiro"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-muted/30 p-3.5 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Gera impacto financeiro?
                </FormLabel>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {mode === OccurrenceFormMode.FINANCIAL
                    ? "Obrigatório para lançamentos na aba financeira."
                    : "Se ativado, este valor será considerado no fechamento financeiro."}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mode === OccurrenceFormMode.FINANCIAL}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {hasImpacto && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tipo_lancamento"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    Lançamento <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-semibold"
                    >
                      <option value="">Selecione...</option>
                      <option value={LANCAMENTO_TIPO.SAIDA}>Saída (Débito)</option>
                      <option value={LANCAMENTO_TIPO.ENTRADA}>Entrada (Crédito)</option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    Valor <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {mode === OccurrenceFormMode.FINANCIAL && !isEditing && (
            <>
              <FormField
                control={form.control}
                name="is_parcelado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-muted/30 p-3.5 shadow-xs">
                    <div className="space-y-0.5 pr-2">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Ocorrência Parcelada?
                      </FormLabel>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Gera automaticamente ocorrências parceladas nos próximos meses.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("quantidade_parcelas", undefined);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isParcelado && (
                <FormField
                  control={form.control}
                  name="quantidade_parcelas"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 w-full">
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Quantidade de Parcelas <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2}
                          step={1}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          placeholder="Ex: 4"
                          className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isParcelado && qtdParcelas ? (
                <div className="pt-1">
                  <ParcelasPreview
                    dataBase={form.watch("data_ocorrencia")}
                    quantidadeParcelas={qtdParcelas || 0}
                    valorTotal={form.watch("valor")}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </>
  );
}
