export const separarDuracao = (duracao) => ({
  horas: String(Math.floor(Number(duracao) / 60)),
  minutos: String(Number(duracao) % 60),
});

export function converterDuracao(horas, minutos) {
  if (!/^\d+$/.test(String(horas)) || !/^\d+$/.test(String(minutos))) return NaN;
  const total = Number(horas) * 60 + Number(minutos);
  return Number(minutos) < 60 && Number.isInteger(total) && total > 0 && total <= 2147483647
    ? total : NaN;
}

export function formatarPrecoInput(preco) {
  if (preco === '') return '';
  const [inteiro, decimal = ''] = String(preco).split('.');
  return `${inteiro},${decimal.padEnd(2, '0')}`;
}

export function converterPreco(preco) {
  const texto = String(preco).trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto)) return NaN;
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) && valor >= 0 ? valor : NaN;
}
