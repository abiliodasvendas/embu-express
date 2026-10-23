import { Banner } from "@/components/ui/Banner";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Perfil } from "@/types/database";
import { StatusUsuario } from "@/types/enums";
import { cpfMask, dateMask, phoneMask, rgMask } from "@/utils/masks";
import { onlyNumbers } from "@/utils/string";
import { Eye, Mail, MapPin, User, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface CollaboratorFormPersonalProps {
  roles?: Perfil[];
}

export function CollaboratorFormPersonal({ roles }: CollaboratorFormPersonalProps) {
  const {
    formState: { errors },
    control,
    watch,
  } = useFormContext();

  const cpfValue = watch("cpf") || "";
  const cpfDigits = onlyNumbers(cpfValue);
  const initialPassword = cpfDigits.substring(0, 6);
  const isNewCollaborator = !watch("id");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <input type="hidden" {...field} value={field.value || ""} />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nome_completo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Nome Completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Nome completo do colaborador"
                    className={cn(
                      "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                      errors.nome_completo && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                E-mail <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    className={cn(
                      "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                      errors.email && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                CPF <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    errors.cpf && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(cpfMask(e.target.value))}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Telefone / WhatsApp <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-9999"
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    errors.telefone && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background border-border text-sm font-normal"
                >
                  <option value={StatusUsuario.ATIVO}>Ativo</option>
                  <option value={StatusUsuario.PENDENTE}>Pendente</option>
                  <option value={StatusUsuario.INATIVO}>Inativo</option>
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Data de Nascimento
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    errors.data_nascimento && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(dateMask(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="rg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                RG
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="00.000.000-0"
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    errors.rg && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(rgMask(e.target.value))}
                  maxLength={12}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nome_mae"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-semibold text-foreground">
                Nome da Mãe
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Nome completo da mãe"
                    className={cn(
                      "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                      errors.nome_mae && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endereco_completo"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Endereço Completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Rua, número, bairro, cidade - UF"
                    className={cn(
                      "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                      errors.endereco_completo && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefone_recado"
          render={({ field }) => (
            <FormItem className="md:col-span-1">
              <FormLabel className="text-xs font-semibold text-foreground">
                Telefone Recado
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-9999"
                  className={cn(
                    "h-11 rounded-[18px] bg-background border-border text-sm font-normal",
                    errors.telefone_recado && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...field}
                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        {(isNewCollaborator || watch("senha_padrao")) && (
          <div className="md:col-span-3">
            <Banner
              variant="info"
              icon={Eye}
              title="Senha de Primeiro Acesso"
              description={`O colaborador usará os 6 primeiros dígitos do seu CPF (${initialPassword || "------"}) para o primeiro login na plataforma.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
