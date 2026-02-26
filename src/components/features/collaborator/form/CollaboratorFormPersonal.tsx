import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { cn } from "@/lib/utils";
import { Perfil } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { cpfMask, dateMask, phoneMask, rgMask } from "@/utils/masks";
import { Eye, Mail, MapPin, User, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface CollaboratorFormPersonalProps {
  roles: Perfil[] | undefined;
}

export function CollaboratorFormPersonal({
  roles,
}: CollaboratorFormPersonalProps) {
  const {
    formState: { errors },
    control,
    watch,
  } = useFormContext();

  const cpfValue = watch("cpf") || "";
  const cpfDigits = cpfValue.replace(/\D/g, "");
  const initialPassword = cpfDigits.substring(0, 6);
  const isNewCollaborator = !watch("id");

  return (
    <div className="space-y-4">
      {/* Hidden ID for watch functionality */}
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <input type="hidden" {...field} value={field.value || ""} />
        )}
      />
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nome_completo"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                Nome Completo <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Nome completo"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.nome_completo &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nome_mae"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                Nome da Mãe
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Nome da mãe"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.nome_mae &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                Data de Nascimento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={cn(
                    "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                    errors.data_nascimento &&
                    "border-red-500 focus-visible:ring-red-200",
                  )}
                  {...field}
                  onChange={(e) => {
                    const val = dateMask(e.target.value);
                    field.onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                E-mail <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="email@exemplo.com"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.email &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
          <FormField
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                  CPF <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.cpf && "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                    onChange={(e) => field.onChange(cpfMask(e.target.value))}
                    maxLength={14}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="rg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                  RG <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="00.000.000-0"
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.rg && "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                    onChange={(e) => field.onChange(rgMask(e.target.value))}
                    maxLength={12}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="endereco_completo"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                Endereço Completo
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rua, número, bairro, cidade - UF"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.endereco_completo &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
          <FormField
            control={control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.telefone &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                    onChange={(e) => field.onChange(phoneMask(e.target.value))}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="telefone_recado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Telefone Recado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.telefone_recado &&
                      "border-red-500 focus-visible:ring-red-200",
                    )}
                    {...field}
                    onChange={(e) => field.onChange(phoneMask(e.target.value))}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="perfil_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                Cargo / Permissão <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.perfil_id && "border-red-500 focus:ring-red-200 ring-offset-0 focus:ring-2",
                    )}
                  >
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles?.map((role: Perfil) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {getPerfilLabel(role.nome)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Status <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                      errors.status && "border-red-500 focus:ring-red-200 ring-offset-0 focus:ring-2",
                    )}
                  >
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={STATUS_CADASTRO.ATIVO}>Ativo</SelectItem>
                  <SelectItem value={STATUS_CADASTRO.INATIVO}>Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(isNewCollaborator || watch("senha_padrao")) && (
          <div className="md:col-span-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 leading-none mb-1">
                Senha de Primeiro Acesso
              </h4>
              <p className="text-xs text-blue-700/80">
                O colaborador usará os 6 primeiros dígitos do CPF para o primeiro
                login:{" "}
                <span className="font-mono font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  {initialPassword || "------"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
