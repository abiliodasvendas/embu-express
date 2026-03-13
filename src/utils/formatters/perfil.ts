import { ROLES } from "@/constants/permissions.enum";

/**
 * Retorna o rótulo amigável para um perfil/cargo
 */
export const getPerfilLabel = (perfilNome?: string | null) => {
  if (!perfilNome) return "-";

  const nome = perfilNome.toLowerCase();

  switch (nome) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.ADMIN:
      return "Administrador";
    case ROLES.MOTOBOY:
      return "Motoboy";
    case ROLES.FISCAL:
      return "Fiscal";
    default:
      // Capitaliza a primeira letra caso não esteja no mapeamento
      return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
};
