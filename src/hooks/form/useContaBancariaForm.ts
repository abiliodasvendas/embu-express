import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contaBancariaFormSchema,
  ContaBancariaFormData,
} from "@/schemas/contaBancariaSchema";

interface UseContaBancariaFormProps {
  defaultEmpresaId?: number;
}

export function useContaBancariaForm({ defaultEmpresaId }: UseContaBancariaFormProps = {}) {
  const form = useForm<ContaBancariaFormData>({
    resolver: zodResolver(contaBancariaFormSchema),
    defaultValues: {
      empresa_id: defaultEmpresaId || 0,
      banco_nome: "",
      agencia: "",
      conta: "",
      tipo_conta: "CORRENTE",
    },
  });

  useEffect(() => {
    if (defaultEmpresaId) {
      form.setValue("empresa_id", defaultEmpresaId);
    }
  }, [defaultEmpresaId, form]);

  return { form };
}
