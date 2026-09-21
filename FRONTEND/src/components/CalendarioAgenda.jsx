import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarioAgenda.css';
import { distribuirEventosDia } from './agendaSemanal';

const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const inicioDia = (data) => new Date(data.getFullYear(), data.getMonth(), data.getDate());
const adicionarDias = (data, dias) => new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
const chaveDia = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
const inicioSemana = (data) => adicionarDias(inicioDia(data), -data.getDay());
const hora = (data) => `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;

export default function CalendarioAgenda({ agendamentos, onSelecionar, profissionais }) {
  const [visao, setVisao] = useState(() => window.innerWidth < 680 ? 'dia' : 'semana');
  const [referencia, setReferencia] = useState(inicioDia(new Date()));
  const gradeRef = useRef(null);
  const porProfissional = visao === 'semana' && profissionais !== undefined;
  useEffect(() => {
    if (porProfissional && gradeRef.current) gradeRef.current.scrollTop = 8 * 64;
  }, [porProfissional, referencia]);

  useEffect(() => {
    const atualizar = () => { if (window.innerWidth < 680) setVisao('dia'); };
    window.addEventListener('resize', atualizar);
    return () => window.removeEventListener('resize', atualizar);
  }, []);

  const eventos = useMemo(() => agendamentos.map((item) => ({ ...item, inicio: new Date(item.dataHora) })), [agendamentos]);
  const porDia = useMemo(() => eventos.reduce((mapa, evento) => {
    const chave = chaveDia(evento.inicio);
    mapa[chave] = [...(mapa[chave] || []), evento];
    return mapa;
  }, {}), [eventos]);

  const mover = (direcao) => setReferencia(atual => {
    if (visao === 'mes') return new Date(atual.getFullYear(), atual.getMonth() + direcao, 1);
    return adicionarDias(atual, direcao * (visao === 'semana' ? 7 : 1));
  });
  const titulo = visao === 'mes'
    ? `${nomesMeses[referencia.getMonth()]} ${referencia.getFullYear()}`
    : visao === 'semana'
      ? `${inicioSemana(referencia).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${adicionarDias(inicioSemana(referencia), 6).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : referencia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const eventosDoDia = (data) => porDia[chaveDia(data)] || [];
  const renderEventoMes = (evento) => <button key={evento.id} className={`cal-evento cal-${evento.status?.toLowerCase()}`} onClick={() => onSelecionar(evento)} title={`${evento.servicoNome || evento.servico?.nome} · ${evento.clienteNome || evento.usuario?.nome}`}><b>{hora(evento.inicio)}</b> {evento.servicoNome || evento.servico?.nome} <span>· {evento.clienteNome || evento.usuario?.nome}</span></button>;

  const renderMes = () => {
    const primeiro = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    const inicio = adicionarDias(primeiro, -primeiro.getDay());
    const dias = Array.from({ length: 42 }, (_, index) => adicionarDias(inicio, index));
    return <div className="cal-mes"><div className="cal-cabecalho-dias">{nomesDias.map(dia => <span key={dia}>{dia}</span>)}</div><div className="cal-grade-mes">{dias.map(data => { const fora = data.getMonth() !== referencia.getMonth(); const hoje = chaveDia(data) === chaveDia(new Date()); return <div className={`cal-dia-mes ${fora ? 'fora' : ''}`} key={chaveDia(data)}><span className={hoje ? 'hoje' : ''}>{data.getDate()}</span><div>{eventosDoDia(data).slice(0, 3).map(renderEventoMes)}{eventosDoDia(data).length > 3 && <small>+{eventosDoDia(data).length - 3} atendimentos</small>}</div></div>; })}</div></div>;
  };

  const renderGradeTempo = () => {
    const dias = visao === 'dia' ? [referencia] : Array.from({ length: 7 }, (_, index) => adicionarDias(inicioSemana(referencia), index));
    const linhas = Array.from({ length: 24 }, (_, horaAtual) => horaAtual);
    if (porProfissional) {
      if (!profissionais.length) return <p className="cal-sem-profissionais" role="status">Nenhum profissional cadastrado para este filtro.</p>;
      return <>
        <div className="cal-semana-ajuda"><span>Agenda por profissional · Role para os lados para ver todos os dias e para cima para horários anteriores às 08h.</span><div className="cal-legenda">{['AGENDADO', 'CONCLUIDO', 'CANCELADO'].map(status => <span key={status} className={`cal-${status.toLowerCase()}`}>{status}</span>)}</div></div>
        <div ref={gradeRef} className="cal-tempo-wrap cal-recursos-wrap" tabIndex={0} role="region" aria-label="Agenda semanal por profissional">
          <div className="cal-tempo cal-recursos" style={{ '--profissionais': profissionais.length, '--colunas': dias.length * profissionais.length }}>
            <div className="cal-cabecalho-tempo cal-recursos-cabecalho"><span className="cal-canto">Horário</span>{dias.map(data => <div className="cal-grupo-dia" key={chaveDia(data)} style={{ gridColumn: `span ${profissionais.length}` }}>
              <div className={`cal-data-recurso ${chaveDia(data) === chaveDia(new Date()) ? 'hoje' : ''}`}>{nomesDias[data.getDay()]} <b>{data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</b></div>
              <div className="cal-nomes-profissionais">{profissionais.map(profissional => <div key={profissional.id} className="cal-nome-profissional" title={`${profissional.nome} · ${profissional.salao?.nome || ''}`}><strong>{profissional.nome}</strong><small>{profissional.salao?.nome}</small></div>)}</div>
            </div>)}</div>
            <div className="cal-corpo-tempo cal-recursos-corpo"><div className="cal-horas">{linhas.map(valor => <span key={valor}>{String(valor).padStart(2, '0')}:00</span>)}</div>{dias.flatMap(data => profissionais.map(profissional => {
              const segmentos = distribuirEventosDia(eventos.filter(evento => String(evento.funcionario?.id) === String(profissional.id)), data);
              return <div className="cal-coluna-dia cal-coluna-profissional" key={`${chaveDia(data)}-${profissional.id}`} data-dia={chaveDia(data)} data-profissional={profissional.id} aria-label={`${profissional.nome}, ${data.toLocaleDateString('pt-BR')}`}>
                {linhas.map(valor => <i key={valor} />)}
                {!segmentos.length && <span className="cal-sem-atendimentos">Sem atendimentos</span>}
                {segmentos.map(({ evento, inicio, fim, coluna, colunas }) => {
                  const duracao = evento.duracao ?? evento.servico?.duracao;
                  const termino = new Date(evento.inicio.getTime() + duracao * 60000);
                  const descricao = `${profissional.nome} · ${evento.servicoNome || evento.servico?.nome} · ${evento.clienteNome || evento.usuario?.nome} · ${hora(evento.inicio)} – ${hora(termino)} · ${duracao} min · ${evento.status}`;
                  return <button key={evento.id} data-agendamento={evento.id} onClick={() => onSelecionar(evento)} aria-label={descricao} title={descricao} className={`cal-evento-tempo cal-evento-profissional cal-${evento.status?.toLowerCase()}`} style={{ top: `${inicio / 60 * 64}px`, height: `${(fim - inicio) / 60 * 64}px`, left: `calc(${coluna / colunas * 100}% + 3px)`, width: `calc(${100 / colunas}% - 6px)` }}><b>{hora(evento.inicio)} · {evento.servicoNome || evento.servico?.nome}</b><span>{evento.clienteNome || evento.usuario?.nome}</span><small>{hora(evento.inicio)} – {hora(termino)} · {duracao} min</small></button>;
                })}
              </div>;
            }))}</div>
          </div>
        </div>
      </>;
    }
    return <div className="cal-tempo-wrap"><div className={`cal-tempo cal-${visao}`} style={{ '--dias': dias.length }}><div className="cal-cabecalho-tempo"><span />{dias.map(data => <span key={chaveDia(data)} className={chaveDia(data) === chaveDia(new Date()) ? 'hoje' : ''}>{nomesDias[data.getDay()]} <b>{data.getDate()}</b></span>)}</div><div className="cal-corpo-tempo"><div className="cal-horas">{linhas.map(valor => <span key={valor}>{String(valor).padStart(2, '0')}:00</span>)}</div>{dias.map(data => <div className="cal-coluna-dia" key={chaveDia(data)}>{linhas.map(valor => <i key={valor} />)}{eventosDoDia(data).map((evento, indice, lista) => {
      const simultaneos = lista.filter(outro => Math.abs(outro.inicio - evento.inicio) < ((outro.duracao || 30) * 60000));
      const ordem = simultaneos.findIndex(outro => outro.id === evento.id);
      const minutos = evento.inicio.getHours() * 60 + evento.inicio.getMinutes();
      return <button key={evento.id} onClick={() => onSelecionar(evento)} className={`cal-evento-tempo cal-${evento.status?.toLowerCase()}`} style={{ top: `${(minutos / 60) * 64}px`, height: `${Math.max(26, ((evento.duracao || 30) / 60) * 64)}px`, left: `calc(${(ordem / simultaneos.length) * 100}% + 3px)`, width: `calc(${100 / simultaneos.length}% - 6px)` }}><b>{evento.servicoNome || evento.servico?.nome}</b><span>{evento.clienteNome || evento.usuario?.nome}</span>{(evento.duracao || 0) >= 45 && <small>{hora(evento.inicio)} · {evento.duracao} min</small>}</button>;
    })}</div>)}</div></div></div>;
  };

  return <section className="calendario card"><div className="cal-toolbar"><div className="cal-navegacao"><button className="btn-acao" onClick={() => mover(-1)} aria-label="Anterior"><ChevronLeft size={17} /></button><button className="btn-secondary cal-hoje" onClick={() => setReferencia(inicioDia(new Date()))}>Hoje</button><button className="btn-acao" onClick={() => mover(1)} aria-label="Próximo"><ChevronRight size={17} /></button><h2><CalendarDays size={19} />{titulo}</h2></div><div className="cal-visoes">{['mes', 'semana', 'dia'].map(item => <button key={item} className={visao === item ? 'ativo' : ''} onClick={() => setVisao(item)}>{item === 'mes' ? 'Mês' : item === 'semana' ? 'Semana' : 'Dia'}</button>)}</div></div>{visao === 'mes' ? renderMes() : renderGradeTempo()}</section>;
}
