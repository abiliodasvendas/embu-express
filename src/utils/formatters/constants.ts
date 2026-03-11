export const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentYear = new Date().getFullYear();

export const anos = Array.from({ length: 5 }, (_, i) => {
  const year = (currentYear - 2 + i).toString();
  return { value: year, label: year };
});

export const tiposPagamento = [
  { value: "PIX", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao-debito", label: "Cartão de Débito" },
  { value: "cartao-credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export const periodos = [
  { value: "integral", label: "Integral" },
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export const DIAS_SEMANA = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];
