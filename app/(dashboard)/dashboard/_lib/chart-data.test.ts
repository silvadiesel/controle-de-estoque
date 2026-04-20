import { buildLast7Days } from './chart-data';
import assert from 'node:assert/strict';
import test from 'node:test';

test('buildLast7Days groups movements by day and marks today explicitly', () => {
  const data = buildLast7Days(
    [
      { created_at: '2026-04-20T10:00:00.000Z' },
      { created_at: '2026-04-20T15:00:00.000Z' },
      { created_at: '2026-04-18T09:00:00.000Z' },
      { created_at: '2026-04-10T09:00:00.000Z' }
    ],
    new Date('2026-04-20T12:00:00.000Z')
  );

  assert.equal(data.length, 7);
  assert.equal(data.at(-1)?.label, 'Hoje');
  assert.equal(data.at(-1)?.isToday, true);
  assert.equal(data.at(-1)?.count, 2);

  const sabado = data.find((day) => day.fullDate === '2026-04-18');
  assert.equal(sabado?.count, 1);

  const foraDaJanela = data.find((day) => day.fullDate === '2026-04-10');
  assert.equal(foraDaJanela, undefined);
});
