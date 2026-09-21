// Divide atendimentos à meia-noite e distribui conflitos do mesmo profissional.
export function distribuirEventosDia(eventos, dia) {
  const inicioDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  const fimDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1);
  const segmentos = eventos.flatMap(evento => {
    const inicio = new Date(evento.dataHora);
    const duracao = Number(evento.duracao ?? evento.servico?.duracao);
    const fim = new Date(inicio.getTime() + duracao * 60000);
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(duracao) || duracao <= 0 || inicio >= fimDia || fim <= inicioDia) return [];
    return [{ evento, inicio: Math.max(0, (inicio - inicioDia) / 60000), fim: Math.min(1440, (fim - inicioDia) / 60000) }];
  }).sort((a, b) => a.inicio - b.inicio || b.fim - a.fim || String(a.evento.id).localeCompare(String(b.evento.id)));
  let grupo = [];
  let fins = [];
  let limite = -1;
  const finalizar = () => grupo.forEach(item => { item.colunas = fins.length; });
  for (const item of segmentos) {
    if (item.inicio >= limite) {
      finalizar(); grupo = []; fins = []; limite = -1;
    }
    let coluna = fins.findIndex(fim => fim <= item.inicio);
    if (coluna === -1) coluna = fins.length;
    fins[coluna] = item.fim;
    item.coluna = coluna;
    grupo.push(item);
    limite = Math.max(limite, item.fim);
  }
  finalizar();
  return segmentos;
}
