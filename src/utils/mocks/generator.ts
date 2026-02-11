/**
 * Utilitário para gerar dados fictícios brasileiros para testes e desenvolvimento.
 */

// Listas de dados para geração aleatória
const nomes = [
  "Miguel", "Arthur", "Gael", "Théo", "Heitor", "Ravi", "Davi", "Bernardo", "Noah", "Gabriel",
  "Samuel", "Pedro", "Anthony", "Isaac", "Benício", "Benjamin", "Matheus", "Lucas", "Joaquim", "Nicolas",
  "Henrique", "Murilo", "Lorenzo", "Gustavo", "Felipe", "João", "Pietro", "Daniel", "Enzo", "Leonardo",
  "Caio", "Rafael", "Francisco", "Antônio", "Enzo Gabriel", "João Miguel", "João Pedro", "Eduardo"
];

const sobrenomes = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
  "Mendes", "Teixeira", "Moreira", "Cardoso", "Pinheiro", "Borges", "Santana", "Arruda", "Macedo", "Guimarães"
];

const ruas = [
  "Rua das Flores", "Avenida Paulista", "Rua Augusta", "Avenida Brasil", "Rua da Consolação",
  "Rua Oscar Freire", "Avenida Faria Lima", "Rua Haddock Lobo", "Rua Bela Cintra", "Alameda Santos",
  "Rua da Mooca", "Avenida Brigadeiro Faria Lima", "Rua Teodoro Sampaio", "Rua Cardeal Arcoverde"
];

const bairros = [
  "Centro", "Jardins", "Vila Madalena", "Pinheiros", "Moema", "Itaim Bibi", "Brooklin", "Vila Olímpia", "Perdizes", "Pompeia",
  "Santana", "Tatuapé", "Belenzinho", "Ipiranga", "Saúde", "Vila Mariana"
];

const cidades = [
  { nome: "São Paulo", estado: "SP" },
  { nome: "Santo André", estado: "SP" },
  { nome: "São Bernardo do Campo", estado: "SP" },
  { nome: "São Caetano do Sul", estado: "SP" },
  { nome: "Osasco", estado: "SP" },
  { nome: "Guarulhos", estado: "SP" },
  { nome: "Rio de Janeiro", estado: "RJ" },
  { nome: "Belo Horizonte", estado: "MG" },
  { nome: "Curitiba", estado: "PR" },
  { nome: "Porto Alegre", estado: "RS" }
];


/**
 * Gera um número aleatório entre min e max (inclusivo)
 */
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Gera um dígito verificador de CPF
 */
