export const getAvatarStyles = (ativo: boolean) => {
  return ativo
    ? "bg-muted/70 text-foreground border border-border"
    : "bg-muted/40 text-muted-foreground border border-border";
};

export const getPageNumbers = (
  current: number,
  totalPages: number
): (number | string)[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, 3, "...", totalPages];
  }
  if (current >= totalPages - 1) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", current, "...", totalPages];
};
