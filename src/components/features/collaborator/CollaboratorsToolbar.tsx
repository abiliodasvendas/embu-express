import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { getPerfilLabel } from "@/utils/formatters";
import { Check, ListFilter, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusUsuario, FilterOptions } from "@/types/enums";

interface CollaboratorRole {
  id: string | number;
  nome: string;
}

interface CollaboratorClient {
  id: string | number;
  nome_fantasia: string;
}

interface CollaboratorEmpresa {
  id: string | number;
  nome_fantasia: string;
}

interface CollaboratorsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  roles: CollaboratorRole[];
  clients: CollaboratorClient[];
  selectedClient: string;
  onClientChange: (value: string) => void;
  empresas: CollaboratorEmpresa[];
  selectedEmpresa: string;
  onEmpresaChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  onApplyFilters?: (filters: {
    client: string;
    empresa: string;
    status: string;
    role: string;
  }) => void;
}

export function CollaboratorsToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedRole,
  onRoleChange,
  roles = [],
  clients = [],
  selectedClient,
  onClientChange,
  empresas = [],
  selectedEmpresa,
  onEmpresaChange,
  hasActiveFilters,
  onClear,
  onApplyFilters,
}: CollaboratorsToolbarProps) {
  const isMobile = useIsMobile();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState({
    client: selectedClient || FilterOptions.TODOS,
    empresa: selectedEmpresa || FilterOptions.TODOS,
    status: selectedStatus || StatusUsuario.ATIVO,
    role: selectedRole || FilterOptions.TODOS,
  });

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length === 0) {
      if (searchTerm !== "") {
        onSearchChange("");
      }
    } else if (trimmed.length >= 2) {
      if (searchTerm !== trimmed) {
        onSearchChange(trimmed);
      }
    }
  }, [debouncedSearch, searchTerm, onSearchChange]);

  useEffect(() => {
    if (isDrawerOpen) {
      setMobileFilters({
        client: selectedClient || FilterOptions.TODOS,
        empresa: selectedEmpresa || FilterOptions.TODOS,
        status: selectedStatus || StatusUsuario.ATIVO,
        role: selectedRole || FilterOptions.TODOS,
      });
    }
  }, [isDrawerOpen, selectedClient, selectedEmpresa, selectedStatus, selectedRole]);

  const handleApplyMobile = () => {
    if (onApplyFilters) {
      onApplyFilters(mobileFilters);
    } else {
      onClientChange(mobileFilters.client);
      onEmpresaChange(mobileFilters.empresa);
      onStatusChange(mobileFilters.status);
      onRoleChange(mobileFilters.role);
    }
    safeCloseDialog(() => setIsDrawerOpen(false));
  };

  const handleClear = () => {
    setLocalSearch("");
    setMobileFilters({
      client: FilterOptions.TODOS,
      empresa: FilterOptions.TODOS,
      status: StatusUsuario.ATIVO,
      role: FilterOptions.TODOS,
    });
    onClear?.();
    safeCloseDialog(() => setIsDrawerOpen(false));
  };

  const clientOptions = [
    { value: FilterOptions.TODOS, label: "Todos os Clientes" },
    ...clients.map((c) => ({
      value: c.id.toString(),
      label: c.nome_fantasia,
    })),
  ];

  const empresaOptions = [
    { value: FilterOptions.TODOS, label: "Todas as Empresas" },
    ...empresas.map((e) => ({
      value: e.id.toString(),
      label: e.nome_fantasia,
    })),
  ];

  const activeFiltersCount =
    (selectedStatus && selectedStatus !== StatusUsuario.ATIVO ? 1 : 0) +
    (selectedRole && selectedRole !== FilterOptions.TODOS ? 1 : 0) +
    (selectedClient && selectedClient !== FilterOptions.TODOS ? 1 : 0) +
    (selectedEmpresa && selectedEmpresa !== FilterOptions.TODOS ? 1 : 0);

  return (
    <div className="space-y-3 w-full">
      <div className="hidden lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center gap-2.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div>
          <Combobox
            options={clientOptions}
            value={selectedClient}
            onSelect={(val) => onClientChange(val || FilterOptions.TODOS)}
            placeholder="Todos os Clientes"
            searchPlaceholder="Buscar cliente..."
            emptyText="Nenhum cliente encontrado."
            className="h-11 rounded-[18px] bg-card border-border font-medium text-foreground hover:bg-surface-alt transition-none shadow-xs text-xs w-full"
          />
        </div>

        <div>
          <Combobox
            options={empresaOptions}
            value={selectedEmpresa}
            onSelect={(val) => onEmpresaChange(val || FilterOptions.TODOS)}
            placeholder="Todas as Empresas"
            searchPlaceholder="Buscar empresa..."
            emptyText="Nenhuma empresa encontrada."
            className="h-11 rounded-[18px] bg-card border-border font-medium text-foreground hover:bg-surface-alt transition-none shadow-xs text-xs w-full"
          />
        </div>

        <div>
          <NativeSelect
            value={selectedStatus || StatusUsuario.ATIVO}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium w-full"
          >
            <option value={FilterOptions.TODOS}>Todos os Status</option>
            <option value={StatusUsuario.ATIVO}>Ativos</option>
            <option value={StatusUsuario.PENDENTE}>Pendentes</option>
            <option value={StatusUsuario.INATIVO}>Inativos</option>
          </NativeSelect>
        </div>

        <div>
          <NativeSelect
            value={selectedRole || FilterOptions.TODOS}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium w-full"
          >
            <option value={FilterOptions.TODOS}>Todos os Cargos</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                {getPerfilLabel(role.nome)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="hidden lg:flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground px-3"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Limpar Filtros
          </Button>
        </div>
      )}

      <div className="flex lg:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar colaboradores..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-11 px-3.5 rounded-[18px] border-border bg-card font-medium text-xs shadow-xs relative shrink-0"
            >
              <ListFilter className="h-4 w-4 mr-1.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[85vh] flex flex-col p-0">
            <DrawerHeader className="text-left border-b border-border p-4 px-6">
              <DrawerTitle className="text-base font-bold">Filtros de Busca</DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                Refine a lista de colaboradores por vínculos ou situação.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cliente</label>
                <NativeSelect
                  value={mobileFilters.client}
                  onChange={(e) =>
                    setMobileFilters((prev) => ({
                      ...prev,
                      client: e.target.value,
                    }))
                  }
                  className="rounded-[16px] bg-card border-border h-11 text-xs"
                >
                  {clientOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Empresa</label>
                <NativeSelect
                  value={mobileFilters.empresa}
                  onChange={(e) =>
                    setMobileFilters((prev) => ({
                      ...prev,
                      empresa: e.target.value,
                    }))
                  }
                  className="rounded-[16px] bg-card border-border h-11 text-xs"
                >
                  {empresaOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <NativeSelect
                  value={mobileFilters.status || StatusUsuario.ATIVO}
                  onChange={(e) =>
                    setMobileFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="rounded-[16px] bg-card border-border h-11 text-xs"
                >
                  <option value={FilterOptions.TODOS}>Todos os Status</option>
                  <option value={StatusUsuario.ATIVO}>Ativos</option>
                  <option value={StatusUsuario.PENDENTE}>Pendentes</option>
                  <option value={StatusUsuario.INATIVO}>Inativos</option>
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cargo</label>
                <NativeSelect
                  value={mobileFilters.role}
                  onChange={(e) =>
                    setMobileFilters((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="rounded-[16px] bg-card border-border h-11 text-xs"
                >
                  <option value={FilterOptions.TODOS}>Todos os Cargos</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id.toString()}>
                      {getPerfilLabel(role.nome)}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-border flex items-center gap-3 bg-surface-alt/40 mt-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1 h-11 rounded-[18px] font-semibold text-xs border-border"
              >
                Limpar
              </Button>
              <Button
                onClick={handleApplyMobile}
                className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-xs"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Aplicar
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
