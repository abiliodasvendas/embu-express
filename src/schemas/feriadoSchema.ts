import { z } from "zod";

export const feriadoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export type FeriadoFormValues = z.infer<typeof feriadoSchema>;
