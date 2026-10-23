import { Calendar } from "lucide-react";
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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ParcelasPreview } from "@/components/common/ParcelasPreview";
import { cn } from "@/lib/utils";
import { LancamentoConvenioFormValues } from "@/schemas/convenioSchema";

interface LancamentoValoresSectionProps {
  form: UseFormReturn<LancamentoConvenioFormValues>;
  isEditing: boolean;
}

export function LancamentoValoresSection({
  form,
  isEditing,
}: LancamentoValoresSectionProps) {
  const isParcelado = form.watch("is_parcelado");
  const quantidadeParcelas = form.watch("quantidade_parcelas");
  const dataLancamento = form.watch("data_lancamento");
  const valorTotal = form.watch("valor");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="data_lancamento"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Data <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    className="pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Valor <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />
      </div>

      {!isEditing && (
        <>
          <FormField
            control={form.control}
            name="is_parcelado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-muted/20 p-3.5 px-4">
                <div className="space-y-0.5 pr-2">
                  <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
                    Lançamento Parcelado?
                  </FormLabel>
                  <p className="text-[11px] text-muted-foreground">
                    Gera parcelas mensais automáticas nos fechamentos seguintes
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
                  <FormLabel className="text-xs font-semibold text-foreground">
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
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Ex: 4"
                      className={cn(
                        "h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                        form.formState.errors.quantidade_parcelas &&
                          "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />
          )}

          {isParcelado && quantidadeParcelas ? (
            <div className="pt-1">
              <ParcelasPreview
                dataBase={dataLancamento}
                quantidadeParcelas={quantidadeParcelas || 0}
                valorTotal={valorTotal}
              />
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
