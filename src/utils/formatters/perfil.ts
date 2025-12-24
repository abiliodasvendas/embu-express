import { PERFIL_ADMIN, PERFIL_MOTOBOY, PERFIL_SUPER_ADMIN } from "@/constants";

/**
 * Retorna o rótulo amigável para um perfil/cargo
 */
export const getPerfilLabel = (perfilNome?: string | null) => {
  if (!perfilNome) return "-";
  
  const nome = perfilNome.toLowerCase();
  
  switch (nome) {
    case PERFIL_SUPER_ADMIN:
      return "Super Admin";
    case PERFIL_ADMIN:
      return "Administrador";
    case PERFIL_MOTOBOY:
      return "Motoboy";
    default:
      // Capitaliza a primeira letra caso não esteja no mapeamento
      return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
};
