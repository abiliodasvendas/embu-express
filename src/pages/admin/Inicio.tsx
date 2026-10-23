import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PERMISSIONS, PermissionKey } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { getPerfilLabel } from "@/utils/formatters/perfil";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const { setPageTitle } = useLayout();
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { roleName, can, isSuperAdmin, isMotoboyOrFiscal } = usePermissions();

  useEffect(() => {
    setPageTitle("Página Inicial");
  }, [setPageTitle]);

  const firstName = useMemo(() => {
    return profile?.nome_completo?.split(" ")[0] || "Colaborador";
  }, [profile?.nome_completo]);

  const roleLabel = useMemo(() => {
    return getPerfilLabel(roleName);
  }, [roleName]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const capitalizedDate = useMemo(() => {
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }, [formattedDate]);

  const quickActions = useMemo(() => {
    const canAccess = (
      permissionKey?: PermissionKey | PermissionKey[],
      allowedRoles?: readonly string[] | string[]
    ) => {
      if (isSuperAdmin) return true;
      if (allowedRoles && allowedRoles.length > 0) {
        const normalized = roleName?.toLowerCase();
        const hasRole = allowedRoles.some((r) => r.toLowerCase() === normalized);
        if (!hasRole) return false;
      }
      if (!permissionKey) return true;
      if (Array.isArray(permissionKey)) {
        return permissionKey.some((pk) => can(pk));
      }
      return can(permissionKey);
    };

    const actions = [
      {
        title: "Registrar Atividade",
        description: "Bata seu ponto, pausas e encerramentos operacionais",
        href: ROUTES.PRIVATE.REGISTRAR_ATIVIDADE,
        icon: Clock,
        highlight: true,
        show: true,
      },
      {
        title: "Controle de Atividade",
        description: "Acompanhe as jornadas e ocorrências do dia em tempo real",
        href: ROUTES.PRIVATE.CONTROLE_ATIVIDADE_DIARIO,
        icon: ClipboardList,
        highlight: false,
        show: canAccess(PERMISSIONS.PONTO.ADMIN_VER),
      },
      {
        title: "Espelho de Atividade",
        description: "Consulte seu histórico de pontos, intervalos e ocorrências",
        href: ROUTES.PRIVATE.ESPELHO_ATIVIDADE,
        icon: FileText,
        highlight: false,
        show: isMotoboyOrFiscal || canAccess(PERMISSIONS.PONTO.VER_MEU),
      },
      {
        title: "Colaboradores",
        description: "Cadastros, dados bancários, CNH e turnos operacionais",
        href: ROUTES.PRIVATE.COLABORADORES,
        icon: Users,
        highlight: false,
        show: canAccess(PERMISSIONS.USUARIOS.VER),
      },
      {
        title: "Configurações do Sistema",
        description: "Parâmetros de tolerâncias de atraso, horas extras e limites",
        href: ROUTES.PRIVATE.CONFIGURACOES,
        icon: Settings,
        highlight: false,
        show: canAccess(PERMISSIONS.CONFIGURACAO.VER),
      },
    ];

    return actions.filter((a) => a.show);
  }, [can, isSuperAdmin, roleName, isMotoboyOrFiscal]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Olá, {firstName}
            </h1>
            {roleName && (
              <Badge variant="secondary" className="font-semibold text-[11px]">
                {roleLabel}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {capitalizedDate}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                onClick={() => navigate(action.href)}
                className="group cursor-pointer hover:border-foreground/20 hover:shadow-xs transition-all duration-200"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
