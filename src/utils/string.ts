export function cleanString(str: string, capitalize = false) {
  if (!str) return "";

  let cleaned = str.trim().replace(/\s+/g, " ");

  if (capitalize) {
    cleaned = cleaned
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return cleaned;
}

export function truncate(value: string, length = 50, suffix = "...") {
  if (!value) return "";
  if (value.length <= length) return value;
  return `${value.substring(0, length).trim()}${suffix}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Remove todos os caracteres que não são dígitos de uma string.
 * Útil para limpar CPFs, CNPJs, CEPs, etc antes de enviar para o backend.
 */
export function onlyNumbers(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\D/g, "");
}

