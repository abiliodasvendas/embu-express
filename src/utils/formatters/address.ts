import { onlyNumbers } from "../string";

export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const numeros = onlyNumbers(cep);
  if (numeros.length !== 8) return cep;
  return numeros.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarEnderecoCompleto(object: any): string {
  const cep = formatarCEP(object.cep);
  const lograoduro = object.logradouro;
  const bairro = object.bairro;
  const cidade = object.cidade;
  const estado = object.estado;
  const numero = object.numero;
  const referencia = object.referencia;

  if (referencia && referencia !== "") {
    return `${lograoduro}, ${numero} (${referencia}) - ${bairro}, ${cidade} - ${estado}, ${cep}`;
  }

  return `${lograoduro}, ${numero} - ${bairro}, ${cidade} - ${estado}, ${cep}`;
}

