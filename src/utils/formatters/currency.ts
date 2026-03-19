/**
 * Converte uma string de moeda (ex: R$ 1.234,56) para number (ex: 1234.56)
 */
export function moneyToNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (!value) return 0;

  const numericString = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return parseFloat(numericString) || 0;
}

/**
 * Formata um número para moeda BRL (ex: 1234.56 -> R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
