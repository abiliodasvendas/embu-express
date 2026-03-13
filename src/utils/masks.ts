import { PIX_TYPES } from "@/constants/financeiro.constants";

export const phoneMask = (value: string): string => {
  if (!value) return "";

  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  if (numericValue.length <= 2) {
    return numericValue;
  }

  if (numericValue.length <= 6) {
    return numericValue.replace(/(\d{2})(\d{1,4})/, "($1) $2");
  }

  if (numericValue.length <= 10) {
    return numericValue.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3");
  }

  return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export const moneyMask = (value: string): string => {
  if (!value) return '';

  let numericValue = value.replace(/\D/g, '');

  if (numericValue.length === 1) {
    numericValue = '0' + numericValue;
  }

  const numberValue = Number(numericValue) / 100;

  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const moneyToNumber = (value: string): number => {
  if (!value) return 0;

  const numericString = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  return parseFloat(numericString) || 0;
};

export const cepMask = (value: string): string => {
  if (!value) return value;

  const numericValue = value.replace(/\D/g, '');

  return numericValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

export const cpfMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const cnpjMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 14);

  return numericValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const cpfCnpjMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "");
  return numericValue.length <= 11 ? cpfMask(value) : cnpjMask(value);
};

export const aplicarMascaraPlaca = (valor: string): string => {
  if (!valor) return "";
  const v = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);

  if (v.length <= 3) return v;

  // Se no 5º caractere (índice 4) tivermos uma letra, é Mercosul (ABC1D23)
  // Se for número, pode ser Antigo (ABC-1234)
  const isMercosul = v.length >= 5 && isNaN(Number(v[4]));

  if (isMercosul) {
    return v; // Mercosul não usa hífen
  }

  if (v.length > 3) {
    // Se ainda não temos 5 caracteres, assumimos o hífen preventivamente (padrão mais comum)
    // Mas se o 4º caractere for digitado e o 5º for letra, o formatador de exibição ou blur limpa.
    // Para uma máscara fluida, apenas adicionamos o hífen se for padrão antigo completo ou se estivermos digitando números.
    return `${v.slice(0, 3)}-${v.slice(3)}`;
  }

  return v;
};

export const dateMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 8); // Limit to 8 digits

  return numericValue
    .replace(/(\d{2})(\d)/, "$1/$2") // Add slash after 2nd digit
    .replace(/(\d{2})(\d)/, "$1/$2"); // Add slash after 4th digit (2nd part)
};

export const rgMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 9);

  return numericValue
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1})$/, "$1-$2");
};

export const kmMask = (value: string | number): string => {
  if (value === undefined || value === null || value === "") return "";

  // Converte para string e troca ponto por vírgula para uniformizar
  let val = value.toString().replace(".", ",");

  // Remove tudo que não for dígito ou vírgula
  val = val.replace(/[^0-9,]/g, "");

  // Garante apenas uma vírgula
  const parts = val.split(",");
  if (parts.length > 2) {
    val = parts[0] + "," + parts.slice(1).join("");
  }

  // Limita a 3 casas decimais (metros)
  if (parts.length === 2 && parts[1].length > 3) {
    val = parts[0] + "," + parts[1].slice(0, 3);
  }

  return val;
};

export const kmToNumber = (value: string): number => {
  if (!value) return 0;
  // Converte formato BR (0,5 ou 10,5) para padrão numérico (0.5 ou 10.5)
  const numericString = value.replace(",", ".");
  return parseFloat(numericString) || 0;
};

export const formatKm = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "--";

  // Usa KM com separador de milhar e até 3 decimais para todos os valores
  return (
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(value) + " km"
  );
};

export const timeMask = (value: string): string => {
  if (!value) return value;

  // Remove tudo que não for dígito e limita a 4 caracteres
  let numericValue = value.replace(/\D/g, "").slice(0, 4);

  // Validação do primeiro dígito (0, 1 ou 2)
  if (numericValue.length >= 1) {
    const firstDigit = parseInt(numericValue[0]);
    if (firstDigit > 2) {
      numericValue = "2" + numericValue.slice(1);
    }
  }

  // Validação do segundo dígito (se primeiro for 2, segundo max 3)
  if (numericValue.length >= 2) {
    const hours = parseInt(numericValue.slice(0, 2));
    if (hours > 23) {
      numericValue = "23" + numericValue.slice(2);
    }
  }

  // Validação do terceiro dígito (minutos - max 5)
  if (numericValue.length >= 3) {
    const thirdDigit = parseInt(numericValue[2]);
    if (thirdDigit > 5) {
      numericValue = numericValue.slice(0, 2) + "5" + numericValue.slice(3);
    }
  }

  if (numericValue.length <= 2) {
    return numericValue;
  }

  // Adiciona os dois pontos após os primeiros dois dígitos
  return numericValue.replace(/(\d{2})(\d)/, "$1:$2");
};
export const evpMask = (value: string): string => {
  if (!value) return value;

  // Remove non-alphanumeric
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "");

  // Limit to 32 chars
  const limitedValue = cleanValue.slice(0, 32);

  // 8-4-4-4-12 format
  return limitedValue
    .replace(/^([a-zA-Z0-9]{8})([a-zA-Z0-9])/, "$1-$2")
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, "$1-$2-$3")
    .replace(
      /^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/,
      "$1-$2-$3-$4"
    )
    .replace(
      /^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/,
      "$1-$2-$3-$4-$5"
    );
};

export const pixMask = (value: string, type: string): string => {
  if (!value) return value;

  switch (type?.toUpperCase()) {
    case PIX_TYPES.CPF:
      return cpfMask(value);
    case PIX_TYPES.CNPJ:
      return cnpjMask(value);
    case PIX_TYPES.TELEFONE:
      return phoneMask(value);
    case PIX_TYPES.ALEATORIA:
      return evpMask(value);
    default:
      return value;
  }
};
