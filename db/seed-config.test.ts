import assert from 'node:assert/strict';

import {
  PROTECTED_TABLE_NAMES,
  RESET_TABLE_NAMES,
  SEED_COUNTS,
  buildVehicleTargets,
  createSeededRandom,
  pickExistingUserId
} from './seed-config';

assert.deepEqual(PROTECTED_TABLE_NAMES, ['user', 'account', 'session']);

const resetTableNames: readonly string[] = RESET_TABLE_NAMES;

assert.equal(resetTableNames.includes('user'), false);
assert.equal(resetTableNames.includes('account'), false);
assert.equal(resetTableNames.includes('session'), false);
assert.deepEqual(SEED_COUNTS, {
  categorias: 10,
  fornecedor: 10,
  cliente: 10,
  pecas: 20,
  ordemVenda: 20,
  ordemServico: 20
});

const vehicleTargets = buildVehicleTargets(10, createSeededRandom(42));
assert.equal(vehicleTargets.length, 10);
assert.ok(vehicleTargets.every((count) => count >= 2 && count <= 3));

const totalVehicles = vehicleTargets.reduce((sum, count) => sum + count, 0);
assert.ok(totalVehicles >= 20 && totalVehicles <= 30);

const allowedUserIds = ['u1', 'u2', 'u3', 'u4'];
const pickedUserIds = new Set(
  Array.from({ length: 20 }, () => pickExistingUserId(allowedUserIds, createSeededRandom(99)))
);

assert.ok([...pickedUserIds].every((id) => allowedUserIds.includes(id)));

assert.throws(() => pickExistingUserId([], createSeededRandom(1)), {
  message: 'Nao foi encontrado nenhum user para relacionar as ordens.'
});

console.log('seed-config ok');
