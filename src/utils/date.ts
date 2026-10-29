export const formatDateToISO = (dateString: string | undefined | null): string | undefined => {
  if (!dateString) return undefined;
  const trimmed = dateString.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parts = trimmed.split("/");
  if (parts.length !== 3) return undefined;

  const [day, month, rawYear] = parts;
  if (!day || !month || !rawYear) return undefined;

  let year = rawYear.trim();
  if (year.length === 2) {
    const num = parseInt(year, 10);
    year = num >= 50 ? `19${year}` : `20${year}`;
  }

  if (year.length !== 4) return undefined;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const getLocalDate = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const find = (type: string) => parts.find((p) => p.type === type)?.value;

  return `${find("year")}-${find("month")}-${find("day")}`;
};
