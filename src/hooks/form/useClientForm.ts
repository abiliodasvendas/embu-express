import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormData } from "@/schemas/clientSchema";
import { Client } from "@/types/database";
import {
  PERIODICIDADE_FATURAMENTO,
  TIPO_COBRANCA_CLIENTE,
} from "@/constants/financeiro.constants";

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
      empresa_emissora_padrao_id: null,
      tipo_cobranca: TIPO_COBRANCA_CLIENTE.DIARIA_MOTOBOY,
      periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
      dia_vencimento_padrao: 16,
      valor_contrato_mensal: 0,
      valor_base: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          ativo: editingClient.ativo,
          empresa_emissora_padrao_id: editingClient.empresa_emissora_padrao_id ?? null,
          tipo_cobranca: (editingClient.tipo_cobranca as ClientFormData["tipo_cobranca"]) || TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
          periodicidade: (editingClient.periodicidade as ClientFormData["periodicidade"]) || PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: editingClient.dia_vencimento_padrao || 16,
          valor_contrato_mensal: editingClient.valor_contrato_mensal ?? editingClient.valor_base ?? 0,
          valor_base: editingClient.valor_contrato_mensal ?? editingClient.valor_base ?? 0,
        });
      } else {
        form.reset({
          nome_fantasia: "",
          ativo: true,
          empresa_emissora_padrao_id: null,
          tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
          periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: 16,
          valor_contrato_mensal: 0,
          valor_base: 0,
        });
      }
    }
  }, [open, editingClient, form]);

  return { form };
}
