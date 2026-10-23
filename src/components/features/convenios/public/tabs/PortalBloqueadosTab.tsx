import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/Banner";
import { UserX, ShieldCheck } from "lucide-react";
import { PublicCollaboratorConvenio } from "@/hooks/api/useConvenios";

interface PortalBloqueadosTabProps {
  isLoading: boolean;
  bloqueados: PublicCollaboratorConvenio[];
  searchQuery: string;
}

export function PortalBloqueadosTab({
  isLoading,
  bloqueados,
  searchQuery,
}: PortalBloqueadosTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card animate-pulse rounded-[24px] border border-border" />
        ))}
      </div>
    );
  }

  if (bloqueados.length === 0) {
    return (
      <Card className="rounded-[24px] border border-border bg-card shadow-xs text-center py-10 px-6">
        <div className="w-12 h-12 rounded-[16px] bg-muted/70 text-foreground border border-border mx-auto flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6 text-foreground" />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-foreground">
          {searchQuery ? "Nenhum colaborador encontrado" : "Nenhum colaborador bloqueado"}
        </h3>
        <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-sm mx-auto">
          {searchQuery
            ? "Nenhum colaborador bloqueado corresponde aos termos pesquisados."
            : "Todos os colaboradores da Embu Express estão autorizados para atendimento neste convênio."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bloqueados.map((collab) => (
        <Card
          key={collab.id}
          className="rounded-[24px] border border-border bg-card shadow-xs hover:border-border/80 transition-colors"
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                  <UserX className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-foreground leading-snug">
                    {collab.nome_completo}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Colaborador
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-destructive/10 text-destructive border-destructive/20 rounded-[14px] font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
              >
                Suspenso
              </Badge>
            </div>

            <Banner
              variant="warning"
              description={
                collab.motivo_bloqueio ||
                "Este colaborador está com o convênio suspenso no momento. Não realize o serviço pelo convênio."
              }
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
