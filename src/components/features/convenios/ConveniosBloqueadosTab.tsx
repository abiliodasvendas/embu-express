import { useMemo, useState } from "react";
import { useTodosBloqueiosConvenios } from "@/hooks/api/useBloqueiosConvenios";
import { useConvenios } from "@/hooks/api/useConvenios";
import { useLayout } from "@/contexts/LayoutContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import {
  ShieldAlert,
  Search,
  X,
  Store,
  Calendar,
  Settings2,
  ExternalLink,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BloqueioConvenio } from "@/types/database";

export function ConveniosBloqueadosTab() {
  const navigate = useNavigate();
  const { openGerenciarBloqueioConvenioDialog } = useLayout();

  const { data: bloqueios = [], isLoading: isLoadingBloqueios } = useTodosBloqueiosConvenios();
  const { data: convenios = [], isLoading: isLoadingConvenios } = useConvenios();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroConvenio, setFiltroConvenio] = useState<string>("TODOS");

  const colaboradoresAgrupados = useMemo(() => {
    type ColabBloqueioItem = {
      colaborador_id: string;
      nome_completo: string;
      cpf?: string;
      bloqueio_geral: boolean;
      convenios_especificos: Array<{ id: string; nome: string }>;
      motivo?: string;
      criado_em: string;
    };

    const map = new Map<string, ColabBloqueioItem>();

    bloqueios.forEach((b: BloqueioConvenio) => {
      const cId = b.colaborador_id;
      const cNome = b.colaborador?.nome_completo || "Colaborador";
      const cCpf = b.colaborador?.cpf;

      if (!map.has(cId)) {
        map.set(cId, {
          colaborador_id: cId,
          nome_completo: cNome,
          cpf: cCpf,
          bloqueio_geral: false,
          convenios_especificos: [],
          motivo: b.motivo || undefined,
          criado_em: b.criado_em,
        });
      }

      const item = map.get(cId)!;
      if (b.convenio_id === null) {
        item.bloqueio_geral = true;
      } else if (b.convenio) {
        item.convenios_especificos.push({
          id: b.convenio.id,
          nome: b.convenio.nome,
        });
      }
      if (!item.motivo && b.motivo) {
        item.motivo = b.motivo;
      }
    });

    return Array.from(map.values());
  }, [bloqueios]);

  const filtrados = useMemo(() => {
    return colaboradoresAgrupados.filter((item) => {
      const matchSearch =
        item.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cpf && item.cpf.includes(searchTerm));

      if (!matchSearch) return false;

      if (filtroConvenio === "TODOS") return true;
      if (filtroConvenio === "GERAL") return item.bloqueio_geral;

      return (
        item.bloqueio_geral ||
        item.convenios_especificos.some((c) => c.id === filtroConvenio)
      );
    });
  }, [colaboradoresAgrupados, searchTerm, filtroConvenio]);

  if (isLoadingBloqueios || isLoadingConvenios) {
    return <ListSkeleton />;
  }

  const totalGeral = colaboradoresAgrupados.filter((c) => c.bloqueio_geral).length;
  const totalEspecifico = colaboradoresAgrupados.filter((c) => !c.bloqueio_geral && c.convenios_especificos.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total de Colaboradores com Restrição
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {colaboradoresAgrupados.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Colaboradores com bloqueios registrados</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-rose-100 bg-rose-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Bloqueio Geral (Todas as Lojas)
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              {totalGeral}
            </div>
            <p className="text-xs text-rose-800/80 mt-1">Impedidos em 100% dos convênios</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-100 bg-amber-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Bloqueio Parcial (Lojas Selecionadas)
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Store className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-800 tracking-tight">
              {totalEspecifico}
            </div>
            <p className="text-xs text-amber-800/80 mt-1">Restritos apenas a parceiros específicos</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por colaborador ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl text-sm bg-white border-gray-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-64">
          <Select value={filtroConvenio} onValueChange={setFiltroConvenio}>
            <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 text-xs font-bold">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <SelectValue placeholder="Filtrar por parceiro" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="TODOS">Todas as Restrições</SelectItem>
              <SelectItem value="GERAL">Somente Bloqueio Geral</SelectItem>
              {convenios.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <UnifiedEmptyState
          icon={ShieldCheck}
          title="Nenhuma restrição encontrada"
          description={
            searchTerm || filtroConvenio !== "TODOS"
              ? "Nenhum colaborador corresponde aos filtros selecionados."
              : "Nenhum colaborador possui bloqueio de convênio ativo no momento."
          }
        />
      ) : (
        <ResponsiveDataList
          data={filtrados}
          mobileContainerClassName="space-y-3"
          mobileItemRenderer={(item) => (
            <div
              key={item.colaborador_id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.nome_completo}</p>
                  {item.cpf && <span className="text-[11px] text-gray-400">CPF: {item.cpf}</span>}
                </div>
                {item.bloqueio_geral ? (
                  <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                    Bloqueio Geral
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                    {item.convenios_especificos.length} loja(s)
                  </Badge>
                )}
              </div>

              {!item.bloqueio_geral && item.convenios_especificos.length > 0 && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Lojas Restritas:</span>
                  <p className="font-medium text-gray-800">
                    {item.convenios_especificos.map((c) => c.nome).join(", ")}
                  </p>
                </div>
              )}

              {item.motivo && (
                <p className="text-xs text-gray-500 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                  &ldquo;{item.motivo}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs h-9"
                  onClick={() => navigate(`/colaboradores/${item.colaborador_id}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-gray-500" />
                  Ver Colaborador
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  onClick={() =>
                    openGerenciarBloqueioConvenioDialog({
                      colaboradorId: item.colaborador_id,
                      colaboradorNome: item.nome_completo,
                    })
                  }
                >
                  <Settings2 className="w-3.5 h-3.5 mr-1" />
                  Ajustar
                </Button>
              </div>
            </div>
          )}
        >
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-3.5 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Abrangência
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Lojas Bloqueadas
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Motivo Registrado
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filtrados.map((item) => (
                    <tr key={item.colaborador_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 pl-6 align-middle">
                        <p className="font-bold text-gray-900">{item.nome_completo}</p>
                        {item.cpf && <span className="text-xs text-gray-400">CPF: {item.cpf}</span>}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {item.bloqueio_geral ? (
                          <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs">
                            Geral (Todas)
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs">
                            Parcial ({item.convenios_especificos.length})
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle max-w-xs">
                        {item.bloqueio_geral ? (
                          <span className="text-xs text-gray-400">Todas as oficinas e postos</span>
                        ) : item.convenios_especificos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.convenios_especificos.map((c) => (
                              <Badge key={c.id} variant="outline" className="text-[11px] font-medium border-gray-200 text-gray-700">
                                {c.nome}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle max-w-xs text-xs text-gray-600 truncate">
                        {item.motivo ? (
                          <span title={item.motivo} className="italic">
                            &ldquo;{item.motivo}&rdquo;
                          </span>
                        ) : (
                          <span className="text-gray-400">Não informado</span>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(item.criado_em).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 rounded-lg text-xs text-gray-600 hover:text-blue-600"
                            onClick={() => navigate(`/colaboradores/${item.colaborador_id}`)}
                            title="Ver perfil do colaborador"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Perfil
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            onClick={() =>
                              openGerenciarBloqueioConvenioDialog({
                                colaboradorId: item.colaborador_id,
                                colaboradorNome: item.nome_completo,
                              })
                            }
                          >
                            <Settings2 className="h-3.5 w-3.5 mr-1" />
                            Ajustar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ResponsiveDataList>
      )}
    </div>
  );
}

export default ConveniosBloqueadosTab;
