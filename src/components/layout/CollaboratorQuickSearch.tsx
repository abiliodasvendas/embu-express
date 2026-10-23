import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatusUsuario } from "@/types/enums";
import { Usuario } from "@/types/database";
import { cn } from "@/lib/utils";

interface CollaboratorQuickSearchProps {
  className?: string;
}

const getAvatarStyles = (status: string) => {
  switch (status) {
    case StatusUsuario.ATIVO:
      return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
    case StatusUsuario.INATIVO:
      return "bg-neutral-500/10 text-neutral-600 border border-neutral-500/20";
    case StatusUsuario.PENDENTE:
      return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
};

export function CollaboratorQuickSearch({ className }: CollaboratorQuickSearchProps) {
  const navigate = useNavigate();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearchActive = debouncedSearch.length >= 2;

  const { data, isFetching } = useCollaborators(
    { searchTerm: debouncedSearch, all: true },
    { enabled: isSearchActive }
  );

  const collaborators: Usuario[] = isSearchActive
    ? Array.isArray(data)
      ? data
      : data?.data ?? []
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCollaborator = (id: string) => {
    navigate(`/colaboradores/${id}`);
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (search.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Buscar colaborador... (nome, e-mail ou CPF)"
          className="w-full pl-10 pr-10 h-10 sm:h-11 rounded-[16px] sm:rounded-[18px] bg-background/80 border-border text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-xs transition-all placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!isFetching && search.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && isSearchActive && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-[20px] bg-card border border-border shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {isFetching && collaborators.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-muted-foreground font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Buscando colaboradores...</span>
            </div>
          ) : !isFetching && collaborators.length === 0 ? (
            <div className="py-6 px-4 text-center text-xs text-muted-foreground font-medium">
              Nenhum colaborador encontrado para "{debouncedSearch}".
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/80 bg-surface-alt/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Colaboradores encontrados</span>
                <span>{collaborators.length} {collaborators.length === 1 ? "registro" : "registros"}</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                {collaborators.map((collaborator) => (
                  <button
                    key={collaborator.id}
                    type="button"
                    role="option"
                    onClick={() => handleSelectCollaborator(collaborator.id)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-alt active:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                          getAvatarStyles(collaborator.status)
                        )}
                      >
                        {collaborator.nome_completo.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        {collaborator.nome_completo}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={collaborator.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