const createCPFDigit = (cpfPartial: string) => {
  let sum = 0;
  let weight = cpfPartial.length + 1;

  for (let i = 0; i < cpfPartial.length; i++) {
    sum += parseInt(cpfPartial[i]) * weight--;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Gera um CPF válido formatado ou não
 */
export const generateCPF = (formatted = true): string => {
  const n1 = randomNumber(0, 9);
  const n2 = randomNumber(0, 9);
  const n3 = randomNumber(0, 9);
  const n4 = randomNumber(0, 9);
  const n5 = randomNumber(0, 9);
  const n6 = randomNumber(0, 9);
  const n7 = randomNumber(0, 9);
  const n8 = randomNumber(0, 9);
  const n9 = randomNumber(0, 9);

  let cpf = `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}`;
  
  const d1 = createCPFDigit(cpf);
  cpf += d1;
  
  const d2 = createCPFDigit(cpf);
  cpf += d2;

  if (formatted) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
};

/**
 * Gera um nome completo aleatório
 */
export const generateName = (): string => {
  const nome = nomes[randomNumber(0, nomes.length - 1)];
  const sobrenome1 = sobrenomes[randomNumber(0, sobrenomes.length - 1)];
  const sobrenome2 = sobrenomes[randomNumber(0, sobrenomes.length - 1)];
  return `${nome} ${sobrenome1} ${sobrenome2}`;
};

/**
 * Gera um email aleatório baseado no nome
 */
export const generateEmail = (name: string): string => {
  const cleanName = name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "uol.com.br", "bol.com.br"];
  const domain = domains[randomNumber(0, domains.length - 1)];
  return `${cleanName}${randomNumber(1, 99)}@${domain}`;
};

/**
 * Gera um telefone celular aleatório formatado
 */
export const generatePhone = (): string => {
  const ddd = randomNumber(11, 99);
  const part1 = randomNumber(90000, 99999);
  const part2 = randomNumber(1000, 9999);
  return `(${ddd}) ${part1}-${part2}`;
};

/**
 * Gera um CEP aleatório formatado
 */
export const generateCEP = (): string => {
  const part1 = randomNumber(10000, 99999);
  const part2 = randomNumber(100, 999);
  return `${part1}-${part2}`;
};

/**
 * Gera um endereço completo aleatório
 */
export const generateAddress = () => {
  const cidade = cidades[randomNumber(0, cidades.length - 1)];
  return {
    cep: generateCEP(),
    logradouro: ruas[randomNumber(0, ruas.length - 1)],
    numero: randomNumber(1, 9999).toString(),
    complemento: Math.random() > 0.5 ? `Apto ${randomNumber(1, 100)}` : "",
    bairro: bairros[randomNumber(0, bairros.length - 1)],
    cidade: cidade.nome,
    estado: cidade.estado
  };
};

/**
 * Gera um CNPJ válido formatado ou não
 */
export const generateCNPJ = (formatted = true): string => {
  const n = Array.from({ length: 8 }, () => randomNumber(0, 9));
  const n9 = 0;
  const n10 = 0;
  const n11 = 0;
  const n12 = 1; // 0001
  
  const cnpj = [...n, n9, n10, n11, n12];
  
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = cnpj.reduce((acc, val, i) => acc + val * w1[i], 0);
  let d1 = 11 - (sum1 % 11);
  if (d1 >= 10) d1 = 0;
  cnpj.push(d1);

  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum2 = cnpj.reduce((acc, val, i) => acc + val * w2[i], 0);
  let d2 = 11 - (sum2 % 11);
  if (d2 >= 10) d2 = 0;
  cnpj.push(d2);

  const res = cnpj.join("");
  if (formatted) {
    return res.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return res;
};

/**
 * Gera dados fictícios para um cliente
 */
export const generateClientData = () => {
  const empresas = ["Tech", "Global", "Express", "Logistics", "Brasil", "Digital", "Solutions", "Trans", "Cargo", "Flow"];
  const sufixos = ["Ltda", "S.A.", "EPP", "ME"];
  
  const nomeBase = empresas[randomNumber(0, empresas.length - 1)];
  const sufixo = sufixos[randomNumber(0, sufixos.length - 1)];
  const complemento = empresas[randomNumber(0, empresas.length - 1)];
  
  const nomeFantasia = `${nomeBase} ${complemento}`;
  const razaoSocial = `${nomeFantasia} ${sufixo}`;
  
  return {
    nome_fantasia: nomeFantasia,
    razao_social: razaoSocial,
    cnpj: generateCNPJ(),
    ...generateAddress(),
    ativo: true,
  };
};

/**
 * Gera dados fictícios para uma empresa
 */
export const generateEmpresaData = () => {
  const nomes = ["Alpha", "Beta", "Gama", "Delta", "Omega", "Sigma", "Zeta", "Prime", "Master", "Ultra"];
  const setores = ["Logística", "Transportes", "Entregas", "Express", "Cargas", "Soluções", "Serviços", "Comércio", "Indústria"];
  const sufixos = ["Ltda", "S.A.", "ME", "EPP"];
  
  const nome = nomes[randomNumber(0, nomes.length - 1)];
  const setor = setores[randomNumber(0, setores.length - 1)];
  const sufixo = sufixos[randomNumber(0, sufixos.length - 1)];
  
  const nomeFantasia = `${nome} ${setor}`;
  const razaoSocial = `${nomeFantasia} ${sufixo}`;
  
  return {
    nome_fantasia: nomeFantasia,
    razao_social: razaoSocial,
    cnpj: generateCNPJ(),
    ativo: true,
  };
};

/**
 * Gera dados fictícios para um colaborador
 */
export const generateCollaboratorData = (clienteId?: string | number, empresaId?: string | number) => {
  const nomeCompleto = generateName();
  
  return {
    nome_completo: nomeCompleto,
    email: generateEmail(nomeCompleto),
    cpf: generateCPF(),
    rg: generateRG(),
    perfil_id: randomNumber(1, 3), // 1: Admin, 2: Colaborador, 3: Motorista
    cliente_id: clienteId ? (typeof clienteId === "string" ? parseInt(clienteId) : clienteId) : null,
    empresa_id: empresaId ? (typeof empresaId === "string" ? parseInt(empresaId) : empresaId) : null,
    ativo: true,
    turnos: [
      { 
        hora_inicio: "08:00:00", 
        hora_fim: "12:00:00",
        valor_contrato: 3500,
        valor_aluguel: 500,
        ajuda_custo: 200,
        valor_bonus: 0,
        mei: false
      },
      { 
        hora_inicio: "13:00:00", 
        hora_fim: "18:00:00",
        valor_contrato: 3500,
        valor_aluguel: 500,
        ajuda_custo: 200,
        valor_bonus: 0,
        mei: false
      }
    ]
  };
};


/**
 * Gera um registro de ponto fictício para o colaborador na data especificada
 */
/**
 * Gera um registro de ponto fictício para o colaborador na data especificada e turno
 */
export const generateTimeRecord = (usuarioId: string, date: string, turno?: { hora_inicio: string, hora_fim: string }, scenarioOverride?: number) => {
  // Cenários: 
  // 1. Normal
  // 2. Atraso Leve 
  // 3. Atraso Grave
  // 4. Hora Extra (Saída)
  // 5. Hora Extra Excessiva
  // 6. Trabalhando Agora
  
  const scenario = scenarioOverride || randomNumber(1, 6);
  let entrada = turno?.hora_inicio || "08:00:00"; 
  let saida: string | null = turno?.hora_fim || "18:00:00"; 
  
  // Variação básica de minutos para parecer natural
  const addMinutes = (time: string, minutes: number) => {
    const [h, m, s] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + minutes, s);
    return d.toTimeString().split(" ")[0];
  };

  if (scenario === 1) {
      // Normal
      entrada = addMinutes(entrada, randomNumber(-5, 0)); // Chega adiantado ou em ponto
      saida = addMinutes(saida!, randomNumber(0, 5));
  } else if (scenario === 2) {
      // Atraso Leve (6 a 14 min) - Deve dar AMARELO
      entrada = addMinutes(entrada, randomNumber(6, 14));
  } else if (scenario === 3) {
      // Atraso Grave (> 16 min) - Deve dar VERMELHO
      entrada = addMinutes(entrada, randomNumber(16, 60));
  } else if (scenario === 4) {
      // Hora Extra (15 to 60 min after end) - Deve dar AMARELO na saida
      saida = addMinutes(saida!, randomNumber(15, 60));
  } else if (scenario === 5) {
      // HE Excessiva (> 2h) - Deve dar VERMELHO na saida
      saida = addMinutes(saida!, randomNumber(121, 180));
  } else if (scenario === 6) {
      // Trabalhando
      entrada = addMinutes(entrada, randomNumber(-5, 5)); 
      saida = null;
  }

  // Converter para ISO String (Data Referencia + Hora)
  const toISO = (time: string | null, forceNextDay: boolean = false) => {
      if (!time) return null;
      
      let finalDate = date;
      if (forceNextDay) {
          const d = new Date(date);
          d.setDate(d.getDate() + 1);
          finalDate = d.toISOString().split('T')[0];
      }
      
      return `${finalDate}T${time}-03:00`;
  };

  // Detectar se virou a noite (Saída menor que Entrada)
  // Ex: Entrada 19:00, Saída 00:25
  const isOvernight = saida && entrada && saida < entrada;

  const entradaKm = randomNumber(10000, 50000);
  const saidaKm = saida ? entradaKm + randomNumber(1, 20) : null;

  return {
    usuario_id: usuarioId,
    data_referencia: date,
    entrada_hora: toISO(entrada),
    saida_hora: toISO(saida, !!isOvernight),
    entrada_km: entradaKm,
    saida_km: saidaKm,
    entrada_lat: -23.550520,
    entrada_long: -46.633308,
    saida_lat: -23.550520,
    saida_long: -46.633308,
    status_entrada: null, // Backend calcula
    status_saida: null,   // Backend calcula
    observacao: `Registro gerado automaticamente (Turno ${turno?.hora_inicio || '?'} - Cenário ${scenario})`
  };
};


/**
 * Gera dados fictícios para Moto
 */
export const generateMotoData = () => {
    const modelos = ["CG 160", "CB 300", "XRE 300", "Fazer 250", "Biz 125", "NMAX 160", "PCX 150"];
    const cores = ["Preta", "Vermelha", "Branca", "Azul", "Prata", "Cinza"];
    return {
        moto_modelo: modelos[randomNumber(0, modelos.length - 1)],
        moto_cor: cores[randomNumber(0, cores.length - 1)],
        moto_ano: randomNumber(2015, 2024).toString(),
        moto_placa: `ABC${randomNumber(1000, 9999).toString().slice(0, 1)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9).toString()}`.slice(0, 7).toUpperCase() // Simple mock, regex in form handles format
    };
};

/**
 * Formata uma data para o padrão brasileiro DD/MM/AAAA
 */
const formatDateBR = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Gera dados fictícios para CNH
 */
export const generateCNHData = () => {
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() + randomNumber(1, 5));
    
    return {
        cnh_registro: randomNumber(10000000000, 99999999999).toString(),
        cnh_vencimento: formatDateBR(validDate),
        cnh_categoria: Math.random() > 0.5 ? "A" : "AB"
    };
};

