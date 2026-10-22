import { CODIGO_REGEX, normalizarCodigo } from './codigo-verificacao';
import assert from 'node:assert/strict';
import test from 'node:test';

test('normalizarCodigo remove espaços e converte para maiúsculas', () => {
  assert.equal(normalizarCodigo(' k7qm 2xpa '), 'K7QM2XPA');
});

test('normalizarCodigo preserva o código legado de 4 dígitos', () => {
  assert.equal(normalizarCodigo('1234'), '1234');
});

test('CODIGO_REGEX aceita 8 caracteres do alfabeto', () => {
  assert.ok(CODIGO_REGEX.test('K7QM2XPA'));
});

test('CODIGO_REGEX rejeita 0, O, 1, I e tamanhos diferentes de 8', () => {
  for (const invalido of [
    'K7QM2XP0',
    'K7QM2XPO',
    'K7QM2XP1',
    'K7QM2XPI',
    'K7QM2XP',
    'K7QM2XPAB'
  ]) {
    assert.equal(CODIGO_REGEX.test(invalido), false, invalido);
  }
});
