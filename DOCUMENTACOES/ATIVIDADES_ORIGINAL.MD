TELA DE CONFIGURAÇÕES
- explicar melhor a tela de configurações do sistema
o que é cada uma das coisas? precisamos de exemplos claros em cada bloco, para o usuário leigo não técnico
incluir configuração de valor adicional feriado (com explicação de que vai na ocorrência quando bate ponto em feriado)


TELA DE FERIADOS
data (Dia, mês ano)
descricao

DIALOG CLIENTE
- incluir campo dias trabalhados (numero aberto) no cadastro de cliente
- incluir campo km contratados (por motoboy) no cadastro do cliente



DIALOG COLABORADOR
- no dialog de colaborador, incluir a opção pendente no campo status
- ao abrir dialog de edição de colaborador e não alterar nada, da erro ao salvar alterações (exibe toast falando pra corrigir campos obrigatórios, mas não tem nada)
- campo CNPJ MEI opcional
- incluir campo tipo chave PIX e validar os valores de acordo (igual van360)
- exibir os campos dados CNH e dados moto para TODOS perfis (e não só motoboy), mudando apenas se é obrigatório ou nao (será para motoboy e fiscal)



DETALHES DO COLABORADOR
- criar abas/menus (ver melhor maneira) para funcionalidades (mobile first)
- criar visualização dos espelho de ponto mensal (com saldo)
- separar turnos/vinculos para nao exibir valores (mas cadastrar os valores lá)
- criar RELATORIO FINANCEIRO (MENSAL) POR COLABORADOR. Visão mensal que irá calcular:

Turno A = 2k
Turno B = 3k
OcorrenciasEntradas = 500
OcorrenciasSaida = 700
Total = (Turno A + Turno B + OcorrenciasEntrada - OcorrenciasSaida) = 4800

Isso por mês.
Analisar como gerar cada registro mensal para colaborador
Incluir opção de confirmar pagamento (pedir data).
Porem, no primeiro mês, considerar a data de inicio do colaborador no turno e calcular de acordo. Se o cliente tem 26 dias trabalhados, então calcula:
valorDia = SomaTotalEntrada / diasTrabalhoCliente
valorPrimeiroMes = valorDia * diasTrabalhados (contar dias data inicio até fim do mês, só dias uteis)
Calcular cada um dos valores individualmente, esse valorPrimeiroMes é o resultado de todas as entradas somadas, mas cada uma delas deve ser calculada individualmente

- criar aba OCORRENCIAS
armazenar quem registrou
data da ocorrência
tipo da ocorrência
considerar no relatório financeiro do mês?
tipo de lançamento (entrada/saída)?



DIALOG DE PONTO
- remover linha "localização protegida" e "localização de saída salva"
- separar KM Rodados em 2: KMs Trabalhados e KMs em Pausa
- no histórico de pausas, exibir ao lado da duração da pausa o km rodado naquela pausa (em relação ao ultimo km registrado (seja inicioPonto ou pausa)
- exibir qtd de tempo em trabalho e tempo em pausa


DIALOG DE TURNOS
- separa config financeira em blocos de ENTRADA e SAIDA
- adicionar na entrada o MEI
- adicionar campo data de início
- adicionar na saida o adiantamento
- exibir todos os campos sempre, a obrigatoriadade se mantem (e adicionar para FISCAL tbm)
- FormMessage de obrigatorio n ta aparecendo para cliente ao criar turno



TELA DE COLABORADORES
- listar TODOS colaboradores ativos com o registro de ponto do dia (left join), para exibir inclusive aqueles que nao tem. A ideia é ver todos colaboradores para saber quem marcou ponto ou não. Atualmente só exibe quem registrou ponto.



VISÃO MOTOBOY
- ao desativar um usuário, fazer logout nele caso esteja logado (campo diferente de ATIVO (conferir status no sql initial schema)).
- exibir visualização dos espelho de ponto mensal (com saldo)
- exibir valor mês (registro financeiro mensal)
registro de pontos está marcando com fuso horário? (registrei 01/03 as 23h e marcou 02/03, 1 dia depois)


TELA DE OCORRENCIAS
- listar ocorrências com filtros de dia (trazer dia atual), exibindo tbm quem registrou