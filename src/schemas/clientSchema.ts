import { messages } from "@/constants/messages";
import { validateEnderecoFields } from "@/utils/validators";
import { z } from "zod";
import { cepSchema, cnpjSchema } from "./common";

export const clientSchema = z.object({
  nome_fantasia: z.string().min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
  empresa_emissora_padrao_id: z.number().nullable().optional(),
  tipo_cobranca: z.enum(['FIXO_MENSAL', 'DIARIA_MOTOBOY', 'TAXA_ENTREGA']).optional(),
  valor_base: z.number().optional(),
  valor_diaria_glosa: z.number().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
