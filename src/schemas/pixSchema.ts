import { isValidCNPJ, isValidCPF } from "@/utils/validators";
import { z } from "zod";

export const pixKeyRefinement = (
  data: { tipo_chave_pix?: string | null; chave_pix?: string | null },
  ctx: z.RefinementCtx
) => {
  // Se não tiver chave, não valida (campos opcionais ou vazios)
  if (!data.chave_pix || data.chave_pix.length === 0) return;

  // Se tiver chave mas não tiver tipo
  if (!data.tipo_chave_pix) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione o tipo de chave",
      path: ["tipo_chave_pix"],
    });
    return;
  }

  const tipo = data.tipo_chave_pix;
  const valor = data.chave_pix;

  if (tipo === "CPF") {
    if (!isValidCPF(valor)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ["chave_pix"],
      });
    }
  } else if (tipo === "CNPJ") {
    if (!isValidCNPJ(valor)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido",
        path: ["chave_pix"],
      });
    }
  } else if (tipo === "EMAIL") {
    if (!z.string().email().safeParse(valor).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "E-mail inválido",
        path: ["chave_pix"],
      });
    }
  } else if (tipo === "TELEFONE") {
    const cleaned = valor.replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefone inválido",
        path: ["chave_pix"],
      });
    }
  } else if (tipo === "ALEATORIA") {
    const cleanKey = valor.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanKey.length !== 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chave aleatória inválida (32 caracteres)",
        path: ["chave_pix"],
      });
    }
  }
};
