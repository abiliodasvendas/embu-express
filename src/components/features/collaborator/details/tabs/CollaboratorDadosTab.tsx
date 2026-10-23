import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Usuario } from "@/types/database";
import { isMotoboy } from "@/utils/business/roles";
import { formatCurrency } from "@/utils/formatters/currency";
import { cnpjMask, cpfMask, phoneMask, pixMask } from "@/utils/masks";
import { onlyNumbers } from "@/utils/string";
import { format, parseISO } from "date-fns";
import {
  Bike,
  Calendar as CalendarIcon,
  CreditCard,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

interface CollaboratorDadosTabProps {
  collaborator: Usuario;
  roleName?: string;
}

export function CollaboratorDadosTab({
  collaborator,
  roleName,
}: CollaboratorDadosTabProps) {
  return (
    <div className="space-y-6">
      {collaborator.senha_padrao && (
        <Banner
          variant="info"
          title="Senha Provisória Ativa"
          description={
            <span>
              Este colaborador ainda utiliza a senha padrão. Login:{" "}
              <strong className="font-mono">{cpfMask(collaborator.cpf)}</strong> | Senha:{" "}
              <strong className="font-mono text-primary">
                {onlyNumbers(collaborator.cpf).slice(0, 6)}
              </strong>
            </span>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-border shadow-xs rounded-[24px] overflow-hidden bg-card">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  E-mail
                </p>
                <p className="text-sm font-medium text-foreground break-all">
                  {collaborator.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Documentos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">CPF</p>
                    <p className="text-sm font-medium text-foreground">
                      {cpfMask(collaborator.cpf)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">RG</p>
                    <p className="text-sm font-medium text-foreground">
                      {collaborator.rg || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Nascimento
                </p>
                <p className="text-sm font-medium text-foreground">
                  {collaborator.data_nascimento
                    ? format(parseISO(collaborator.data_nascimento), "dd/MM/yyyy")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Telefone
                </p>
                <p className="text-sm font-medium text-foreground">
                  {collaborator.telefone ? phoneMask(collaborator.telefone) : "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <div className="h-4 w-4 font-bold text-muted-foreground flex items-center justify-center text-[10px]">
                  R$
                </div>
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Financeiro
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">TIPO CHAVE PIX</p>
                    <p className="text-sm font-medium text-foreground">
                      {collaborator.tipo_chave_pix || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">CHAVE PIX</p>
                    <p className="text-sm font-medium text-foreground break-all">
                      {pixMask(collaborator.chave_pix, collaborator.tipo_chave_pix) || "-"}
                    </p>
                  </div>
                  {collaborator.cnpj && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground font-semibold">CNPJ (MEI)</p>
                      <p className="text-sm font-medium text-foreground">
                        {cnpjMask(collaborator.cnpj)}
                      </p>
                    </div>
                  )}
                  {collaborator.valor_mei !== undefined && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground font-semibold">VALOR MEI</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(collaborator.valor_mei)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-[12px] shrink-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Endereço
                </p>
                <p className="text-sm font-medium text-foreground leading-tight">
                  {collaborator.endereco_completo || "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {isMotoboy(roleName) && (
            <Card className="border border-border shadow-xs rounded-[24px] bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bike className="h-4 w-4 text-primary" />
                  Veículo & CNH
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Moto / Modelo</p>
                  <p className="text-sm font-bold">{collaborator.moto_modelo || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Placa</p>
                  <Badge variant="outline" className="font-mono bg-yellow-50">
                    {collaborator.moto_placa || "-"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cor / Ano</p>
                  <p className="text-sm font-medium">
                    {collaborator.moto_cor || "-"} / {collaborator.moto_ano || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CNH</p>
                  <p className="text-sm font-medium">{collaborator.cnh_registro || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Categoria</p>
                  <p className="text-sm font-medium">{collaborator.cnh_categoria || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vencimento CNH</p>
                  <p className="text-sm font-medium">
                    {collaborator.cnh_vencimento
                      ? format(parseISO(collaborator.cnh_vencimento), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
