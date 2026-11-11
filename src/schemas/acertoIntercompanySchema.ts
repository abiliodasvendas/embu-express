import { z } from "zod";

export const acertoIntercompanyFormSchema = z.object({
  data_acerto: z
    .string({ required_error: "Informe a data da transferência / acerto" })
    .min(1, "Informe a data da transferência / acerto"),
  observacao: z.string().optional(),
});

export type AcertoIntercompanyFormData = z.infer<typeof acertoIntercompanyFormSchema>;
