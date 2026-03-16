import { cn } from "@/lib/utils";
import { PageItem, pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/business/usePermissions";
import { ChevronRight, LayoutGrid, ClipboardList, Layers } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect, useMemo } from "react";
import { MENU_CATEGORIES } from "@/constants/menu.constants";

interface AppSidebarProps {
  onLinkClick?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  [MENU_CATEGORIES.PONTO]: ClipboardList,
  [MENU_CATEGORIES.CADASTROS]: Layers,
};

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  const { can, isSuperAdmin } = usePermissions();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    return pagesItems.filter(item => {
      if (isSuperAdmin) return true;
      if (!item.permissionKey) return true;
      
      if (Array.isArray(item.permissionKey)) {
        return item.permissionKey.some(pk => can(pk as any));
      }
      
      return can(item.permissionKey as any);
    });
  }, [can, isSuperAdmin]);

  const menuBlocks = useMemo(() => {
    const blocks: Array<{ type: 'link'; item: PageItem } | { type: 'group'; category: string; items: PageItem[] }> = [];
    
    filteredItems.forEach((item) => {
      const category = item.category;
      
      if (!category) {
        blocks.push({ type: 'link', item });
      } else {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock?.type === 'group' && lastBlock.category === category) {
          lastBlock.items.push(item);
        } else {
          blocks.push({ type: 'group', category, items: [item] });
        }
      }
    });

    return blocks;
  }, [filteredItems]);

  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenGroups = { ...openGroups };
    let changed = false;

    menuBlocks.forEach((block) => {
      if (block.type === 'group') {
        const hasActiveChild = block.items.some(item => item.href === currentPath);
        if (hasActiveChild && !openGroups[block.category]) {
          newOpenGroups[block.category] = true;
          changed = true;
        }
      }
    });

    if (changed) {
      setOpenGroups(newOpenGroups);
    }
  }, [location.pathname, menuBlocks]);

  const toggleGroup = (category: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderIcon = (Icon: any, isActive: boolean) => (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-base shrink-0 transition-all",
        isActive
          ? "bg-white/20 text-white shadow-sm"
          : "bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50"
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
          "group flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-all md:py-2",
          isSubItem && "pl-3 ml-0",
          isActive
            ? "bg-blue-600 text-white shadow-[0_12px_35px_-25px_rgba(59,130,246,0.7)]"
            : "text-slate-500 hover:bg-blue-50/50 hover:text-blue-600"
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
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
        {menuBlocks.map((block, idx) => {
          if (block.type === 'link') {
            return renderLink(block.item);
          }

          const category = block.category;
          const items = block.items;
          const isActiveGroup = items.some(item => item.href === location.pathname);
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
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-all md:py-2",
                    isActiveGroup && !isOpen
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(CategoryIcon, isActiveGroup && !isOpen)}
                    <span className="truncate">{category}</span>
                  </div>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 text-slate-400",
                      isOpen && "rotate-90",
                      isActiveGroup && "text-blue-400"
                    )} 
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="pt-1 border-l-2 border-slate-100/80 ml-8 mb-2">
                    {items.map(item => renderLink(item, true))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </div>
  );
}
