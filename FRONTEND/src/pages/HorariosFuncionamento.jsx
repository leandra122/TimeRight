import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { buscarHorariosFuncionamento, listarMeusSaloes, salvarHorariosFuncionamento } from '../service/api';
import './DashboardAdmin.css';

const nomesDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const semanaVazia = () => nomesDias.map((_, index) => ({ diaSemana: index + 1, periodos: [] }));
const mensagemErro = (error, padrao) => error.response?.data?.error || error.response?.data?.message || padrao;

const HorariosFuncionamento = () => {
  const [saloes, setSaloes] = useState([]);
  const [salaoId, setSalaoId] = useState('');
  const [dias, setDias] = useState(semanaVazia);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [configuracaoCarregadaPara, setConfiguracaoCarregadaPara] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarMeusSaloes().then(({ data }) => {
      if (!ativo) return;
      setSaloes(data);
      setSalaoId(data[0]?.id?.toString() || '');
      if (!data.length) setCarregando(false);
    }).catch((error) => {
      if (ativo) {
        setErro(mensagemErro(error, 'Não foi possível carregar seus salões.'));
        setCarregando(false);
      }
    });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!salaoId) return;
    let ativo = true;
    setDias(semanaVazia());
    setConfiguracaoCarregadaPara(null);
    setCarregando(true); setErro(''); setSucesso('');
    buscarHorariosFuncionamento(salaoId)
      .then(({ data }) => {
        if (!ativo) return;
        setDias(data.dias);
        setConfiguracaoCarregadaPara(salaoId);
      })
      .catch((error) => { if (ativo) setErro(mensagemErro(error, 'Não foi possível carregar os horários.')); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [salaoId]);

  const salaoSelecionado = useMemo(() => saloes.find((salao) => String(salao.id) === salaoId), [saloes, salaoId]);
  const alterarDia = (diaSemana, transformacao) => {
    setDias((atuais) => atuais.map((dia) => dia.diaSemana === diaSemana ? transformacao(dia) : dia));
    setErro('');
    setSucesso('');
  };

  const trocarSalao = (novoSalaoId) => {
    setDias(semanaVazia());
    setConfiguracaoCarregadaPara(null);
    setCarregando(true);
    setErro('');
    setSucesso('');
    setSalaoId(novoSalaoId);
  };
  const alternarFechado = (dia) => alterarDia(dia.diaSemana, (atual) => ({
    ...atual, periodos: atual.periodos.length ? [] : [{ horaInicio: '09:00', horaFim: '18:00' }],
  }));
  const adicionarPeriodo = (diaSemana) => alterarDia(diaSemana, (dia) => ({
    ...dia, periodos: [...dia.periodos, { horaInicio: '09:00', horaFim: '18:00' }],
  }));
  const removerPeriodo = (diaSemana, indice) => alterarDia(diaSemana, (dia) => ({
    ...dia, periodos: dia.periodos.filter((_, atual) => atual !== indice),
  }));
  const alterarPeriodo = (diaSemana, indice, campo, valor) => alterarDia(diaSemana, (dia) => ({
    ...dia,
    periodos: dia.periodos.map((periodo, atual) => atual === indice ? { ...periodo, [campo]: valor } : periodo),
  }));

  const validar = () => {
    for (const dia of dias) {
      const ordenados = [...dia.periodos].sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio) || a.horaFim.localeCompare(b.horaFim));
      for (const periodo of ordenados) {
        if (!periodo.horaInicio || !periodo.horaFim || periodo.horaInicio >= periodo.horaFim) {
          return `${nomesDias[dia.diaSemana - 1]} possui um período inválido.`;
        }
      }
      for (let indice = 1; indice < ordenados.length; indice += 1) {
        if (ordenados[indice].horaInicio < ordenados[indice - 1].horaFim) {
          return `${nomesDias[dia.diaSemana - 1]} possui períodos sobrepostos.`;
        }
      }
    }
    return '';
  };

  const salvar = async (event) => {
    event.preventDefault();
    if (salvando || configuracaoCarregadaPara !== salaoId) return;
    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); return; }
    setSalvando(true); setErro(''); setSucesso('');
    try {
      const { data } = await salvarHorariosFuncionamento(salaoId, { dias });
      setDias(data.dias);
      setSucesso('Horários de funcionamento salvos com sucesso.');
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível salvar os horários.'));
    } finally {
      setSalvando(false);
    }
  };

  return <div className="admin-page">
    <Navbar />
    <main className="admin-container horarios-page">
      <div className="admin-welcome"><div><h1>Horários de funcionamento</h1><p>Configure os períodos semanais de cada salão.</p></div></div>
      {saloes.length > 0 && <div className="form-group horarios-salao-select">
        <label htmlFor="salao-horarios">Salão</label>
        <select id="salao-horarios" value={salaoId} onChange={(event) => trocarSalao(event.target.value)} disabled={salvando}>
          {saloes.map((salao) => <option key={salao.id} value={salao.id}>{salao.nome}</option>)}
        </select>
      </div>}
      {erro && <div className="msg-erro" role="alert">{erro}</div>}
      {sucesso && <div className="msg-sucesso" role="status">{sucesso}</div>}
      {carregando && <p>Carregando horários...</p>}
      {!carregando && saloes.length === 0 && <div className="aviso-unico-cadastro">Cadastre um salão antes de configurar horários.</div>}
      {!carregando && salaoSelecionado && configuracaoCarregadaPara === salaoId && <form onSubmit={salvar}>
        <div className="horarios-semana">{dias.map((dia) => {
          const fechado = dia.periodos.length === 0;
          return <section className="horario-dia-card" key={dia.diaSemana}>
            <div className="horario-dia-cabecalho"><strong>{nomesDias[dia.diaSemana - 1]}</strong><label className="horario-fechado"><input type="checkbox" checked={fechado} onChange={() => alternarFechado(dia)} disabled={salvando} /> Fechado</label></div>
            {!fechado && dia.periodos.map((periodo, indice) => <div className="horario-periodo" key={`${dia.diaSemana}-${indice}`}>
              <label>Início<input type="time" step="60" value={periodo.horaInicio} onChange={(event) => alterarPeriodo(dia.diaSemana, indice, 'horaInicio', event.target.value)} disabled={salvando} required /></label>
              <label>Fim<input type="time" step="60" value={periodo.horaFim} onChange={(event) => alterarPeriodo(dia.diaSemana, indice, 'horaFim', event.target.value)} disabled={salvando} required /></label>
              <button type="button" className="btn-secondary" onClick={() => removerPeriodo(dia.diaSemana, indice)} disabled={salvando}>Remover</button>
            </div>)}
            {!fechado && <button type="button" className="btn-secondary" onClick={() => adicionarPeriodo(dia.diaSemana)} disabled={salvando}>Adicionar período</button>}
          </section>;
        })}</div>
        <button className="btn-primary horarios-salvar" type="submit" disabled={salvando || configuracaoCarregadaPara !== salaoId}>{salvando ? 'Salvando...' : 'Salvar horários'}</button>
      </form>}
    </main>
  </div>;
};

export default HorariosFuncionamento;
