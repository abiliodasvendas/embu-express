import { PermissionKey, PERMISSIONS } from "@/constants/permissions.enum";
import { Briefcase, Building, Clock, Users } from "lucide-react";

export interface PageItem {
    title: string;
    href: string;
    icon: any;
    permissionKey?: PermissionKey; // Substitui o allowedRoles para checagem granular
}

export const pagesItems: PageItem[] = [
    {
        title: "Registrar Ponto",
        href: "/registrar-ponto",
        icon: Clock,
        permissionKey: PERMISSIONS.PONTO.REGISTRAR,
    },
    {
        title: "Controle de Ponto",
        href: "/controle-ponto",
        icon: Clock,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
    },
    {
        title: "Colaboradores",
        href: "/colaboradores",
        icon: Users,
        permissionKey: PERMISSIONS.USUARIOS.VER,
    },
    {
        title: "Perfis",
        href: "/perfis",
        icon: Users,
        permissionKey: PERMISSIONS.PERFIS.VER,
    },
    {
        title: "Clientes",
        href: "/clientes",
        icon: Briefcase,
        permissionKey: PERMISSIONS.CLIENTES.VER,
    },
    {
        title: "Empresas",
        href: "/empresas",
        icon: Building,
        permissionKey: PERMISSIONS.EMPRESAS.VER,
    },
];
