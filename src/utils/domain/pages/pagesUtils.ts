import { PermissionKey, PERMISSIONS } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import { Briefcase, Building, Clock, Home, Settings, Users } from "lucide-react";

export interface PageItem {
    title: string;
    href: string;
    icon: any;
    permissionKey?: PermissionKey; // Substitui o allowedRoles para checagem granular
}

export const pagesItems: PageItem[] = [
    {
        title: "Início",
        href: ROUTES.PRIVATE.INICIO,
        icon: Home,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
    },
    {
        title: "Registrar Ponto",
        href: ROUTES.PRIVATE.REGISTRAR_PONTO,
        icon: Clock,
    },
    {
        title: "Controle de Ponto",
        href: ROUTES.PRIVATE.CONTROLE_PONTO,
        icon: Clock,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
    },
    {
        title: "Colaboradores",
        href: ROUTES.PRIVATE.COLABORADORES,
        icon: Users,
        permissionKey: PERMISSIONS.USUARIOS.VER,
    },
    {
        title: "Perfis",
        href: ROUTES.PRIVATE.PERFIS,
        icon: Users,
        permissionKey: PERMISSIONS.PERFIS.VER,
    },
    {
        title: "Clientes",
        href: ROUTES.PRIVATE.CLIENTES,
        icon: Briefcase,
        permissionKey: PERMISSIONS.CLIENTES.VER,
    },
    {
        title: "Empresas",
        href: ROUTES.PRIVATE.EMPRESAS,
        icon: Building,
        permissionKey: PERMISSIONS.EMPRESAS.VER,
    },
    {
        title: "Configurações",
        href: ROUTES.PRIVATE.CONFIGURACOES,
        icon: Settings,
        permissionKey: PERMISSIONS.CONFIGURACAO.VER,
    },
];
