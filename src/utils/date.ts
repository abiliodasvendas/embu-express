export const formatDateToISO = (dateString: string | undefined | null): string | undefined => {
  if (!dateString) return undefined;
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString; // Return original if format is wrong
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};
