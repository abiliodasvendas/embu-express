import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { usePublicClient } from "@/hooks/api/usePublicClient";
import { Building2, CalendarDays, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicClientLayout() {
  const { uuid } = useParams();
  const { data: client, isLoading, error } = usePublicClient(uuid);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border h-16 flex items-center px-6">
          <Skeleton className="h-8 w-32 rounded-[14px]" />
        </nav>
        <main className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-[600px] w-full rounded-[24px]" />
        </main>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[18px] border border-border flex items-center justify-center mb-6">
          <TriangleAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Indisponível</h1>
        <p className="text-muted-foreground max-w-sm">
          {error instanceof Error ? error.message : "O link que você tentou acessar é inválido ou expirou."}
        </p>
        <p className="mt-4 text-sm font-semibold text-primary">Entre em contato com o Administrativo da Embu Express.</p>
      </div>
    );
  }

  const navItems = [
    { label: "Controle de Atividade", path: `/public/c/${uuid}/controle`, icon: Clock },
    { label: "Espelho de Atividade", path: `/public/c/${uuid}/espelho`, icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-[14px] flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground leading-none">{client.nome_fantasia}</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Painel do Cliente</p>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(item.path.split('/').pop()!);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-[14px] text-xs font-semibold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <Outlet context={{ client }} />
      </main>

      <nav className="sm:hidden fixed bottom-6 left-4 right-4 bg-card shadow-lg border border-border rounded-[18px] p-2 flex gap-2 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path.split('/').pop()!);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-[14px] transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
