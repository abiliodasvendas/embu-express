import { NativeSelect } from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BloqueadosPaginationProps {
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  total: number;
  totalPages: number;
  paginadosLength: number;
}

export function BloqueadosPagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
  totalPages,
  paginadosLength,
}: BloqueadosPaginationProps) {
  if (total <= 50 || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <span>
          Exibindo {paginadosLength} de {total} registros
        </span>
        <NativeSelect
          value={String(pageSize)}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="h-8 w-20 text-xs rounded-[10px]"
        >
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
        </NativeSelect>
      </div>

      <Pagination className="mx-0 w-full md:w-auto flex justify-center">
        <PaginationContent className="flex-wrap justify-center gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              className={
                page <= 1
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer rounded-xl h-9"
              }
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(p);
                }}
                className="cursor-pointer font-bold text-xs h-9 w-9 rounded-xl"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer rounded-xl h-9"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
