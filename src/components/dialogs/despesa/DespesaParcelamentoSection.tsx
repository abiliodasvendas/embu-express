import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { ParcelasPreview } from "@/components/common/ParcelasPreview";
import { DespesaFormData } from "@/schemas/despesaSchema";
import { DespesaOperacional } from "@/types/database";
import { DESPESA_ESCOPO_ACAO } from "@/constants/financeiro.constants";
import { cn } from "@/lib/utils";

interface DespesaParcelamentoSectionProps {
  form: UseFormReturn<DespesaFormData>;
  despesaToEdit?: DespesaOperacional | null;
}

export function DespesaParcelamentoSection({
  form,
  despesaToEdit,
}: DespesaParcelamentoSectionProps) {
  if (despesaToEdit) {
    const isParceladoEdit = Boolean(
      despesaToEdit.grupo_parcelamento_id &&
      despesaToEdit.total_parcelas &&
      despesaToEdit.total_parcelas > 1
    );
    const isRecorrenteEdit = Boolean(!isParceladoEdit && despesaToEdit.is_recorrente);

    if (!isParceladoEdit && !isRecorrenteEdit) {
      return null;
    }

    const numeroParcela = despesaToEdit.numero_parcela || 1;
    const totalParcelas = despesaToEdit.total_parcelas || 1;

    return (
      <div className="bg-muted/20 border border-border rounded-[20px] p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Escopo da Alteração
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isParceladoEdit
              ? `Esta despesa faz parte de um parcelamento (parcela ${numeroParcela} de ${totalParcelas}). Onde deseja aplicar as mudanças?`
              : "Esta despesa possui recorrência mensal. Onde deseja aplicar as mudanças?"}
          </p>
        </div>

        <FormField
          control={form.control}
          name="escopo"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormControl>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(DESPESA_ESCOPO_ACAO.UNICA)}
                    className={cn(
                      "p-3 rounded-[16px] border text-left transition-all text-xs cursor-pointer flex flex-col justify-between",
                      field.value === DESPESA_ESCOPO_ACAO.UNICA
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs font-semibold text-foreground"
                        : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <span className="font-semibold text-foreground block">
                      {isParceladoEdit ? `Apenas parcela ${numeroParcela}` : "Apenas este mês"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Altera apenas este lançamento pontual.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.onChange(DESPESA_ESCOPO_ACAO.FUTURAS)}
                    className={cn(
                      "p-3 rounded-[16px] border text-left transition-all text-xs cursor-pointer flex flex-col justify-between",
                      field.value === DESPESA_ESCOPO_ACAO.FUTURAS
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs font-semibold text-foreground"
                        : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <span className="font-semibold text-foreground block">
                      Esta e as futuras
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {isParceladoEdit
                        ? `Aplica da parcela ${numeroParcela} até a ${totalParcelas}.`
                        : "Aplica para este mês e próximas competências."}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.onChange(DESPESA_ESCOPO_ACAO.TODAS)}
                    className={cn(
                      "p-3 rounded-[16px] border text-left transition-all text-xs cursor-pointer flex flex-col justify-between",
                      field.value === DESPESA_ESCOPO_ACAO.TODAS
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs font-semibold text-foreground"
                        : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <span className="font-semibold text-foreground block">
                      Todas as parcelas
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {isParceladoEdit
                        ? `Atualiza todas as ${totalParcelas} parcelas pendentes.`
                        : "Atualiza a despesa mestre e histórico."}
                    </span>
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>
    );
  }

  const isParcelado = form.watch("is_parcelado");
  const isRecorrente = form.watch("is_recorrente");
  const quantidadeParcelas = form.watch("quantidade_parcelas");

  return (
    <div className="bg-muted/20 border border-border rounded-[20px] p-4 space-y-3.5">
      <div>
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Parcelamento ou Recorrência Fixa
        </span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Gere automaticamente as contas dos próximos meses (ex: obras parceladas ou contas fixas).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <FormField
          control={form.control}
          name="is_parcelado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[16px] border border-border bg-background p-3 shadow-2xs">
              <div className="space-y-0.5 pr-2">
                <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
                  Despesa Parcelada
                </FormLabel>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Ex: Obras ou compras em N vezes
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue("is_recorrente", false);
                      form.setValue("quantidade_parcelas", 10);
                    } else {
                      form.setValue("quantidade_parcelas", undefined);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_recorrente"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-[16px] border border-border bg-background p-3 shadow-2xs">
              <div className="space-y-0.5 pr-2">
                <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
                  Recorrência Fixa Mensal
                </FormLabel>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Ex: Aluguel, contador, internet
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue("is_parcelado", false);
                      form.setValue("quantidade_parcelas", undefined);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {isParcelado && (
        <div className="space-y-2 pt-1 border-t border-border">
          <FormField
            control={form.control}
            name="quantidade_parcelas"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Quantidade de Parcelas <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={60}
                    placeholder="Ex: 10"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-10 rounded-[14px] bg-background text-xs sm:text-sm font-medium w-full sm:w-48"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          {quantidadeParcelas && quantidadeParcelas >= 2 ? (
            <ParcelasPreview
              dataBase={form.watch("data_vencimento")}
              quantidadeParcelas={Number(quantidadeParcelas)}
              valorTotal={Number(form.watch("valor_previsto") || 0)}
            />
          ) : null}
        </div>
      )}

      {isRecorrente && (
        <div className="pt-1 border-t border-border">
          <Banner
            variant="info"
            description="Despesa contínua: projetada automaticamente todo mês com base no valor e dia informados. Ajustes futuros alteram apenas o mês correspondente."
          />
        </div>
      )}
    </div>
  );
}
