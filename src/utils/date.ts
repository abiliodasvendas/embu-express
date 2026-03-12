export const formatDateToISO = (dateString: string | undefined | null): string | undefined => {
  if (!dateString) return undefined;
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString; // Return original if format is wrong
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

export const getLocalDate = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(date);
  const find = (type: string) => parts.find(p => p.type === type)?.value;
  
  return `${find('year')}-${find('month')}-${find('day')}`;
};
