import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aplicarMascaraPlaca, dateMask } from "@/utils/masks";
import { onlyNumbers } from "@/utils/string";
import { useFormContext } from "react-hook-form";

export function CollaboratorFormCNH() {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="cnh_registro"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Registro CNH

            </FormLabel>
            <FormControl>
              <Input
                placeholder="Número do registro"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                  errors.cnh_registro && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cnh_vencimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Vencimento CNH

            </FormLabel>
            <FormControl>
              <Input
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                  errors.cnh_vencimento && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
                onChange={(e) => field.onChange(dateMask(e.target.value))}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cnh_categoria"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Categoria

            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: A, AB"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal uppercase",
                  errors.cnh_categoria && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function CollaboratorFormMoto() {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <FormField
        name="moto_modelo"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Modelo da Moto

            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Honda CG 160"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                  errors.moto_modelo && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />

      <FormField
        name="moto_cor"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Cor

            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Preta"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                  errors.moto_cor && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />

      <FormField
        name="moto_ano"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Ano

            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: 2023"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                  errors.moto_ano && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
                maxLength={4}
                onChange={(e) => field.onChange(onlyNumbers(e.target.value).slice(0, 4))}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />

      <FormField
        name="moto_placa"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-foreground">
              Placa

            </FormLabel>
            <FormControl>
              <Input
                placeholder="ABC-1234"
                className={cn(
                  "h-11 rounded-[18px] bg-background border-border text-sm font-normal uppercase",
                  errors.moto_placa && "border-destructive focus-visible:ring-destructive/20"
                )}
                {...field}
                maxLength={8}
                onChange={(e) => field.onChange(aplicarMascaraPlaca(e.target.value))}
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive ml-1" />
          </FormItem>
        )}
      />
    </div>
  );
}
