import { UseFormReturn } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { Banner } from "@/components/ui/Banner";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LancamentoConvenioFormValues } from "@/schemas/convenioSchema";

interface LancamentoColaboradorSectionProps {
  form: UseFormReturn<LancamentoConvenioFormValues>;
  collaboratorOptions: Array<{ value: string; label: string }>;
  isPublicBlocked: boolean;
  publicBlockedReason?: string;
  isAdminWarning: boolean;
  adminWarningReason?: string;
}

export function LancamentoColaboradorSection({
  form,
  collaboratorOptions,
  isPublicBlocked,
  publicBlockedReason,
  isAdminWarning,
  adminWarningReason,
}: LancamentoColaboradorSectionProps) {
  return (
    <FormField
      control={form.control}
      name="colaborador_id"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-semibold text-foreground">
            Colaborador <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Combobox
              options={collaboratorOptions}
              value={field.value || ""}
              onSelect={field.onChange}
              placeholder="Pesquisar..."
              searchPlaceholder="Buscar por nome..."
              emptyText="Nenhum colaborador ativo."
            />
          </FormControl>
          <FormMessage className="text-xs text-destructive ml-1" />
          {isPublicBlocked && (
            <Banner
              variant="destructive"
              title="Lançamento Não Autorizado"
              description={publicBlockedReason}
              className="mt-2"
            />
          )}
          {isAdminWarning && (
            <Banner
              variant="warning"
              title="Atenção: Colaborador com Restrição"
              description={
                adminWarningReason ||
                "Este colaborador possui restrição ativa de convênio. Como operador administrativo, você pode prosseguir para registrar como exceção."
              }
              className="mt-2"
            />
          )}
        </FormItem>
      )}
    />
  );
}
