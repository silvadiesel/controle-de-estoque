/**
 * Formata CNPJ conforme o usuário digita
 * Formato: 99.999.999/9999-99
 */
export function formatCNPJ(value: string): string {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');

  // Limita a 14 dígitos
  const limitedValue = cleanValue.slice(0, 14);

  // Aplica a máscara
  return limitedValue
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Formata telefone conforme o usuário digita
 * Formato: (99) 99999-9999 ou (99) 9999-9999
 */
export function formatPhone(value: string): string {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limitedValue = cleanValue.slice(0, 11);

  // Aplica a máscara
  if (limitedValue.length <= 10) {
    // Formato: (99) 9999-9999
    return limitedValue
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Formato: (99) 99999-9999
    return limitedValue
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
}

/**
 * Remove a formatação do CNPJ
 */
export function unformatCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Remove a formatação do telefone
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}
