import { Control } from "react-hook-form";
import { MoneyInput } from "@/components/forms/MoneyInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TurnFormInput } from "@/schemas/turnSchema";
import { DollarSign } from "lucide-react";

interface TurnFinanceiroSectionProps {
  control: Control<TurnFormInput>;
}

export function TurnFinanceiroSection({ control }: TurnFinanceiroSectionProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-foreground" /> Remuneração / Ganhos
        </h3>

        <div className="bg-muted/20 p-5 rounded-[20px] border border-border shadow-2xs space-y-4">
          <FormField
            control={control}
            name="data_inicio"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Data de Início <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="valor_contrato"
            render={({ field }) => (
              <MoneyInput
                field={field}
                label="Valor Contrato"
                required={true}
                labelClassName="text-xs font-semibold text-foreground ml-1"
              />
            )}
          />

          <div className="pt-1 grid grid-cols-1 gap-3.5">
            <FormField
              control={control}
              name="valor_bonus"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Bônus de Atividade"
                  labelClassName="text-xs font-semibold text-foreground ml-1"
                />
              )}
            />
            <FormField
              control={control}
              name="valor_aluguel"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Aluguel Veículo"
                  labelClassName="text-xs font-semibold text-foreground ml-1"
                />
              )}
            />
            <FormField
              control={control}
              name="ajuda_custo"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Ajuda de Custo"
                  labelClassName="text-xs font-semibold text-foreground ml-1"
                />
              )}
            />
            <FormField
              control={control}
              name="taxa_entrega"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  label="Taxa Entrega"
                  labelClassName="text-xs font-semibold text-foreground ml-1"
                />
              )}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-destructive" /> Descontos
        </h3>

        <div className="bg-muted/20 p-5 rounded-[20px] border border-border shadow-2xs space-y-3">
          <FormField
            control={control}
            name="valor_adiantamento"
            render={({ field }) => (
              <MoneyInput
                field={field}
                label="Adiantamento"
                labelClassName="text-xs font-semibold text-destructive ml-1"
              />
            )}
          />
          <p className="text-xs text-muted-foreground ml-1 leading-relaxed">
            Este valor será incluído e descontado após a confirmação do adiantamento no fechamento financeiro.
          </p>
        </div>
      </section>
    </div>
  );
}
