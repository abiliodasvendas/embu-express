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
import { cn } from "@/lib/utils";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { cnpjMask, pixMask } from "@/utils/masks";
import { PIX_TYPES } from "@/constants/financeiro.constants";
import { DollarSign } from "lucide-react";

interface FinancialSectionProps {
  form: UseFormReturn<SelfRegistrationFormData>;
}

export function FinancialSection({ form }: FinancialSectionProps) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            Dados Financeiros & Pix
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Informações para repasses e remuneração operacional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                CNPJ (MEI) <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="00.000.000/0000-00"
                  {...field}
                  onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                  maxLength={18}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_chave_pix"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Tipo de Chave Pix <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    form.setValue("chave_pix", "");
                  }}
                  error={!!fieldState.error}
                >
                  <option value="">Selecione o tipo</option>
                  <option value={PIX_TYPES.CPF}>CPF</option>
                  <option value={PIX_TYPES.CNPJ}>CNPJ</option>
                  <option value={PIX_TYPES.EMAIL}>E-mail</option>
                  <option value={PIX_TYPES.TELEFONE}>Telefone</option>
                  <option value={PIX_TYPES.ALEATORIA}>Chave Aleatória</option>
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chave_pix"
          render={({ field, fieldState }) => {
            const tipoChavePix = form.watch("tipo_chave_pix");
            return (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground">
                  Chave Pix <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={!tipoChavePix}
                    className={cn(
                      fieldState.error && "border-destructive focus:border-destructive",
                      !tipoChavePix && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder={tipoChavePix ? "Digite a chave Pix" : "Selecione o tipo primeiro"}
                    {...field}
                    onChange={(e) => {
                      field.onChange(pixMask(e.target.value, tipoChavePix));
                    }}
                    maxLength={
                      tipoChavePix === PIX_TYPES.CPF ? 14 :
                      tipoChavePix === PIX_TYPES.CNPJ ? 18 :
                      tipoChavePix === PIX_TYPES.TELEFONE ? 15 :
                      tipoChavePix === PIX_TYPES.ALEATORIA ? 36 : 100
                    }
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive ml-1" />
              </FormItem>
            );
          }}
        />
      </div>
    </section>
  );
}
