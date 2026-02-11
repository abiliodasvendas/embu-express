import { cn } from "@/lib/utils";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";

interface AppSidebarProps {
  onLinkClick?: () => void;
}


import { usePermissions } from "@/hooks/business/usePermissions";

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  const { roleName } = usePermissions();
  // Default to motoboy if undefined, or handle safely
  const currentRole = (roleName || "motoboy") as any;

  const userItems = pagesItems.filter(item => 
    item.allowedRoles.includes(currentRole)
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {userItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-2.5",
                isActive
                  ? "bg-blue-600 text-white shadow-[0_12px_35px_-25px_rgba(59,130,246,0.7)]"
                  : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-base",
                    isActive
                      ? "bg-white/20 text-white"
                      : "hover:text-blue-600"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-inherit"
                    )}
                  />
                </span>
                <span>{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

