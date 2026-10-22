// Sem I, O, 0 e 1 para evitar confusão visual ao digitar o código.
export const CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODIGO_LENGTH = 8;
export const CODIGO_REGEX = /^[A-HJ-NP-Z2-9]{8}$/;

export function normalizarCodigo(valor: string): string {
  return valor.trim().toUpperCase().replace(/\s+/g, '');
}
