import { useClientDetailsViewModel } from "@/hooks/ui/clients";
import {
  ClientDetailsSkeleton,
  ClientNotFound,
  ClientDetailsHeader,
  ClientContractCard,
  ClientPublicLinkCard,
  ClientStatsGrid,
  ClientUnidadesSection,
  ClientCollaboratorsSection,
} from "@/components/features/clients/details";

export default function ClientDetails() {
  const {
    id,
    navigate,
    client,
    isClientLoading,
    unidades,
    isUnidadesLoading,
    isCollabsLoading,
    flattenedCollaborators,
    paginatedCollaborators,
    totalCollabPages,
    collabPage,
    setCollabPage,
    paginatedUnidades,
    totalUnitPages,
    unitPage,
    setUnitPage,
    stats,
    isCopied,
    clientActions,
    handleToggleStatus,
    handleEditUnidade,
    handleAddUnidade,
    handleDeleteUnidade,
    handleCopyPublicLink,
    openClientEditDialog,
  } = useClientDetailsViewModel();

  if (isClientLoading) {
    return <ClientDetailsSkeleton />;
  }

  if (!client) {
    return <ClientNotFound onBack={() => navigate("/clientes")} />;
  }

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <ClientDetailsHeader
          client={client}
          unidades={unidades}
          totalUnits={stats.totalUnits}
          onBack={() => navigate("/clientes")}
          onEdit={openClientEditDialog}
          onToggleStatus={handleToggleStatus}
          clientActions={clientActions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <ClientContractCard client={client} />
            <ClientPublicLinkCard
              publicId={client.public_id}
              isCopied={isCopied}
              onCopy={handleCopyPublicLink}
            />
          </aside>

          <main className="lg:col-span-8 flex flex-col gap-6">
            <ClientStatsGrid
              totalUnits={stats.totalUnits}
              totalVinculos={stats.totalVinculos}
              ativo={client.ativo}
            />

            <ClientUnidadesSection
              unidades={unidades}
              isLoading={isUnidadesLoading}
              paginatedUnidades={paginatedUnidades}
              unitPage={unitPage}
              totalUnitPages={totalUnitPages}
              onPageChange={setUnitPage}
              onAddUnidade={handleAddUnidade}
              onEditUnidade={handleEditUnidade}
              onDeleteUnidade={handleDeleteUnidade}
              onNavigateToUnit={(unitId) => navigate(`/clientes/${id}/unidades/${unitId}`)}
            />

            <ClientCollaboratorsSection
              isLoading={isCollabsLoading}
              flattenedCollaborators={flattenedCollaborators}
              paginatedCollaborators={paginatedCollaborators}
              collabPage={collabPage}
              totalCollabPages={totalCollabPages}
              unidades={unidades}
              onPageChange={setCollabPage}
              onNavigateToCollaborator={(collabId) => navigate(`/colaboradores/${collabId}`)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
