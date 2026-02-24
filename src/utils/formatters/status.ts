/**
 * Formata cores e textos de status para o componente StatusBadge
 */
import { messages } from "@/constants/messages";
import { STATUS_PONTO } from "@/constants/ponto";
import { STATUS_CADASTRO } from "@/constants/cadastro";

export const getStatusColor = (status?: string | boolean | null) => {
  if (status === undefined || status === null) return "bg-gray-50 text-gray-600 border-gray-200";

  const s = String(status).toUpperCase();

  // Status de Cliente/Colaborador
  if (s === STATUS_CADASTRO.ATIVO.toUpperCase() || s === "TRUE") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === STATUS_CADASTRO.INATIVO.toUpperCase() || s === "FALSE") return "bg-slate-50 text-slate-600 border-slate-200";
  if (s === STATUS_CADASTRO.PENDENTE.toUpperCase()) return "bg-yellow-50 text-yellow-700 border-yellow-100";

  // Status de Ponto
  if (s === STATUS_PONTO.VERDE) return "bg-green-500 text-white border-transparent";
  if (s === STATUS_PONTO.AMARELO) return "bg-yellow-500 text-white border-transparent";
  if (s === STATUS_PONTO.VERMELHO) return "bg-red-500 text-white border-transparent";
  if (s === STATUS_PONTO.CINZA) return "bg-gray-400 text-white border-transparent";

  return "bg-gray-50 text-gray-600 border-gray-200";
};

export const getStatusText = (status?: string | boolean | null) => {
  if (status === undefined || status === null) return "Indefinido";

  const s = String(status).toUpperCase();

  const map: Record<string, string> = {
    [STATUS_CADASTRO.ATIVO]: messages.labels.ativo,
    TRUE: messages.labels.ativo,
    [STATUS_CADASTRO.INATIVO]: messages.labels.inativo,
    FALSE: messages.labels.inativo,
    [STATUS_CADASTRO.PENDENTE]: messages.labels.pendente,
    [STATUS_PONTO.VERDE]: messages.labels.verde,
    [STATUS_PONTO.AMARELO]: messages.labels.amarelo,
    [STATUS_PONTO.VERMELHO]: messages.labels.vermelho,
    [STATUS_PONTO.CINZA]: messages.labels.cinza,
  };

  return map[s] || String(status);
};
