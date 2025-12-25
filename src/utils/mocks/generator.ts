/**
 * Utilitário para gerar dados fictícios brasileiros para testes e desenvolvimento.
 */

// Listas de dados para geração aleatória
const nomes = [
  "Miguel", "Arthur", "Gael", "Théo", "Heitor", "Ravi", "Davi", "Bernardo", "Noah", "Gabriel",
  "Helena", "Alice", "Laura", "Maria Alice", "Sophia", "Manuela", "Maitê", "Liz", "Cecília", "Isabella"
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
  let sum2 = cnpj.reduce((acc, val, i) => acc + val * w2[i], 0);
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
 * Gera dados fictícios para um funcionário
 */
export const generateEmployeeData = (clienteId?: string | number) => {
  const nomeCompleto = generateName();
  
  return {
    nome_completo: nomeCompleto,
    email: generateEmail(nomeCompleto),
    cpf: generateCPF(),
    perfil_id: randomNumber(1, 3), // 1: Admin, 2: Funcionario, 3: Motorista
    cliente_id: clienteId ? (typeof clienteId === "string" ? parseInt(clienteId) : clienteId) : null,
    ativo: true,
    turnos: [
      { hora_inicio: "08:00:00", hora_fim: "12:00:00" },
      { hora_inicio: "13:00:00", hora_fim: "18:00:00" }
    ]
  };
};

export const mockGenerator = {
  cpf: generateCPF,
  cnpj: generateCNPJ,
  name: generateName,
  email: generateEmail,
  phone: generatePhone,
  cep: generateCEP,
  address: generateAddress,
  client: generateClientData,
  employee: generateEmployeeData,
};
