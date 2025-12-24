/**
 * Formata cores e textos de status para o componente StatusBadge
 */

export const getStatusColor = (status: string) => {
  const s = status.toLowerCase();

  // Status de Cliente/Funcionário
  if (s === "ativo") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "inativo") return "bg-slate-50 text-slate-600 border-slate-200";

  // Status de Ponto
  if (s === "verde") return "bg-green-500 text-white border-transparent";
  if (s === "amarelo") return "bg-yellow-500 text-white border-transparent";
  if (s === "vermelho") return "bg-red-500 text-white border-transparent";
  if (s === "cinza") return "bg-gray-400 text-white border-transparent";

  return "bg-gray-50 text-gray-600 border-gray-200";
};

export const getStatusText = (status: string) => {
  const s = status.toLowerCase();

  const map: Record<string, string> = {
    ativo: "Ativo",
    inativo: "Inativo",
    verde: "Verde",
    amarelo: "Amarelo",
    vermelho: "Vermelho",
    cinza: "N/A",
  };

  return map[s] || status;
};
