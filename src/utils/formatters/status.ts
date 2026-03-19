/**
 * Formata cores e textos de status para o componente StatusBadge
 */
import { messages } from "@/constants/messages";
import { StatusUsuario, StatusVisualPonto } from "@/types/enums";

export const getStatusColor = (status?: string | boolean | null) => {
  if (status === undefined || status === null) return "bg-gray-50 text-gray-600 border-gray-200";

  const s = String(status).toUpperCase();

  // Status de Cliente/Colaborador
  if (s === StatusUsuario.ATIVO.toUpperCase() || s === "TRUE") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === StatusUsuario.INATIVO.toUpperCase() || s === "FALSE") return "bg-slate-50 text-slate-600 border-slate-200";
  if (s === StatusUsuario.PENDENTE.toUpperCase()) return "bg-yellow-50 text-yellow-700 border-yellow-100";

  // Status de Ponto
  if (s === StatusVisualPonto.VERDE) return "bg-green-500 text-white border-transparent";
  if (s === StatusVisualPonto.AMARELO) return "bg-yellow-500 text-white border-transparent";
  if (s === StatusVisualPonto.VERMELHO) return "bg-red-500 text-white border-transparent";
  if (s === StatusVisualPonto.CINZA) return "bg-gray-400 text-white border-transparent";

  return "bg-gray-50 text-gray-600 border-gray-200";
};

export const getStatusText = (status?: string | boolean | null) => {
  if (status === undefined || status === null) return "Indefinido";

  const s = String(status).toUpperCase();

  const map: Record<string, string> = {
    [StatusUsuario.ATIVO]: messages.labels.ativo,
    TRUE: messages.labels.ativo,
    [StatusUsuario.INATIVO]: messages.labels.inativo,
    FALSE: messages.labels.inativo,
    [StatusUsuario.PENDENTE]: messages.labels.pendente,
    [StatusVisualPonto.VERDE]: messages.labels.verde,
    [StatusVisualPonto.AMARELO]: messages.labels.amarelo,
    [StatusVisualPonto.VERMELHO]: messages.labels.vermelho,
    [StatusVisualPonto.CINZA]: messages.labels.cinza,
  };

  return map[s] || String(status);
};
