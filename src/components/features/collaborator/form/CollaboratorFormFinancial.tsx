import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PIX_TYPES } from "@/constants/financeiro.constants";
import { cn } from "@/lib/utils";
import { Empresa } from "@/types/database";
import { cnpjMask, pixMask } from "@/utils/masks";
import { useFormContext } from "react-hook-form";
import { MoneyInput } from "@/components/forms/MoneyInput";

interface CollaboratorFormFinancialProps {
  empresas?: Empresa[];
}

export function CollaboratorFormFinancial({ empresas }: CollaboratorFormFinancialProps) {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="cnpj"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                CNPJ (MEI)

              </FormLabel>
              <FormControl>
                <Input
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    form.formState.errors.cnpj && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          name="valor_mei"
          control={form.control}
          render={({ field }) => (
            <MoneyInput
              field={field}
              label="Valor MEI"
              labelClassName="text-xs font-semibold text-foreground"
              placeholder="R$ 0,00"
            />
          )}
        />

        <FormField
          name="tipo_chave_pix"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Tipo de Chave PIX

              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val);
                    form.setValue("chave_pix", "");
                    form.clearErrors("chave_pix");
                  }}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal"
                >
                  <option value="">Selecione o tipo de chave</option>
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
          name="chave_pix"
          control={form.control}
          render={({ field }) => {
            const tipoChavePix = form.watch("tipo_chave_pix");
            return (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground">
                  Chave PIX
  
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={!tipoChavePix}
                    className={cn(
                      "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                      form.formState.errors.chave_pix && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    {...field}
                    onChange={(e) => {
                      field.onChange(pixMask(e.target.value, tipoChavePix));
                    }}
                    maxLength={
                      tipoChavePix === PIX_TYPES.CPF
                        ? 14
                        : tipoChavePix === PIX_TYPES.CNPJ
                        ? 18
                        : tipoChavePix === PIX_TYPES.TELEFONE
                        ? 15
                        : tipoChavePix === PIX_TYPES.ALEATORIA
                        ? 36
                        : 100
                    }
                    placeholder={tipoChavePix ? "Insira a chave PIX" : "Selecione o tipo primeiro"}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive ml-1" />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
