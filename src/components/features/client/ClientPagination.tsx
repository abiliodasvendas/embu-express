import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPageNumbers } from "./clientUtils";

interface ClientPaginationProps {
  currentPage: number;
  currentPageSize: number;
  totalPages: number;
  total: number;
  fromItem: number;
  toItem: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export function ClientPagination({
  currentPage,
  currentPageSize,
  totalPages,
  total,
  fromItem,
  toItem,
  onPageChange,
  onPageSizeChange,
}: ClientPaginationProps) {
  if (totalPages <= 1 && total <= 50) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 bg-card rounded-2xl border border-border shadow-xs w-full overflow-hidden">
      <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs text-muted-foreground font-medium px-1">
        <span className="text-xs">
          Mostrando <span className="font-bold text-foreground">{fromItem}</span> a{" "}
          <span className="font-bold text-foreground">{toItem}</span> de{" "}
          <span className="font-bold text-foreground">{total}</span>
        </span>

        <div className="flex items-center gap-1.5 border-l border-border pl-3">
          <span className="text-xs">Exibir:</span>
          <select
            value={currentPageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-surface-alt border border-border text-foreground text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination className="mx-0 w-full md:w-auto flex justify-center">
          <PaginationContent className="flex-wrap justify-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={
                  currentPage <= 1
                    ? "pointer-events-none opacity-40"
                    : "cursor-pointer rounded-xl h-9"
                }
              />
            </PaginationItem>

            {pageNumbers.map((item, index) => (
              <PaginationItem key={index}>
                {item === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={item === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(Number(item));
                    }}
                    className="cursor-pointer font-bold text-xs h-9 w-9 rounded-xl"
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "cursor-pointer rounded-xl h-9"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
