export const phoneMask = (value: string): string => {
  if (!value) return value;
  
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }
  
  return value;
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
