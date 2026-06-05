import { z } from "zod";
import { messages } from "@/constants/messages";
import { TicketType, TicketPriority } from "@/types/enums";

export const ticketSchema = z.object({
  title: z.string({ required_error: messages.validacao.campoObrigatorio })
    .trim()
    .min(1, messages.validacao.campoObrigatorio)
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(255),
  description: z.string({ required_error: messages.validacao.campoObrigatorio })
    .trim()
    .min(1, messages.validacao.campoObrigatorio)
    .min(5, "A descrição deve ter pelo menos 5 caracteres"),
  type: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.nativeEnum(TicketType, {
      required_error: messages.validacao.campoObrigatorio,
      invalid_type_error: messages.validacao.campoObrigatorio,
    })
  ),
  priority: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.nativeEnum(TicketPriority, {
      required_error: messages.validacao.campoObrigatorio,
      invalid_type_error: messages.validacao.campoObrigatorio,
    })
  ),
  attachments: z.array(z.string()).default([]),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
