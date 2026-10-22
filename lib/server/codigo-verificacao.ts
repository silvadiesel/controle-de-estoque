import { CODIGO_ALFABETO, CODIGO_LENGTH } from '@/lib/codigo-verificacao';

import { randomInt } from 'node:crypto';

export function gerarCodigoVerificacao(): string {
  let codigo = '';
  for (let i = 0; i < CODIGO_LENGTH; i++) {
    codigo += CODIGO_ALFABETO[randomInt(CODIGO_ALFABETO.length)];
  }
  return codigo;
}
