import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { ROLES } from "@/constants/permissions.enum";
import { cn } from "@/lib/utils";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { Perfil } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, dateMask, evpMask, phoneMask, rgMask } from "@/utils/masks";
import { Briefcase, CreditCard, DollarSign, Eye, EyeOff, Mail, MapPin, User, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface SelfRegistrationFormProps {
    form: UseFormReturn<SelfRegistrationFormData>;
    onSubmit: (values: SelfRegistrationFormData) => Promise<void>;
    roles?: Perfil[];
}

export function SelfRegistrationForm({ form, onSubmit, roles }: SelfRegistrationFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>(["dados-pessoais", "dados-financeiros"]);

    const perfilId = form.watch("perfil_id");

    useEffect(() => {
        if (!roles || !perfilId) return;
        const selectedRole = roles.find(r => r.id.toString() === perfilId);
        if (selectedRole) {
            const isProfissional = 
                selectedRole.nome === ROLES.MOTOBOY ||
                selectedRole.nome === ROLES.FISCAL;

            form.setValue("isMotoboy", isProfissional);

            if (isProfissional) {
                setExpandedItems(["dados-pessoais", "cnh", "moto", "dados-financeiros"]);
            } else {
                // Limpar campos profissionais ao trocar para perfil que não seja profissional
                form.setValue("cnh_registro", "");
                form.setValue("cnh_vencimento", "");
                form.setValue("cnh_categoria", "");
                form.setValue("moto_modelo", "");
                form.setValue("moto_placa", "");
                form.setValue("moto_cor", "");
                form.setValue("moto_ano", "");
            }
        }
    }, [perfilId, roles, form]);

    const isMotoboy = form.watch("isMotoboy");

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 0. SELEÇÃO DE CARGO */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm mb-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                        <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 leading-none">Perfil do Colaborador</h3>
                        <p className="text-xs text-gray-500 mt-1">Selecione o cargo para liberar o formulário</p>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="perfil_id"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                Cargo / Permissão <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                            form.formState.errors.perfil_id && "border-red-500 focus:ring-red-200 ring-offset-0 focus:ring-2",
                                        )}
                                    >
                                        <SelectValue placeholder="Selecione o cargo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl shadow-xl">
                                    {roles?.map((role: Perfil) => (
                                        <SelectItem key={role.id} value={role.id.toString()} className="h-10 rounded-lg cursor-pointer">
                                            {getPerfilLabel(role.nome)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {perfilId ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Accordion
                        type="multiple"
                        value={expandedItems}
                        onValueChange={setExpandedItems}
                        className="w-full space-y-4"
                    >

                        {/* 1. SEÇÃO DE DADOS PESSOAIS */}
                        <AccordionItem value="dados-pessoais" className="border rounded-2xl bg-white shadow-sm px-4 overflow-hidden border-gray-100">
                            <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="text-base">Dados Pessoais & Acesso</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6 px-1 space-y-4 border-t border-gray-50/50">
                                <FormField
                                    control={form.control}
                                    name="nome_completo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Nome Completo <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                                    <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white pl-12 transition-colors", form.formState.errors.nome_completo && "border-red-500 focus-visible:ring-red-200")} placeholder="Seu nome completo" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nome_mae"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Nome da Mãe</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Users className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                                    <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white pl-12 transition-colors", form.formState.errors.nome_mae && "border-red-500 focus-visible:ring-red-200")} placeholder="Nome completo da mãe" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="data_nascimento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Data de Nascimento <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        placeholder="DD/MM/AAAA"
                                                        maxLength={10}
                                                        {...field}
                                                        onChange={(e) => field.onChange(dateMask(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">E-mail <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white pl-12 transition-colors", form.formState.errors.email && "border-red-500 focus-visible:ring-red-200")} placeholder="seu@email.com" type="email" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cpf"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">CPF <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        placeholder="000.000.000-00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                                        maxLength={14}
                                                    />
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="rg"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">RG <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        placeholder="00.000.000-0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(rgMask(e.target.value))}
                                                        maxLength={12}
                                                    />
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="endereco_completo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Endereço com CEP</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                                                    <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white pl-12 transition-colors", form.formState.errors.endereco_completo && "border-red-500 focus-visible:ring-red-200")} placeholder="Rua, Número, Bairro, Cidade - CEP" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="telefone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Telefone / WhatsApp <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        placeholder="(11) 99999-9999"
                                                        {...field}
                                                        onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                                        maxLength={15}
                                                    />
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="telefone_recado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Telefone Recado</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        placeholder="(11) 99999-9999"
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

                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="senha"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Senha de Acesso <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white pr-10 transition-colors", form.formState.errors.senha && "border-red-500 focus-visible:ring-red-200")}
                                                            placeholder="Defina uma senha forte"
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            aria-invalid={!!form.formState.errors.senha}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 2. SEÇÃO DE DADOS DA CNH */}
                        <AccordionItem value="cnh" className="border rounded-2xl bg-white shadow-sm px-4 overflow-hidden border-gray-100">
                                <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        <span className="text-base">Dados da CNH</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6 px-1 space-y-4 border-t border-gray-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cnh_registro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Registro CNH {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.cnh_registro && "border-red-500 focus-visible:ring-red-200")} placeholder="Nº Registro" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cnh_vencimento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Vencimento {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                            placeholder="DD/MM/AAAA"
                                                            maxLength={10}
                                                            {...field}
                                                            onChange={(e) => field.onChange(dateMask(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cnh_categoria"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Categoria {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors uppercase", form.formState.errors.cnh_categoria && "border-red-500 focus-visible:ring-red-200")} placeholder="Ex: A, AB" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                        {/* 3. SEÇÃO DE DADOS DA MOTO */}
                        <AccordionItem value="moto" className="border rounded-2xl bg-white shadow-sm px-4 overflow-hidden border-gray-100">
                                <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                        <span className="text-base">Dados da Moto</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6 px-1 space-y-4 border-t border-gray-50/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="moto_modelo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Modelo da Moto {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" placeholder="Ex: CG 160" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="moto_placa"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Placa {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors uppercase", form.formState.errors.moto_placa && "border-red-500 focus-visible:ring-red-200")}
                                                            placeholder="ABC-1234"
                                                            {...field}
                                                            maxLength={8}
                                                            onChange={(e) => field.onChange(aplicarMascaraPlaca(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="moto_cor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Cor {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.moto_cor && "border-red-500 focus-visible:ring-red-200")} placeholder="Ex: Preta" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="moto_ano"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Ano {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                                                    <FormControl>
                                                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.moto_ano && "border-red-500 focus-visible:ring-red-200")}
                                                            placeholder="Ex: 2024"
                                                            {...field}
                                                            maxLength={4}
                                                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>


                        {/* 4. SEÇÃO DE DADOS FINANCEIROS */}
                        <AccordionItem value="dados-financeiros" className="border rounded-2xl bg-white shadow-sm px-4 overflow-hidden border-gray-100">
                            <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                    <span className="text-base">Dados Financeiros</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6 px-1 space-y-4 border-t border-gray-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cnpj"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">CNPJ (MEI)</FormLabel>
                                                <FormControl>
                                                    <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.cnpj && "border-red-500 focus-visible:ring-red-200")}
                                                        {...field}
                                                        onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                                                        maxLength={18}
                                                        placeholder="00.000.000/0000-00"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tipo_chave_pix"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Tipo de Chave PIX <span className="text-red-500">*</span></FormLabel>
                                                <Select 
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue("chave_pix", "");
                                                        form.clearErrors("chave_pix");
                                                    }} 
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="CPF">CPF</SelectItem>
                                                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                                                        <SelectItem value="EMAIL">E-mail</SelectItem>
                                                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                                                        <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="chave_pix"
                                        render={({ field }) => {
                                            const tipoChavePix = form.watch("tipo_chave_pix");
                                            return (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Chave Pix <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            disabled={!tipoChavePix}
                                                            className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.chave_pix && "border-red-500 focus-visible:ring-red-200", !tipoChavePix && "opacity-50 cursor-not-allowed")}
                                                            placeholder={tipoChavePix ? "CPF, Email, ou Aleatória" : "Selecione o tipo primeiro"}
                                                            {...field}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (tipoChavePix === 'CPF') val = cpfMask(val);
                                                                else if (tipoChavePix === 'TELEFONE') val = phoneMask(val);
                                                                else if (tipoChavePix === 'CNPJ') val = cnpjMask(val);
                                                                else if (tipoChavePix === 'ALEATORIA') val = evpMask(val);
                                                                field.onChange(val);
                                                            }}
                                                            maxLength={
                                                                tipoChavePix === "CPF" ? 14 : 
                                                                tipoChavePix === "CNPJ" ? 18 : 
                                                                tipoChavePix === "TELEFONE" ? 15 :
                                                                tipoChavePix === "ALEATORIA" ? 36 : 100
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="ml-1" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Button type="submit" className="w-full h-14 text-lg font-black mt-6 shadow-xl hover:shadow-2xl transition-all rounded-2xl bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-wider">
                        Solicitar Cadastro
                    </Button>
                </div>
            ) : (
                <div className="py-16 text-center space-y-4 opacity-40">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Selecione um cargo para visualizar o restante do formulário.</p>
                </div>
            )}
        </form>
    );
}
