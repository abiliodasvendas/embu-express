import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { cpfMask, dateMask, phoneMask, rgMask } from "@/utils/masks";
import { Eye, EyeOff, Mail, MapPin, User, Users } from "lucide-react";

interface PersonalSectionProps {
  form: UseFormReturn<SelfRegistrationFormData>;
}

export function PersonalSection({ form }: PersonalSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            Dados Pessoais & Acesso
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Informações de identificação e credenciais de login
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nome_completo"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Nome Completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className={cn(
                      "pl-10",
                      fieldState.error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Seu nome completo"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                E-mail <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className={cn(
                      "pl-10",
                      fieldState.error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="seu@email.com"
                    type="email"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                CPF <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="000.000.000-00"
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
          control={form.control}
          name="telefone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Telefone / WhatsApp <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="(11) 99999-9999"
                  {...field}
                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="senha"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Senha de Acesso <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className={cn(
                      "pr-10",
                      fieldState.error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Defina uma senha forte"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endereco_completo"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Endereço com CEP <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className={cn(
                      "pl-10",
                      fieldState.error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Rua, Número, Bairro, Cidade - CEP"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome_mae"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Nome da Mãe <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className={cn(
                      "pl-10",
                      fieldState.error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Nome completo da mãe"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rg"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                RG <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="00.000.000-0"
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
          control={form.control}
          name="data_nascimento"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Data de Nascimento <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  {...field}
                  onChange={(e) => field.onChange(dateMask(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone_recado"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Telefone Recado <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(fieldState.error && "border-destructive focus:border-destructive")}
                  placeholder="(11) 99999-9999"
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
    </section>
  );
}
