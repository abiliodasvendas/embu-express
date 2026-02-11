import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfSchema, emailSchema } from "./common";

export const userProfileSchema = z.object({
  nome_completo: z.string().min(2, messages.validacao.campoObrigatorio),
  cpf: cpfSchema,
  email: emailSchema,
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const changePasswordSchema = z.object({
  senhaAtual: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"), // Message not in constants exactly for length
  novaSenha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
