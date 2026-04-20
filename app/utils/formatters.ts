import type React from 'react';

/**
 * Formata telefone conforme o usuário digita.
 * Suporta 10 dígitos: (51) 9647-4579
 * Suporta 11 dígitos: (51) 99647-4579
 */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Formata CPF conforme o usuário digita.
 * Formato: 999.999.999-99
 */
export function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Formata CNPJ conforme o usuário digita.
 * Formato: 99.999.999/9999-99
 */
export function formatCNPJ(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatCEP(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/**
 * Formata placa de veículo conforme o usuário digita.
 * Suporta formato antigo (AAA-1234) e Mercosul (AAA1A23).
 */
export function formatPlaca(value: string): string {
  const clean = value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

/**
 * Bloqueia teclas não numéricas em inputs de inteiro positivo.
 * Uso: <Input onKeyDown={blockNonNumericKeyDown} />
 * Previne: e, E, +, -, . e qualquer letra.
 * Permite: dígitos, Backspace, Delete, setas, Tab, Ctrl/Cmd+A/C/V/X.
 */
export function blockNonNumericKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>
) {
  const controlKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
  ];
  if (controlKeys.includes(e.key)) return;
  if (e.ctrlKey || e.metaKey) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

// --- Funções de limpeza (remove formatação) ---

export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function unformatCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}

export function unformatPlaca(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function unformatCEP(value: string): string {
  return value.replace(/\D/g, '');
}
