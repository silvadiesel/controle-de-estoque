import { CODIGO_REGEX } from '../codigo-verificacao';
import { gerarCodigoVerificacao } from './codigo-verificacao';
import assert from 'node:assert/strict';
import test from 'node:test';

test('gerarCodigoVerificacao sempre casa CODIGO_REGEX', () => {
  for (let i = 0; i < 200; i++) {
    const codigo = gerarCodigoVerificacao();
    assert.ok(CODIGO_REGEX.test(codigo), codigo);
  }
});
