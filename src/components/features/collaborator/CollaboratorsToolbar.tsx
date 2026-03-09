import { FilterButton } from "@/components/common/FilterButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useDebounce } from "@/hooks/ui/useDebounce";
import { cn } from "@/lib/utils";
import { getPerfilLabel } from "@/utils/formatters";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { STATUS_CADASTRO } from "@/constants/cadastro";

interface CollaboratorsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  onRegister: () => void;
  onQuickCreate?: () => void;
  onApplyFilters: (filters: { status?: string; categoria?: string; cliente?: string; empresa?: string; sem_ponto_hoje?: boolean }) => void;
  roles: any[];
  clients: any[];
  selectedClient: string;
  onClientChange: (value: string) => void;
  empresas: any[];
  selectedEmpresa: string;
  onEmpresaChange: (value: string) => void;
  selectedSemPontoHoje: boolean;
  onSemPontoHojeChange: (value: boolean) => void;
}

const FilterControls = ({
  statusValue,
  onStatusChange,
  roleValue,
  onRoleChange,
  clientValue,
  onClientChange,
  empresaValue,
  onEmpresaChange,
  onClear,
  onApply,
  semPontoHojeValue,
  onSemPontoHojeChange,
  roles,
  clients,
  empresas,
  isSheet = false,
}: {
  statusValue: string;
  onStatusChange: (val: string) => void;
  roleValue: string;
  onRoleChange: (val: string) => void;
  clientValue: string;
  onClientChange: (val: string) => void;
  empresaValue: string;
  onEmpresaChange: (val: string) => void;
  onClear: () => void;
  onApply?: () => void;
  semPontoHojeValue: boolean;
  onSemPontoHojeChange: (val: boolean) => void;
  roles: any[];
  clients: any[];
  empresas: any[];
  isSheet?: boolean;
}) => (
  <div className={cn("space-y-6", isSheet ? "px-6 pb-6" : "p-4")}>
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        Cliente
      </Label>
      <Combobox
        options={[{ value: STATUS_CADASTRO.TODOS, label: "Todos os Clientes" }, ...clients.map(c => ({ value: c.id.toString(), label: c.nome_fantasia }))]}
        value={clientValue}
        onSelect={(val) => onClientChange(val || STATUS_CADASTRO.TODOS)}
        placeholder="Todos os Clientes"
        searchPlaceholder="Buscar cliente..."
        emptyText="Nenhum cliente encontrado."
        className={cn(
          "h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium text-foreground hover:bg-gray-50 hover:text-foreground transition-none",
          isSheet && "h-12 bg-white hover:bg-white"
        )}
        modal={isSheet}
      />
    </div>

    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        Empresa
      </Label>
      <Combobox
        options={[{ value: STATUS_CADASTRO.TODOS, label: "Todas as Empresas" }, ...empresas.map(e => ({ value: e.id.toString(), label: e.nome_fantasia }))]}
        value={empresaValue}
        onSelect={(val) => onEmpresaChange(val || STATUS_CADASTRO.TODOS)}
        placeholder="Todas as Empresas"
        searchPlaceholder="Buscar empresa..."
        emptyText="Nenhuma empresa encontrada."
        className={cn(
          "h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium text-foreground hover:bg-gray-50 hover:text-foreground transition-none",
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
          <SelectItem value={STATUS_CADASTRO.TODOS}>Todos os Status</SelectItem>
          <SelectItem value={STATUS_CADASTRO.ATIVO}>Ativos</SelectItem>
          <SelectItem value={STATUS_CADASTRO.PENDENTE}>Pendentes</SelectItem>
          <SelectItem value={STATUS_CADASTRO.INATIVO}>Inativos</SelectItem>
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
          <SelectItem value={STATUS_CADASTRO.TODOS}>Todos os Cargos</SelectItem>
          {roles?.map((role: any) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {getPerfilLabel(role.nome)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center space-x-2 pt-2 pb-1">
      <Checkbox
        id="semPontoHoje"
        checked={semPontoHojeValue}
        onCheckedChange={(checked) => onSemPontoHojeChange(!!checked)}
      />
      <Label
        htmlFor="semPontoHoje"
        className="text-sm font-medium leading-none cursor-pointer text-gray-700"
      >
        Apenas sem ponto hoje
      </Label>
    </div>

  </div>
);

export function CollaboratorsToolbar({
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
  empresas,
  selectedEmpresa,
  onEmpresaChange,
  selectedSemPontoHoje,
  onSemPontoHojeChange,
}: CollaboratorsToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for debouncing search
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Local state for mobile filters (deferred application)
  const [mobileStatus, setMobileStatus] = useState(selectedStatus);
  const [mobileRole, setMobileRole] = useState(selectedRole);
  const [mobileClient, setMobileClient] = useState(selectedClient);
  const [mobileEmpresa, setMobileEmpresa] = useState(selectedEmpresa);
  const [mobileSemPontoHoje, setMobileSemPontoHoje] = useState(selectedSemPontoHoje);

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
      setMobileEmpresa(selectedEmpresa);
      setMobileSemPontoHoje(selectedSemPontoHoje);
    }
  }, [isSheetOpen, selectedStatus, selectedRole, selectedClient, selectedEmpresa]);

  const hasAdvancedFilters =
    selectedStatus !== STATUS_CADASTRO.TODOS || selectedRole !== STATUS_CADASTRO.TODOS || selectedClient !== STATUS_CADASTRO.TODOS || selectedEmpresa !== STATUS_CADASTRO.TODOS || selectedSemPontoHoje;
  const hasAnyFilter = hasAdvancedFilters || localSearch !== "";
  const selectedCount =
    (selectedStatus !== STATUS_CADASTRO.TODOS ? 1 : 0) + (selectedRole !== STATUS_CADASTRO.TODOS ? 1 : 0) + (selectedClient !== STATUS_CADASTRO.TODOS ? 1 : 0) + (selectedEmpresa !== STATUS_CADASTRO.TODOS ? 1 : 0) + (selectedSemPontoHoje ? 1 : 0);

  const clearFilters = () => {
    setLocalSearch("");
    onSearchChange("");
    onApplyFilters({
      status: STATUS_CADASTRO.TODOS,
      categoria: STATUS_CADASTRO.TODOS,
      cliente: STATUS_CADASTRO.TODOS,
      empresa: STATUS_CADASTRO.TODOS,
      sem_ponto_hoje: false
    });
  };

  const applyMobileFilters = () => {
    onApplyFilters({
      status: mobileStatus,
      categoria: mobileRole,
      cliente: mobileClient,
      empresa: mobileEmpresa,
      sem_ponto_hoje: mobileSemPontoHoje,
    });
    setIsSheetOpen(false);
  };

  const clearMobileFilters = () => {
    setMobileStatus(STATUS_CADASTRO.TODOS);
    setMobileRole(STATUS_CADASTRO.TODOS);
    setMobileClient(STATUS_CADASTRO.TODOS);
    setMobileEmpresa(STATUS_CADASTRO.TODOS);
    setMobileSemPontoHoje(false);
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
            className={cn(
              "pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium",
              isMobile && localSearch && "pr-10"
            )}
          />
          {isMobile && localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <FilterButton
                  hasActiveFilters={hasAdvancedFilters}
                  selectedCount={selectedCount}
                  isMobile={isMobile}
                />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 pb-0 bg-gray-50 border-t-0 shadow-2xl"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetHeader className="text-left mb-4 px-6">
                  <SheetTitle className="text-xl font-bold">
                    Filtrar
                  </SheetTitle>
                  <SheetDescription className="text-gray-500">
                    Refine a lista de colaboradores pelas opções abaixo.
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
                    empresaValue={mobileEmpresa}
                    onEmpresaChange={setMobileEmpresa}
                    semPontoHojeValue={mobileSemPontoHoje}
                    onSemPontoHojeChange={setMobileSemPontoHoje}
                    onClear={clearMobileFilters}
                    onApply={applyMobileFilters}
                    roles={roles || []}
                    clients={clients || []}
                    empresas={empresas || []}
                  />
                </div>
                <div className="p-4 border-t bg-white mt-auto flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearMobileFilters}
                    className="flex-1 h-12 rounded-xl text-slate-500 font-bold border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={applyMobileFilters}
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm font-bold transition-all active:scale-95 text-white"
                  >
                    Aplicar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-3">
              {hasAnyFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <FilterButton
                    hasActiveFilters={hasAdvancedFilters}
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
                    empresaValue={selectedEmpresa}
                    onEmpresaChange={onEmpresaChange}
                    semPontoHojeValue={selectedSemPontoHoje}
                    onSemPontoHojeChange={onSemPontoHojeChange}
                    onClear={clearFilters}
                    roles={roles || []}
                    clients={clients || []}
                    empresas={empresas || []}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}



          <Can I={PERMISSIONS.USUARIOS.CRIAR}>
            <Button
              onClick={onRegister}
              className={cn(
                "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
                isMobile && "flex-1 h-11"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>{isMobile ? "Cadastrar" : "Cadastrar Colaborador"}</span>
            </Button>
          </Can>
        </div>
      </div>
    </div>
  );
}
