import { cn } from "@/lib/utils";
import { PageItem, pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/business/usePermissions";
import { ChevronRight, LayoutGrid, ClipboardList, Layers, Users, Landmark, LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect, useMemo, useRef } from "react";
import { MENU_CATEGORIES } from "@/constants/menu.constants";

interface AppSidebarProps {
  onLinkClick?: () => void;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  [MENU_CATEGORIES.PONTO]: ClipboardList,
  [MENU_CATEGORIES.CADASTROS]: Layers,
  [MENU_CATEGORIES.COLABORADORES]: Users,
  [MENU_CATEGORIES.FINANCEIRO]: Landmark,
};

type MenuBlock =
  | { type: "link"; item: PageItem }
  | { type: "group"; category: string; items: PageItem[] };

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  const { can, isSuperAdmin, roleName } = usePermissions();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    return pagesItems.filter((item) => {
      if (isSuperAdmin) return true;

      if (item.allowedRoles && item.allowedRoles.length > 0) {
        const normalizedRole = roleName?.toLowerCase();
        const hasRole = item.allowedRoles.some(
          (r) => r.toLowerCase() === normalizedRole
        );
        if (!hasRole) return false;
      }

      if (!item.permissionKey) return true;

      if (Array.isArray(item.permissionKey)) {
        return item.permissionKey.some((pk) => can(pk));
      }

      return can(item.permissionKey);
    });
  }, [can, isSuperAdmin, roleName]);

  const menuBlocks = useMemo(() => {
    const blocks: MenuBlock[] = [];

    filteredItems.forEach((item) => {
      const category = item.category;

      if (!category) {
        blocks.push({ type: "link", item });
      } else {
        const existingBlock = blocks.find(
          (b): b is { type: "group"; category: string; items: PageItem[] } =>
            b.type === "group" && b.category === category
        );
        if (existingBlock) {
          existingBlock.items.push(item);
        } else {
          blocks.push({ type: "group", category, items: [item] });
        }
      }
    });

    return blocks;
  }, [filteredItems]);

  const lastPathname = useRef<string>("");

  useEffect(() => {
    if (menuBlocks.length === 0) return;

    const currentPath = location.pathname;
    const isPathAcknowledged = lastPathname.current === currentPath;

    if (!isPathAcknowledged) {
      let activeCategory = "";
      menuBlocks.forEach((block) => {
        if (block.type === "group") {
          const hasActiveChild = block.items.some((item) => item.href === currentPath);
          if (hasActiveChild) activeCategory = block.category;
        }
      });

      if (activeCategory) {
        setOpenGroups({ [activeCategory]: true });
        lastPathname.current = currentPath;
      } else if (filteredItems.some((i) => i.href === currentPath)) {
        setOpenGroups({});
        lastPathname.current = currentPath;
      }
    }
  }, [location.pathname, menuBlocks, filteredItems]);

  const toggleGroup = (category: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderIcon = (Icon: LucideIcon, isActive: boolean) => (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[10px] text-base shrink-0 transition-colors",
        isActive
          ? "bg-white/15 text-white"
          : "bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );

  const renderLink = (item: PageItem, isSubItem = false) => (
    <NavLink
      key={item.href}
      to={item.href}
      onClick={onLinkClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 transition-colors",
          isSubItem
            ? "rounded-[14px] px-3 py-2 text-xs"
            : "rounded-[18px] px-3.5 py-2 text-sm",
          isActive
            ? "bg-white/10 text-white font-semibold shadow-xs"
            : "text-white/60 font-medium hover:bg-white/5 hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          {renderIcon(item.icon, isActive)}
          <span className="truncate">{item.title}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-full flex-col min-h-0">
      <nav className="flex-1 space-y-1 overflow-y-auto pl-4 pr-1.5 py-4 scrollbar-dark">
        {menuBlocks.map((block, idx) => {
          if (block.type === "link") {
            return renderLink(block.item);
          }

          const category = block.category;
          const items = block.items;
          const isOpen = !!openGroups[category];
          const CategoryIcon = CATEGORY_ICONS[category] || LayoutGrid;

          return (
            <Collapsible
              key={`${category}-${idx}`}
              open={isOpen}
              onOpenChange={() => toggleGroup(category)}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-[18px] px-3.5 py-2 text-sm font-semibold transition-colors",
                    "text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderIcon(CategoryIcon, false)}
                    <span className="truncate">{category}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 text-white/40 shrink-0",
                      isOpen && "rotate-90 text-white/80"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="pt-1 border-l border-white/10 ml-7 pl-2 space-y-1 mb-2">
                  {items.map((item) => renderLink(item, true))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </div>
  );
}
