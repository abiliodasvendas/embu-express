import { Banner } from "@/components/ui/Banner";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import { useAniversariantes } from "@/hooks/api/useAniversariantes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { getPerfilLabel } from "@/utils/formatters/perfil";
import { Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AniversariantesHojeBanner() {
  const navigate = useNavigate();
  const { can, isSuperAdmin } = usePermissions();

  const canView = isSuperAdmin || can(PERMISSIONS.ANIVERSARIANTES.VER);
  const { data, isLoading } = useAniversariantes(undefined, canView);

  if (!canView || isLoading) return null;

  const aniversariantesHoje = data?.hoje ?? [];
  if (aniversariantesHoje.length === 0) return null;

  const total = aniversariantesHoje.length;
  const subtitulo =
    total === 1
      ? "1 colaborador ativo comemora aniversário hoje."
      : `${total} colaboradores ativos comemoram aniversário hoje.`;

  return (
    <Banner
      variant="info"
      icon={Cake}
      title="Aniversariantes de hoje"
      description={subtitulo}
      action={{
        label: "Ver aniversariantes",
        onClick: () => navigate(ROUTES.PRIVATE.ANIVERSARIANTES),
      }}
    >
      <ul className="mt-2.5 divide-y divide-sky-500/15 border-t border-sky-500/15 pt-2">
        {aniversariantesHoje.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 py-1.5 text-sm"
          >
            <span className="font-medium text-foreground truncate">
              {item.nome_completo}
            </span>
            {item.perfil_nome && (
              <span className="text-xs text-muted-foreground shrink-0">
                {getPerfilLabel(item.perfil_nome)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Banner>
  );
}