/**
 * Gera dados completos para Auto Cadastro (Motoboy)
 */
export const generateSelfRegistrationData = () => {
    const nomeCompleto = generateName();
    const documento = Math.random() > 0.5 ? generateCPF(false) : generateCNPJ(false); // Unformatted for input usually
    const address = generateAddress();
    const moto = generateMotoData();
    const cnh = generateCNHData();
    
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - randomNumber(18, 50));

    return {
        nome_completo: nomeCompleto,
        email: generateEmail(nomeCompleto),
        cpfcnpj: documento, // Form expects one field
        data_nascimento: formatDateBR(birthDate),
        nome_mae: generateName().split(" ").slice(0, 3).join(" "), // Shorter name
        
        // Address flattened
        endereco_completo: `${address.logradouro}, ${address.numero} - ${address.bairro}, ${address.cidade} - ${address.estado}, ${address.cep}`,
        
        telefone: generatePhone(),
        telefone_recado: generatePhone(),
        
        // Moto
        ...moto,
        
        // CNH
        ...cnh,
        
        chave_pix: generateCPF(true),
        senha: "Ogaiht+1", // Default mock password
    };
};

/**
 * Gera um RG fictício formatado
 */
export const generateRG = (): string => {
  const n1 = randomNumber(10, 99);
  const n2 = randomNumber(100, 999);
  const n3 = randomNumber(100, 999);
  const d = randomNumber(0, 9);
  return `${n1}.${n2}.${n3}-${d}`;
};

/**
 * Gera dados fictícios para um turno
 */
export const generateTurnData = () => {
    return {
        hora_inicio: "08:00",
        hora_fim: "18:00",
        valor_contrato: 3500,
        valor_aluguel: 500,
        ajuda_custo: 200,
        valor_bonus: 0,
        mei: Math.random() > 0.5
    };
};

export const mockGenerator = {
  rg: generateRG,
  cpf: generateCPF,
  cnpj: generateCNPJ,
  name: generateName,
  email: generateEmail,
  phone: generatePhone,
  cep: generateCEP,
  address: generateAddress,
  client: generateClientData,
  empresa: generateEmpresaData,
  collaborator: generateCollaboratorData,
  timeRecord: generateTimeRecord,
  moto: generateMotoData,
  cnh: generateCNHData,
  selfRegistration: generateSelfRegistrationData,
  turn: generateTurnData
};
