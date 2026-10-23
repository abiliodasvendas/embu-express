import { Input } from "@/components/ui/input";
import { Search, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortalTab } from "@/hooks/ui/convenios/useConvenioPublicPortalViewModel";

interface PortalTabsNavProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  bloqueadosCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PortalTabsNav({
  activeTab,
  onTabChange,
  bloqueadosCount,
  searchQuery,
  onSearchChange,
}: PortalTabsNavProps) {
  return (
    <div className="space-y-4">
      <div className="flex bg-muted/50 p-1 rounded-[18px] border border-border/40 w-full gap-1">
        <button
          type="button"
          onClick={() => onTabChange("recentes")}
          className={cn(
            "flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-[14px] transition-all text-center",
            activeTab === "recentes"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Todos os Lançamentos
        </button>
        <button
          type="button"
          onClick={() => onTabChange("colaboradores")}
          className={cn(
            "flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-[14px] transition-all text-center",
            activeTab === "colaboradores"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Por Colaborador
        </button>
        <button
          type="button"
          onClick={() => onTabChange("bloqueados")}
          className={cn(
            "flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-[14px] transition-all flex items-center justify-center gap-1.5 text-center",
            activeTab === "bloqueados"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Bloqueados</span>
          {bloqueadosCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
              {bloqueadosCount}
            </span>
          )}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={activeTab === "bloqueados" ? "Pesquisar colaborador bloqueado..." : "Pesquisar..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
