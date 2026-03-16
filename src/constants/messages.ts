/**
 * Mensagens padronizadas do sistema
 * Organizadas por categoria para facilitar manutenção e consistência
 */

export const messages = {
  // ========== ERROS GENÉRICOS ==========
  erro: {
    generico: "Ocorreu um erro inesperado. Tente novamente.",
    carregar: "Erro ao carregar dados.",
    salvar: "Erro ao salvar dados.",
    excluir: "Erro ao excluir.",
    atualizar: "Erro ao atualizar.",
    operacao: "Erro ao realizar operação.",
    conexao: "Erro de conexão. Verifique sua internet.",
    permissao: "Você não tem permissão para realizar esta ação.",
    validacao: "Corrija os erros no formulário.",
    integridade: "Não é possível excluir este registro pois ele já possui histórico (ex: pontos ou ocorrências) associado. Utilize a edição para encerrá-lo/inativá-lo.",
  },

  // ========== SUCESSO GENÉRICO ==========
  sucesso: {
    salvar: "Salvo com sucesso.",
    excluir: "Excluído com sucesso.",
    atualizar: "Atualizado com sucesso.",
    operacao: "Operação realizada com sucesso.",
  },

  // ========== CLIENTES ==========
  cliente: {
    erro: {
      carregar: "Erro ao carregar clientes.",
      criar: "Erro ao cadastrar cliente.",
      atualizar: "Erro ao atualizar cliente.",
      excluir: "Erro ao excluir cliente.",
      toggleStatus: "Erro ao alterar status do cliente.",
      cnpjJaExiste: "Este CNPJ já está cadastrado para outro cliente.",
    },
    sucesso: {
      criado: "Cliente cadastrado com sucesso.",
      atualizado: "Cliente atualizado com sucesso.",
      excluido: "Cliente removido com sucesso.",
      status: "Status do cliente atualizado com sucesso.",
    },
  },

  // ========== COLABORADORES ==========
  colaborador: {
    erro: {
      carregar: "Erro ao carregar colaboradores.",
      criar: "Erro ao cadastrar colaborador.",
      atualizar: "Erro ao atualizar colaborador.",
      excluir: "Erro ao excluir colaborador.",
      toggleStatus: "Erro ao atualizar status do colaborador.",
    },
    sucesso: {
      criado: "Colaborador cadastrado com sucesso.",
      atualizado: "Colaborador atualizado com sucesso.",
      excluido: "Colaborador removido com sucesso.",
      status: "Status do colaborador atualizado com sucesso.",
    },
  },

  // ========== CONTROLE DE PONTO ==========
  ponto: {
    erro: {
      carregar: "Erro ao carregar registros de ponto.",
      registrar: "Erro ao registrar ponto.",
      iniciarPausa: "Erro ao iniciar pausa.",
      finalizarPausa: "Erro ao finalizar pausa.",
      atualizar: "Erro ao atualizar registro.",
      criar: "Erro ao criar registro.",
      excluir: "Erro ao excluir registro.",
    },
    sucesso: {
      registrado: "Ponto registrado com sucesso!",
      pausaIniciada: "Pausa iniciada!",
      pausaFinalizada: "Pausa finalizada!",
      atualizado: "Registro atualizado com sucesso!",
      criado: "Registro criado com sucesso!",
      excluido: "Registro excluído com sucesso!",
    },
  },

  // ========== AUTENTICAÇÃO ==========
  auth: {
    erro: {
      login: "Erro ao fazer login. Verifique suas credenciais.",
      senhaIncorreta: "Senha incorreta.",
      usuarioNaoEncontrado: "Usuário não encontrado.",
      cpfNaoEncontrado: "CPF não encontrado.",
      cpfNaoEncontradoDescricao: "Verifique o número informado. Caso tenha dúvidas, fale com o suporte.",
      emailNaoEncontrado: "E-mail não encontrado.",
      emailEnviado: "Erro ao enviar e-mail de redefinição.",
      sessaoExpirada: "Sua sessão expirou. Faça login novamente.",
      naoAutorizado: "Você não está autorizado a acessar esta página.",
    },
    sucesso: {
      login: "Login realizado com sucesso.",
      logout: "Logout realizado com sucesso.",
      senhaRedefinida: "Senha redefinida com sucesso.",
      senhaAlterada: "Senha alterada com sucesso.",
      emailEnviado: "E-mail de redefinição enviado com sucesso.",
    },
    info: {
      informeCpf: "Informe seu CPF.",
      informeCpfDescricao: "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
      appMobileDesenvolvimento: "App Mobile em desenvolvimento",
      aguardeLancamento: "Aguarde o lançamento da versão para motoboys.",
    },
  },

  // ========== VALIDAÇÕES ==========
  validacao: {
    campoObrigatorio: "Campo obrigatório.",
    senhasNaoCoincidem: "As senhas não coincidem.",
    formularioComErros: "Corrija os erros no formulário.",
  },

  // ========== LABELS COMUNS ==========
  labels: {
    ativo: "Ativo",
    inativo: "Inativo",
    todos: "Todos",
    buscar: "Buscar",
    status: "Status",
    pendente: "Pendente",
    verde: "Verde",
    amarelo: "Amarelo",
    vermelho: "Vermelho",
    cinza: "N/A",
  },

  // ========== SISTEMA ==========
  sistema: {
    erro: {
      copiar: "Erro ao copiar.",
      copiarDescricao: "Não foi possível copiar o texto.",
      falhaCopiar: "Falha ao copiar.",
      falhaCopiarDescricao: "Tente copiar o link manualmente.",
      consultarCep: "Erro ao consultar CEP.",
      enviarDados: "Erro ao enviar dados.",
      linkInvalido: "Link inválido.",
      linkInvalidoDescricao: "Este link de cadastro não é válido.",
      atualizacao: "Erro ao atualizar.",
    },
    sucesso: {
      copiado: "Copiado com sucesso.",
    },
    info: {
      cepNaoEncontrado: "CEP não encontrado na base de dados.",
      cepNaoEncontradoDescricao: "Preencha o endereço manualmente.",
      atualizacaoApp: "Atualização de App.",
      atualizacaoAppDescricao: "Baixando melhorias em segundo plano...",
      melhoriasProntas: "Melhorias Prontas.",
      melhoriasProntasDescricao: "A nova versão será aplicada na próxima vez que você abrir o app.",
      appAtualizado: "Pronto.",
      appAtualizadoDescricao: "O aplicativo foi atualizado com sucesso para a versão mais recente.",
    },
  },

  // ========== MOCK / TESTES ==========
  mock: {
    erro: {
      semDados: "Sem Clientes/Empresas para gerar mock.",
    },
    sucesso: {
      preenchido: "Campos preenchidos com dados de teste!",
      criadoRapido: "Criado rapidamente com dados fictícios!",
    },
  },

  // ========== COMPONENTES ==========
  erroBoundary: {
    titulo: "Ops! Algo deu errado",
    descricao: "Desculpe, encontramos um erro inesperado. Tente recarregar a página para continuar.",
    botao: "Recarregar Aplicação",
  },

  // ========== USUÁRIOS/ADMIN ==========
  usuario: {
    erro: {
      carregar: "Erro ao carregar usuários.",
      criar: "Erro ao cadastrar usuário.",
      atualizar: "Erro ao atualizar usuário.",
      excluir: "Erro ao excluir usuário.",
      cpfJaExiste: "CPF já cadastrado.",
      emailJaExiste: "Email já cadastrado.",
      cnpjJaExiste: "CNPJ já cadastrado.",
      invalido: "Usuário selecionado é inválido ou não possui um ID de autenticação.",
      atualizacao: "Erro na Atualização.",
    },
    sucesso: {
      atualizado: "Usuário atualizado com sucesso!",
      excluido: "Usuário excluído com sucesso!",
      perfilAtualizado: "Perfil atualizado com sucesso.",
    },
  },

  // ========== EMPRESAS ==========
  empresa: {
    erro: {
      criar: "Erro ao criar empresa",
      atualizar: "Erro ao atualizar empresa",
      excluir: "Erro ao excluir empresa",
      status: "Erro ao alterar status",
      quickCreate: "Erro no Quick Create",
      cnpjJaExiste: "Este CNPJ já está cadastrado para outra empresa.",
    },
    sucesso: {
      criada: "Empresa criada com sucesso!",
      atualizada: "Empresa atualizada com sucesso!",
      excluida: "Empresa excluída com sucesso!",
      status: "Status atualizado com sucesso!",
      criadaRapida: "Empresa criada rapidamente!",
    },
  },

  // ========== ESTADOS VAZIOS ==========
  emptyState: {
    cliente: {
      titulo: "Nenhum cliente encontrado",
      descricao: "Cadastre seu primeiro cliente para começar a gestão.",
      semResultados: "Não encontramos resultados para sua busca.",
    },
    colaborador: {
      titulo: "Nenhum colaborador encontrado",
      descricao: "Cadastre seu primeiro colaborador para começar a gestão.",
      semResultados: "Não encontramos resultados para sua busca.",
    },
    ponto: {
      titulo: "Nenhum registro de ponto encontrado",
      descricao: "Não há registros para o turno selecionado.",
      semResultados: "Não encontramos resultados para sua busca.",
    },
  },

  // ========== DIÁLOGOS DE CONFIRMAÇÃO ==========
  dialogo: {
    remover: {
      titulo: "Confirmar Remoção",
      descricao: "Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.",
      botao: "Remover",
    },
    desativar: {
      titulo: "Confirmar Desativação",
      descricao: "Tem certeza que deseja desativar este item?",
      botao: "Desativar",
    },
    ativar: {
      titulo: "Confirmar Ativação",
      descricao: "Deseja ativar este item?",
      botao: "Ativar",
    },
  },

  // ========== FINANCEIRO ==========
  financeiro: {
    erro: {
      carregar: "Erro ao carregar relatório financeiro.",
      registrarPagamento: "Erro ao registrar pagamento.",
    },
    sucesso: {
      pago: "Pagamento registrado com sucesso!",
    },
    labels: {
      detalhamentoTurno: "Detalhamento por Turno",
      lancamentosGerais: "Lançamentos Gerais",
      saldoLiquido: "Saldo Líquido Estimado",
      criterioProRata: "Cálculo Pró-Rata Aplicado",
      infoRascunho: "Este é um cálculo em tempo real (Rascunho). Pode ser ajustado até o pagamento.",
      infoPago: "Este é um registro estático de pagamento.",
    },
    confirmacao: {
      titulo: "Finalizar Fechamento",
      descricao: "Você está finalizando este fechamento e marcando-o como pago. Os valores atuais serão salvos de forma permanente para este mês. Deseja continuar?",
      botao: "Finalizar e Pagar",
    },
  },

  // ========== FERIADOS ==========
  feriado: {
    erro: {
      carregar: "Erro ao carregar feriados.",
      criar: "Erro ao cadastrar feriado.",
      atualizar: "Erro ao atualizar feriado.",
      excluir: "Erro ao excluir feriado.",
    },
    sucesso: {
      criado: "Feriado cadastrado com sucesso.",
      atualizado: "Feriado atualizado com sucesso.",
      excluido: "Feriado removido com sucesso.",
    },
  },

  // ========== OCORRÊNCIAS ==========
  ocorrencia: {
    erro: {
      carregar: "Erro ao carregar ocorrências.",
      criar: "Erro ao registrar ocorrência.",
      atualizar: "Erro ao atualizar ocorrência.",
      excluir: "Erro ao remover ocorrência.",
      tipo: {
        criar: "Erro ao criar tipo de ocorrência.",
        atualizar: "Erro ao atualizar tipo de ocorrência.",
        excluir: "Erro ao remover tipo de ocorrência.",
      },
    },
    sucesso: {
      criada: "Ocorrência registrada com sucesso!",
      atualizada: "Ocorrência atualizada com sucesso!",
      excluida: "Ocorrência removida com sucesso!",
      tipo: {
        criado: "Tipo de ocorrência criado com sucesso!",
        atualizado: "Tipo de ocorrência atualizado com sucesso!",
        excluido: "Tipo de ocorrência removido com sucesso!",
      },
    },
  },

  // ========== VÍNCULOS / TURNOS ==========
  vinculo: {
    erro: {
      criar: "Erro ao criar turno.",
      atualizar: "Erro ao atualizar turno.",
      excluir: "Erro ao remover turno.",
    },
    sucesso: {
      criado: "Turno criado com sucesso!",
      atualizado: "Turno atualizado com sucesso!",
      excluido: "Turno removido com sucesso!",
    },
  },
} as const;

