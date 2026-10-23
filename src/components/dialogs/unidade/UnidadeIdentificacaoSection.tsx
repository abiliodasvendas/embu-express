import { Control, FieldErrors } from "react-hook-form";
import { Building2, FileText, Hash } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cnpjMask } from "@/utils/masks";
import { cn } from "@/lib/utils";
import type { UnidadeFormData } from "@/schemas/unidadeSchema";

interface UnidadeIdentificacaoSectionProps {
  control: Control<UnidadeFormData>;
  errors: FieldErrors<UnidadeFormData>;
}

export function UnidadeIdentificacaoSection({
  control,
  errors,
}: UnidadeIdentificacaoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-5 rounded-[18px] border border-border">
      <FormField
        control={control}
        name="nome_unidade"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="text-xs font-semibold text-foreground">
              Nome da Unidade / Filial <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Ex: Matriz, Filial 1, Galpão A"
                  className={cn(
                    "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                    errors.nome_unidade && "border-destructive focus-visible:ring-destructive/20",
                  )}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="razao_social"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Razão Social <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Nome de registro fiscal"
                  className={cn(
                    "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                    errors.razao_social && "border-destructive focus-visible:ring-destructive/20",
                  )}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              CNPJ <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="00.000.000/0000-00"
                  className={cn(
                    "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                    errors.cnpj && "border-destructive focus-visible:ring-destructive/20",
                  )}
                  {...field}
                  onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
