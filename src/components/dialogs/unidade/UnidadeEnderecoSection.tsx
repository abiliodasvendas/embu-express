import { Control } from "react-hook-form";
import { MapPin } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CepInput } from "@/components/forms";
import type { UnidadeFormData } from "@/schemas/unidadeSchema";

interface UnidadeEnderecoSectionProps {
  control: Control<UnidadeFormData>;
  isCepLoading: boolean;
  setIsCepLoading: (loading: boolean) => void;
}

export function UnidadeEnderecoSection({
  control,
  isCepLoading,
  setIsCepLoading,
}: UnidadeEnderecoSectionProps) {
  return (
    <div className="bg-muted/30 p-5 rounded-[18px] border border-border space-y-4">
      <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        Endereço da Unidade
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <FormField
          control={control}
          name="cep"
          render={({ field }) => (
            <div className="md:col-span-2">
              <CepInput
                field={field}
                required
                inputClassName="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                onLoadingChange={setIsCepLoading}
              />
            </div>
          )}
        />

        <FormField
          control={control}
          name="logradouro"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-semibold text-foreground">
                Logradouro <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                  disabled={isCepLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Número <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complemento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-semibold text-foreground">Complemento</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bairro"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-semibold text-foreground">
                Bairro <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                  disabled={isCepLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cidade"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Cidade <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                  disabled={isCepLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estado"
          render={({ field }) => (
            <FormItem className="md:col-span-1">
              <FormLabel className="text-xs font-semibold text-foreground">
                UF <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                  disabled={isCepLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
