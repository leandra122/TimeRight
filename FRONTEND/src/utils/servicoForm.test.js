import test from 'node:test';
import assert from 'node:assert/strict';
import { converterDuracao, separarDuracao, converterPreco, formatarPrecoInput } from './servicoForm.js';

test('durações mantêm os minutos no cadastro e na edição', () => {
  for (const [total, horas, minutos] of [[30, '0', '30'], [60, '1', '0'], [75, '1', '15'], [90, '1', '30'], [120, '2', '0']]) {
    assert.deepEqual(separarDuracao(total), { horas, minutos });
    assert.equal(converterDuracao(horas, minutos), total);
  }
  for (const [h, m] of [['0', '0'], ['-1', '30'], ['1.5', '0'], ['0', '60'], ['', '30'], ['1', ''], ['999999999', '0']]) {
    assert.ok(Number.isNaN(converterDuracao(h, m)));
  }
});

test('preços brasileiros são convertidos sem mudar o valor', () => {
  for (const [texto, valor] of [['35,00', 35], ['75,50', 75.5], ['120,00', 120], ['0,00', 0], ['35', 35], ['75.50', 75.5]]) {
    assert.equal(converterPreco(texto), valor);
    assert.equal(converterPreco(formatarPrecoInput(valor)), valor);
  }
  assert.equal(formatarPrecoInput(75.555), '75,555');
  for (const texto of ['', '-1', 'abc', '1e3', 'NaN', '35,001', '1.234,56', '1,2,3']) {
    assert.ok(Number.isNaN(converterPreco(texto)));
  }
});
