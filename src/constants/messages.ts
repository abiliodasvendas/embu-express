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
    },
    sucesso: {
      // Adicionar conforme necessário
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

  // ========== USUÁRIOS/ADMIN ==========
  usuario: {
    erro: {
      carregar: "Erro ao carregar usuários.",
      criar: "Erro ao cadastrar usuário.",
      atualizar: "Erro ao atualizar usuário.",
      excluir: "Erro ao excluir usuário.",
      cpfJaExiste: "CPF/CNPJ já existe.",
      emailJaExiste: "Email já existe.",
      invalido: "Usuário selecionado é inválido ou não possui um ID de autenticação.",
      atualizacao: "Erro na Atualização.",
    },
    sucesso: {
      atualizado: "Usuário atualizado com sucesso!",
      excluido: "Usuário excluído com sucesso!",
      perfilAtualizado: "Perfil atualizado com sucesso.",
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
  | `dialogo.ativar.${keyof typeof messages.dialogo.ativar}`;

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
