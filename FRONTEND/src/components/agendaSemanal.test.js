import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distribuirEventosDia } from './agendaSemanal.js';

const dia = new Date(2026, 8, 21);
const evento = (id, dataHora, duracao, status = 'AGENDADO') => ({ id, dataHora, duracao, status });
test('preserva início, duração real e os três status', () => {
  const items = distribuirEventosDia([
    evento(1, '2026-09-21T09:15:00', 15),
    evento(2, '2026-09-21T10:00:00', 90, 'CONCLUIDO'),
    evento(3, '2026-09-21T13:00:00', 45, 'CANCELADO'),
  ], dia);
  assert.deepEqual(items.map(x => [x.inicio, x.fim, x.colunas, x.evento.status]), [
    [555, 570, 1, 'AGENDADO'], [600, 690, 1, 'CONCLUIDO'], [780, 825, 1, 'CANCELADO'],
  ]);
});
test('conflitos encadeados ou contidos nunca se sobrepõem na mesma faixa', () => {
  const items = distribuirEventosDia([
    evento(1, '2026-09-21T09:00:00', 120),
    evento(2, '2026-09-21T09:15:00', 15),
    evento(3, '2026-09-21T09:30:00', 60),
    evento(4, '2026-09-21T10:00:00', 120),
    evento(5, '2026-09-21T12:00:00', 30),
  ], dia);
  for (const a of items) for (const b of items) {
    if (a !== b && a.inicio < b.fim && b.inicio < a.fim) assert.notEqual(a.coluna, b.coluna);
  }
  assert.equal(items[4].colunas, 1);
});
test('divide atendimento que atravessa meia-noite sem perder o original clicável', () => {
  const original = evento(9, '2026-09-20T23:30:00', 90);
  const [anterior] = distribuirEventosDia([original], new Date(2026, 8, 20));
  const [atual] = distribuirEventosDia([original], dia);
  assert.deepEqual([anterior.inicio, anterior.fim, atual.inicio, atual.fim], [1410, 1440, 0, 60]);
  assert.equal(atual.evento, original);
});
test('profissional sem agenda permanece com grade vazia; não inventa duração', () => {
  assert.deepEqual(distribuirEventosDia([], dia), []);
  assert.deepEqual(distribuirEventosDia([evento(1, 'invalid', 30), evento(2, '2026-09-21T09:00:00', 0)], dia), []);
  const [item] = distribuirEventosDia([{ dataHora: '2026-09-21T09:00:00', servico: { duracao: 45 } }], dia);
  assert.equal(item.fim - item.inicio, 45);
});
