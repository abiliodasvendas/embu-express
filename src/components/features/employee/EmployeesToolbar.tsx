import { FilterButton } from "@/components/common/FilterButton";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getPerfilLabel } from "@/utils/formatters";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface EmployeesToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  onRegister: () => void;
  onQuickCreate?: () => void;
  onApplyFilters: (filters: { status?: string; categoria?: string; cliente?: string }) => void;
  roles: any[];
  clients: any[];
  selectedClient: string;
  onClientChange: (value: string) => void;
}

const FilterControls = ({
  statusValue,
  onStatusChange,
  roleValue,
  onRoleChange,
  clientValue,
  onClientChange,
  onClear,
  onApply,
  roles,
  clients,
  isSheet = false,
}: {
  statusValue: string;
  onStatusChange: (val: string) => void;
  roleValue: string;
  onRoleChange: (val: string) => void;
  clientValue: string;
  onClientChange: (val: string) => void;
  onClear: () => void;
  onApply?: () => void;
  roles: any[];
  clients: any[];
  isSheet?: boolean;
}) => (
  <div className={cn("space-y-6", isSheet ? "px-6" : "p-4")}>
     <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        Cliente
      </Label>
      <Combobox
          options={clients.map(c => ({ value: c.id.toString(), label: c.nome_fantasia }))}
          value={clientValue === "todos" ? "" : clientValue}
          onSelect={(val) => onClientChange(val || "todos")}
          placeholder="Todos os Clientes"
          searchPlaceholder="Buscar cliente..."
          emptyText="Nenhum cliente encontrado."
          className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium text-foreground hover:bg-gray-50 transition-none",
            isSheet && "h-12 bg-white hover:bg-white"
          )}
          modal={isSheet}
      />
    </div>

    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        Status
      </Label>
      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger
          className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="z-[10001] rounded-xl border-gray-100">
          <SelectItem value="todos">Todos Status</SelectItem>
          <SelectItem value="ativo">Ativos</SelectItem>
          <SelectItem value="inativo">Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        Cargo
      </Label>
      <Select value={roleValue} onValueChange={onRoleChange}>
        <SelectTrigger
          className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}
        >
          <SelectValue placeholder="Cargo" />
        </SelectTrigger>
        <SelectContent className="z-[10001] rounded-xl border-gray-100">
          <SelectItem value="todos">Todos os Cargos</SelectItem>
          {roles?.map((role: any) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {getPerfilLabel(role.nome)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className={cn("flex items-center gap-3 pt-4", isSheet && "pb-6")}>
      <Button
        variant="outline"
        onClick={onClear}
        className={cn(
          "flex-1 h-11 rounded-xl text-slate-500 font-bold border-gray-200 hover:bg-gray-50 transition-all active:scale-95",
          isSheet && "h-12"
        )}
      >
        Limpar
      </Button>
      {isSheet && (
        <Button
          onClick={onApply}
          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm font-bold transition-all active:scale-95 text-white"
        >
          Aplicar
        </Button>
      )}
    </div>
  </div>
);

export function EmployeesToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedRole,
  onRoleChange,
  onRegister,
  onQuickCreate,
  onApplyFilters,
  roles,
  clients,
  selectedClient,
  onClientChange,
}: EmployeesToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for debouncing search
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Local state for mobile filters (deferred application)
  const [mobileStatus, setMobileStatus] = useState(selectedStatus);
  const [mobileRole, setMobileRole] = useState(selectedRole);
  const [mobileClient, setMobileClient] = useState(selectedClient);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Sync local search when searchTerm changes externally
  useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Sync mobile local state when opening sheet or when props change
  useEffect(() => {
    if (isSheetOpen) {
      setMobileStatus(selectedStatus);
      setMobileRole(selectedRole);
      setMobileClient(selectedClient);
    }
  }, [isSheetOpen, selectedStatus, selectedRole, selectedClient]);

  const hasActiveFilters =
    selectedStatus !== "todos" || selectedRole !== "todos" || selectedClient !== "todos";
  const selectedCount =
    (selectedStatus !== "todos" ? 1 : 0) + (selectedRole !== "todos" ? 1 : 0) + (selectedClient !== "todos" ? 1 : 0);

  const clearFilters = () => {
    onStatusChange("todos");
    onRoleChange("todos");
    onClientChange("todos");
  };

  const applyMobileFilters = () => {
    onApplyFilters({
      status: mobileStatus,
      categoria: mobileRole,
      cliente: mobileClient,
    });
    setIsSheetOpen(false);
  };

  const clearMobileFilters = () => {
    setMobileStatus("todos");
    setMobileRole("todos");
    setMobileClient("todos");
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Main Toolbar Row(s) */}
      <div className="flex flex-col md:flex-row items-center gap-3 order-2 md:order-none">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <FilterButton
                  hasActiveFilters={hasActiveFilters}
                  selectedCount={selectedCount}
                  isMobile={isMobile}
                />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 bg-gray-50 border-t-0 shadow-2xl"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetHeader className="text-left mb-4 px-6">
                  <SheetTitle className="text-xl font-bold">
                    Filtrar Funcionários
                  </SheetTitle>
                  <SheetDescription className="text-gray-500">
                    Refine a lista de funcionários pelas opções abaixo.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <FilterControls
                    isSheet={true}
                    statusValue={mobileStatus}
                    onStatusChange={setMobileStatus}
                    roleValue={mobileRole}
                    onRoleChange={setMobileRole}
                    clientValue={mobileClient}
                    onClientChange={setMobileClient}
                    onClear={clearMobileFilters}
                    onApply={applyMobileFilters}
                    roles={roles || []}
                    clients={clients || []}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <FilterButton
                  hasActiveFilters={hasActiveFilters}
                  selectedCount={selectedCount}
                  isMobile={isMobile}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden"
                align="end"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <FilterControls
                  statusValue={selectedStatus}
                  onStatusChange={onStatusChange}
                  roleValue={selectedRole}
                  onRoleChange={onRoleChange}
                  clientValue={selectedClient}
                  onClientChange={onClientChange}
                  onClear={clearFilters}
                  roles={roles || []}
                  clients={clients || []}
                />
              </PopoverContent>
            </Popover>
          )}

          <Button
            onClick={onRegister}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
              isMobile && "flex-1 h-11"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>{isMobile ? "Cadastrar" : "Cadastrar Funcionário"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
