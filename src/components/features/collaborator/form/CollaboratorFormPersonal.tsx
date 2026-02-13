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
import { cn } from "@/lib/utils";
import { Perfil } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { cpfMask, dateMask, phoneMask, rgMask } from "@/utils/masks";
import { Eye, Mail, User } from "lucide-react";
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
              <FormLabel>
                Nome Completo <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Nome completo"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-white",
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
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de Nascimento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={cn(
                    "h-11 rounded-xl bg-white",
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
              <FormLabel>
                E-mail <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="email@exemplo.com"
                    className={cn(
                      "pl-12 h-11 rounded-xl bg-white",
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  CPF <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    className={cn(
                      "h-11 rounded-xl bg-white",
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
                <FormLabel>
                  RG <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="00.000.000-0"
                    className={cn(
                      "h-11 rounded-xl bg-white",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
          <FormField
            control={control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    className={cn(
                      "h-11 rounded-xl bg-white",
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
                <FormLabel>Telefone Recado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    className={cn(
                      "h-11 rounded-xl bg-white",
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
              <FormLabel>
                Cargo / Permissão <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl bg-white border-gray-200",
                      errors.perfil_id && "border-red-500 focus:ring-red-200",
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
              <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl bg-white border-gray-200",
                      errors.status && "border-red-500 focus:ring-red-200",
                    )}
                  >
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
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
