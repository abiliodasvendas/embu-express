import { MENU_CATEGORIES, MenuCategory } from "@/constants/menu.constants";
import { PermissionKey, PERMISSIONS } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import {
    AlertCircle,
    AlertTriangle,
    Banknote,
    Briefcase,
    Building,
    Clock,
    FileText,
    Home,
    Settings,
    Users
} from "lucide-react";

export interface PageItem {
    title: string;
    href: string;
    icon: any;
    permissionKey?: PermissionKey | PermissionKey[];
    category?: MenuCategory;
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
        title: "Colaboradores",
        href: ROUTES.PRIVATE.COLABORADORES,
        icon: Users,
        permissionKey: PERMISSIONS.USUARIOS.VER,
    },
    {
        title: "Controle de Ponto",
        href: ROUTES.PRIVATE.CONTROLE_PONTO,
        icon: Clock,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Espelho de Ponto",
        href: ROUTES.PRIVATE.ESPELHO_PONTO,
        icon: FileText,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Inconsistências",
        href: ROUTES.PRIVATE.INCONSISTENCIAS,
        icon: AlertTriangle,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Clientes",
        href: ROUTES.PRIVATE.CLIENTES,
        icon: Briefcase,
        permissionKey: PERMISSIONS.CLIENTES.VER,
    },
    {
        title: "Relatório Financeiro",
        href: ROUTES.PRIVATE.RELATORIO_FINANCEIRO,
        icon: Banknote,
    },
    {
        title: "Ocorrências",
        href: ROUTES.PRIVATE.OCORRENCIAS,
        icon: AlertCircle,
        permissionKey: PERMISSIONS.OCORRENCIAS.VER,
    },
    {
        title: "Empresas",
        href: ROUTES.PRIVATE.EMPRESAS,
        icon: Building,
        permissionKey: PERMISSIONS.EMPRESAS.VER,
        category: MENU_CATEGORIES.CADASTROS
    },
    {
        title: "Feriados",
        href: ROUTES.PRIVATE.FERIADOS,
        icon: Building,
        permissionKey: PERMISSIONS.CONFIGURACAO.VER,
        category: MENU_CATEGORIES.CADASTROS
    },
    {
        title: "Perfis",
        href: ROUTES.PRIVATE.PERFIS,
        icon: Users,
        permissionKey: PERMISSIONS.PERFIS.VER,
    },
    {
        title: "Configurações",
        href: ROUTES.PRIVATE.CONFIGURACOES,
        icon: Settings,
        permissionKey: PERMISSIONS.CONFIGURACAO.VER,
    },
];
