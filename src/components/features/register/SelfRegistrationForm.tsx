import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { Perfil } from "@/types/database";
import { isMotoboy } from "@/utils/business/roles";
import {
  PersonalSection,
  VehicleSection,
  CnhSection,
  FinancialSection,
} from "./sections";

interface SelfRegistrationFormProps {
  form: UseFormReturn<SelfRegistrationFormData>;
  onSubmit: (values: SelfRegistrationFormData) => Promise<void>;
  roles?: Perfil[];
}

export function SelfRegistrationForm({ form, onSubmit, roles }: SelfRegistrationFormProps) {
  const perfilId = form.watch("perfil_id");

  useEffect(() => {
    if (!roles) return;
    const motoboyRole = roles.find((r) => isMotoboy(r.nome));
    if (motoboyRole) {
      form.setValue("perfil_id", motoboyRole.id.toString());
    }
  }, [roles, form]);

  if (!perfilId) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-xs font-medium animate-pulse">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-9 sm:space-y-11 animate-in fade-in duration-300">
      <PersonalSection form={form} />
      <VehicleSection form={form} />
      <CnhSection form={form} />
      <FinancialSection form={form} />

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 rounded-[18px] text-sm font-semibold shadow-xs"
        >
          Solicitar Cadastro
        </Button>
      </div>
    </form>
  );
}
