import { ADMIN_ROLES, OPERATIONAL_ROLES, UserRole } from "@/types/auth";
import { Briefcase, Building, Clock, Users } from "lucide-react";

export interface PageItem {
    title: string;
    href: string;
    icon: any;
    allowedRoles: UserRole[];
}

export const pagesItems: PageItem[] = [
    {
        title: "Registrar Ponto",
        href: "/registrar-ponto",
        icon: Clock,
        allowedRoles: OPERATIONAL_ROLES,
    },
    {
        title: "Controle de Ponto",
        href: "/controle-ponto",
        icon: Clock,
        allowedRoles: ADMIN_ROLES,
    },
    {
        title: "Colaboradores",
        href: "/colaboradores",
        icon: Users,
        allowedRoles: ADMIN_ROLES,
    },
    {
        title: "Clientes",
        href: "/clientes",
        icon: Briefcase,
        allowedRoles: ADMIN_ROLES,
    },
    {
        title: "Empresas",
        href: "/empresas",
        icon: Building,
        allowedRoles: ADMIN_ROLES,
    },
];

