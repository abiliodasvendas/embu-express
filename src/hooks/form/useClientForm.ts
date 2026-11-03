import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormData } from "@/schemas/clientSchema";
import { Client } from "@/types/database";

interface UseClientFormProps {
  open: boolean;
  editingClient?: Client | null;
}

export function useClientForm({ open, editingClient }: UseClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome_fantasia: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          ativo: editingClient.ativo,
        });
      } else {
        form.reset({
          nome_fantasia: "",
          ativo: true,
        });
      }
    }
  }, [open, editingClient, form]);

  return { form };
}
