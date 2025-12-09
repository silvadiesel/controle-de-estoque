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

/**
 * Formata CPF conforme o usuário digita
 * Formato: 999.999.999-99
 */
export function formatCPF(value: string): string {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limitedValue = cleanValue.slice(0, 11);

  // Aplica a máscara
  return limitedValue
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/**
 * Remove a formatação do CPF
 */
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata placa de veículo conforme o usuário digita
 * Suporta formato antigo (AAA-1234) e Mercosul (AAA1A23)
 */
export function formatPlaca(value: string): string {
  // Remove tudo que não é letra ou número
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Limita a 7 caracteres
  const limitedValue = cleanValue.slice(0, 7);

  // Aplica a máscara se tiver mais de 3 caracteres
  if (limitedValue.length > 3) {
    return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
  }

  return limitedValue;
}

/**
 * Remove a formatação da placa
 */
export function unformatPlaca(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}
