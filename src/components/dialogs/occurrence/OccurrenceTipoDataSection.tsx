import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import type { OccurrenceFormData } from "@/schemas/occurrenceSchema";
import type { ColaboradorCliente } from "@/types/database";

interface OccurrenceTipoDataSectionProps {
  control: Control<OccurrenceFormData>;
  tipos: Array<{ id: number; descricao: string }>;
  links: ColaboradorCliente[];
}

export function OccurrenceTipoDataSection({
  control,
  tipos,
  links,
}: OccurrenceTipoDataSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={control}
          name="tipo_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Tipo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-semibold"
                >
                  <option value="">Selecione o tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.descricao}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="data_ocorrencia"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Data <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="colaborador_cliente_id"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Turno <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <NativeSelect
                value={field.value === null ? "none" : field.value || ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "none" ? null : e.target.value)
                }
                className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-semibold"
              >
                <option value="none">Geral (Avulsa)</option>
                {links.map((link) => (
                  <option key={link.id} value={String(link.id)}>
                    {link.cliente?.nome_fantasia || "Sem Cliente"}{" "}
                    {link.hora_inicio && link.hora_fim
                      ? `(${link.hora_inicio.slice(0, 5)} - ${link.hora_fim.slice(0, 5)})`
                      : ""}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
