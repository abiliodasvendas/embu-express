import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, dateMask, phoneMask, rgMask } from "@/utils/masks";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface SelfRegistrationFormProps {
    form: UseFormReturn<SelfRegistrationFormData>;
    onSubmit: (values: SelfRegistrationFormData) => Promise<void>;
}

export function SelfRegistrationForm({ form, onSubmit }: SelfRegistrationFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <Accordion type="multiple" defaultValue={["dados-pessoais", "dados-profissionais", "dados-financeiros"]} className="w-full space-y-4">

                {/* 1. SEÇÃO DE DADOS PESSOAIS */}
                <AccordionItem value="dados-pessoais" className="border rounded-xl bg-white shadow-sm px-4 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-base font-semibold text-gray-800">Dados Pessoais & Acesso</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 px-2 sm:px-4 space-y-4 border-t border-gray-100">
                        <FormField
                            control={form.control}
                            name="nome_completo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-xl bg-white" placeholder="Seu nome completo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-xl bg-white" placeholder="seu@email.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cpf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CPF <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
                                                placeholder="000.000.000-00"
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
                                control={form.control}
                                name="rg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RG <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
                                                placeholder="00.000.000-0"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="data_nascimento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Nascimento <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
                                                placeholder="DD/MM/AAAA"
                                                maxLength={10}
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
                                control={form.control}
                                name="telefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone / WhatsApp <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
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

                        <FormField
                            control={form.control}
                            name="nome_mae"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Mãe</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-xl bg-white" placeholder="Nome completo da mãe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endereco_completo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endereço com CEP</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-xl bg-white" placeholder="Rua, Número, Bairro, Cidade - CEP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="telefone_recado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone Recado</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
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
                            <FormField
                                control={form.control}
                                name="senha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha de Acesso <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    className="h-11 rounded-xl bg-white pr-10"
                                                    placeholder="******"
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>


                {/* 2. SEÇÃO DE DADOS PROFISSIONAIS (CNH & MOTO) */}
                <AccordionItem value="dados-profissionais" className="border rounded-xl bg-white shadow-sm px-4 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-base font-semibold text-gray-800">Dados da CNH & Moto</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 px-2 sm:px-4 space-y-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="cnh_registro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registro CNH <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-xl bg-white" placeholder="Nº Registro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cnh_vencimento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vencimento <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
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
                                        <FormLabel>Categoria <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-xl bg-white uppercase" placeholder="Ex: A, AB" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="moto_modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo da Moto <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-xl bg-white" placeholder="Ex: CG 160" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="moto_placa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placa <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white uppercase"
                                                placeholder="ABC-1234"
                                                {...field}
                                                maxLength={8}
                                                onChange={(e) => {
                                                    field.onChange(aplicarMascaraPlaca(e.target.value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
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
                                        <FormLabel>Cor <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-xl bg-white" placeholder="Ex: Preta" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="moto_ano"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
                                                placeholder="Ex: 2024"
                                                {...field}
                                                maxLength={4}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>


                {/* 3. SEÇÃO DE DADOS FINANCEIROS */}
                <AccordionItem value="dados-financeiros" className="border rounded-xl bg-white shadow-sm px-4 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-base font-semibold text-gray-800">Dados Financeiros</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 px-2 sm:px-4 space-y-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cnpj"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CNPJ (MEI) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-white"
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
                                name="chave_pix"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chave Pix <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-xl bg-white" placeholder="CPF, Email, ou Aleatória" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-6 shadow-lg hover:shadow-xl transition-all rounded-xl">
                Solicitar Cadastro
            </Button>
        </form>
    );
}
