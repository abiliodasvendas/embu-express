import { messages } from "@/constants/messages";
import { isValidCEPFormat, isValidCNPJ, isValidCPF, isValidCpfCnpj } from "@/utils/validators";
import { z } from "zod";
import { onlyNumbers } from "@/utils/string";

export const cpfSchema = z.string().min(1, messages.validacao.campoObrigatorio).refine((val) => isValidCPF(val), {
  message: "CPF inválido",
});

export const cnpjSchema = z.string().min(1, messages.validacao.campoObrigatorio).refine((val) => isValidCNPJ(val), {
  message: "CNPJ inválido",
});

export const cpfCnpjSchema = z.string().min(1, messages.validacao.campoObrigatorio).refine((val) => isValidCpfCnpj(val), {
  message: "CPF ou CNPJ inválido",
});

export const phoneSchema = z
  .string()
  .min(1, messages.validacao.campoObrigatorio)
  .refine((val) => {
    const clean = onlyNumbers(val);
    return clean.length >= 10 && clean.length <= 11;
  }, "Telefone inválido")
  .transform((val) => onlyNumbers(val));

export const optionalPhoneSchema = z
  .string()
  .optional()
  .nullable()
  .refine((val) => {
    if (!val) return true;
    const clean = onlyNumbers(val);
    return clean.length >= 10; // Basic check for optional phone
  }, "Telefone inválido")
  .transform((val) => (val ? onlyNumbers(val) : val));

export const placaSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Let superRefine or .min(1) handle mandatory check
      const limpa = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
      // Antigo: ABC-1234, Mercosul: ABC1D23
      return /^[A-Z]{3}[0-9]{4}$/.test(limpa) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(limpa);
    },
    { message: "Placa inválida (Padrão Mercosul ou Antigo)" }
  )
  .transform((val) => val.toUpperCase());

export const emailSchema = z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido");

export const cepSchema = z.string().refine((val) => isValidCEPFormat(val), {
  message: "Formato inválido (00000-000)",
});

import { isValidDateBr } from "@/utils/validators";

export function dateSchema(required: boolean = false, allowFuture: boolean = false) {
  if (required) {
    return z.string().min(1, "Campo obrigatório").refine((val) => isValidDateBr(val, allowFuture), {
      message: "Data inválida ou inexistente",
    });
  }
  return z.string().optional().refine((val) => {
    if (!val) return true;
    return isValidDateBr(val, allowFuture);
  }, "Data inválida ou inexistente");
}