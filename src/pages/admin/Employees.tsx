import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { EmployeesToolbar } from "@/components/employees/EmployeesToolbar";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { useFilters } from "@/hooks/ui/useFilters";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useCreateEmployee, useDeleteEmployee, useEmployees, useRoles, useToggleEmployeeStatus } from "@/hooks/useEmployees";
import { Usuario } from "@/types/database";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Users, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Employees() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedCategoria: selectedRole,
    setSelectedCategoria: setSelectedRole,
    clearFilters,
  } = useFilters({
    categoriaParam: "role",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Usuario | null>(null);

  const { data: employees, isLoading, refetch } = useEmployees({ 
    searchTerm, 
    status: selectedStatus,
    role: selectedRole === "todos" ? undefined : selectedRole
  });

  const toggleStatus = useToggleEmployeeStatus();
  const deleteEmployee = useDeleteEmployee();
  const createEmployee = useCreateEmployee();
  const { data: roles } = useRoles();
  const { data: clients } = useClients();
  const { mutateAsync: createClientAsync } = useCreateClient();

  const handleQuickCreate = async () => {
    try {
      let clientId = clients?.[0]?.id;
      
      if (!clientId) {
        toast.info("Nenhum cliente encontrado. Gerando um novo cliente primeiro...");
        const newClient = await createClientAsync({
          ...mockGenerator.client(),
          silent: true
        });
        clientId = newClient.id;
      }

      const mockData = mockGenerator.employee(clientId);
      const finalData = {
        ...mockData,
        perfil_id: roles && roles.length > 0 ? roles[0].id : 2, 
        cliente_id: mockData.cliente_id,
      };

      await createEmployee.mutateAsync({
        ...finalData,
        silent: true
      } as any);
      // toast.success("Funcionário criado rapidamente!");
    } catch (error: any) {
      toast.error("Erro no Quick Create", { description: error.message });
    }
  };

  useEffect(() => {
    setPageTitle("Gestão de Funcionários");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (employee: Usuario) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (employee: Usuario) => {
    toggleStatus.mutate({ id: employee.id, ativo: !employee.ativo });
  };

  const handleDelete = (employee: Usuario) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover "${employee.nome_completo}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteEmployee.mutateAsync(employee.id);
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const isActionLoading = toggleStatus.isPending || deleteEmployee.isPending;
  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0">
                <div className="flex justify-end mb-4 md:hidden">
                  <Button
                    onClick={handleQuickCreate}
                    variant="outline"
                    className="gap-2 text-uppercase w-full font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11"
                  >
                    <Zap className="h-4 w-4" />
                    GERAR FUNCIONÁRIO FAKE
                  </Button>
                </div>
                <div className="hidden md:flex justify-end mb-4">
                  <Button
                    onClick={handleQuickCreate}
                    variant="outline"
                    className="gap-2 text-uppercase font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11 px-6"
                  >
                    <Zap className="h-4 w-4" />
                    GERAR FUNCIONÁRIO FAKE
                  </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="mb-6">
                <EmployeesToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedRole={selectedRole || "todos"}
                  onRoleChange={setSelectedRole || (() => {})}
                  onRegister={handleAdd}
                  onQuickCreate={handleQuickCreate}
                />
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : employees && employees.length > 0 ? (
                <EmployeeList
                  employees={employees}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ) : (
                <UnifiedEmptyState
                  icon={Users}
                  title={messages.emptyState.funcionario.titulo}
                  description={
                    searchTerm
                      ? messages.emptyState.funcionario.semResultados
                      : messages.emptyState.funcionario.descricao
                  }
                  action={!searchTerm ? { label: "Cadastrar Funcionário", onClick: handleAdd } : undefined}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingEmployee={editingEmployee}
      />

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