/**
 * Tipo para as chaves de mensagens (para autocomplete)
 */
export type MessageKey =
  | `erro.${keyof typeof messages.erro}`
  | `sucesso.${keyof typeof messages.sucesso}`
  | `cliente.erro.${keyof typeof messages.cliente.erro}`
  | `cliente.sucesso.${keyof typeof messages.cliente.sucesso}`
  | `colaborador.erro.${keyof typeof messages.colaborador.erro}`
  | `colaborador.sucesso.${keyof typeof messages.colaborador.sucesso}`
  | `ponto.erro.${keyof typeof messages.ponto.erro}`
  | `ponto.sucesso.${keyof typeof messages.ponto.sucesso}`
  | `auth.erro.${keyof typeof messages.auth.erro}`
  | `auth.sucesso.${keyof typeof messages.auth.sucesso}`
  | `auth.info.${keyof typeof messages.auth.info}`
  | `validacao.${keyof typeof messages.validacao}`
  | `sistema.erro.${keyof typeof messages.sistema.erro}`
  | `sistema.sucesso.${keyof typeof messages.sistema.sucesso}`
  | `sistema.info.${keyof typeof messages.sistema.info}`
  | `usuario.erro.${keyof typeof messages.usuario.erro}`
  | `usuario.sucesso.${keyof typeof messages.usuario.sucesso}`
  | `emptyState.cliente.${keyof typeof messages.emptyState.cliente}`
  | `emptyState.colaborador.${keyof typeof messages.emptyState.colaborador}`
  | `emptyState.ponto.${keyof typeof messages.emptyState.ponto}`
  | `dialogo.remover.${keyof typeof messages.dialogo.remover}`
  | `dialogo.desativar.${keyof typeof messages.dialogo.desativar}`
  | `dialogo.ativar.${keyof typeof messages.dialogo.ativar}`
  | `financeiro.erro.${keyof typeof messages.financeiro.erro}`
  | `financeiro.sucesso.${keyof typeof messages.financeiro.sucesso}`
  | `financeiro.labels.${keyof typeof messages.financeiro.labels}`
  | `financeiro.confirmacao.${keyof typeof messages.financeiro.confirmacao}`
  | `feriado.erro.${keyof typeof messages.feriado.erro}`
  | `feriado.sucesso.${keyof typeof messages.feriado.sucesso}`
  | `ocorrencia.erro.${keyof typeof messages.ocorrencia.erro}`
  | `ocorrencia.sucesso.${keyof typeof messages.ocorrencia.sucesso}`
  | `vinculo.erro.${keyof typeof messages.vinculo.erro}`
  | `vinculo.sucesso.${keyof typeof messages.vinculo.sucesso}`;

/**
 * Função helper para obter mensagem por chave
 * Exemplo: getMessage('cliente.sucesso.criado') => "Cliente cadastrado com sucesso."
 */
export function getMessage(key: MessageKey | string): string {
  const keys = key.split('.');
  let value: unknown = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Retorna a chave se não encontrar
    }
  }

  return typeof value === 'string' ? value : key;
}
