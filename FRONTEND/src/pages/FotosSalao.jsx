import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VoltarPerfilSalao from '../components/VoltarPerfilSalao';
import Navbar from '../components/Navbar';
import { api, listarMeusSaloes } from '../service/api';
import './DashboardAdmin.css';

const erroApi = e => e.response?.data?.error || 'Não foi possível concluir. Tente novamente.';
const imagemUrl = url => api.defaults.baseURL.replace(/\/$/, '') + url;

function Galeria({ salaoId }) {
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pronto, setPronto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [revisao, setRevisao] = useState(0);
  const [tentativa, setTentativa] = useState(0);
  const ativo = useRef(false);
  const enviando = useRef(false);
  const base = '/saloes/' + salaoId + '/fotos';
  useEffect(() => {
    let cancelado = false;
    ativo.current = true;
    setCarregando(true); setPronto(false); setErro('');
    api.get(base).then(({ data }) => {
      if (!cancelado) { setFotos(data); setPronto(true); }
    }).catch(e => { if (!cancelado) setErro(erroApi(e)); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; ativo.current = false; };
  }, [base, tentativa]);

  async function executar(acao, mensagem) {
    if (enviando.current || !pronto) return;
    enviando.current = true; setOcupado(true); setErro(''); setSucesso('');
    try {
      const { data } = await acao();
      if (ativo.current) { setFotos(data); setRevisao(v => v + 1); setSucesso(mensagem); }
    } catch (e) { if (ativo.current) setErro(erroApi(e)); }
    finally { enviando.current = false; if (ativo.current) setOcupado(false); }
  }
  function enviar(event, fotoId) {
    const arquivos = Array.from(event.target.files || []);
    event.target.value = '';
    if (!arquivos.length) return;
    if (arquivos.some(f => !['image/jpeg', 'image/png'].includes(f.type) || !f.size || f.size > 5 * 1024 * 1024)) {
      setErro('Escolha fotos JPEG ou PNG de até 5 MB cada.'); return;
    }
    const total = fotos.length + arquivos.length;
    if (!fotoId && (total < 3 || total > 10)) {
      setErro('Selecione fotos para manter uma galeria entre 3 e 10 imagens.'); return;
    }
    const form = new FormData();
    arquivos.forEach(f => form.append(fotoId ? 'arquivo' : 'arquivos', f));
    executar(() => fotoId ? api.put(base + '/' + fotoId, form) : api.post(base, form),
      fotoId ? 'Foto substituída.' : 'Fotos enviadas com sucesso.');
  }
  return <section className="card admin-card">
    <h2>Fotos do estabelecimento</h2>
    <p>De 3 a 10 fotos reais. A principal também faz parte da galeria. JPEG ou PNG, até 5 MB e 16 megapixels por foto.</p>
    {carregando && <p role="status">Carregando fotos...</p>}
    {erro && <div className="msg-erro" role="alert">{erro}</div>}
    {sucesso && <div className="msg-sucesso" role="status">{sucesso}</div>}
    {!carregando && !pronto && <button className="btn-secondary" onClick={() => setTentativa(v => v + 1)}>Tentar novamente</button>}
    {pronto && <>
      <div className="form-group"><label htmlFor="enviar-fotos">Enviar fotos ({fotos.length}/10)</label>
        <input id="enviar-fotos" type="file" accept="image/jpeg,image/png" multiple disabled={ocupado || fotos.length >= 10} onChange={e => enviar(e)} />
      </div>
      {ocupado && <p role="status">Salvando fotos, aguarde...</p>}
      {!fotos.length && <p>Selecione pelo menos 3 fotos no primeiro envio.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {fotos.map((foto, i) => <article className="card" key={foto.id}>
          <img src={imagemUrl(foto.url) + '?v=' + revisao} alt={'Foto ' + (i + 1) + ' do salão'}
            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
          <p>{foto.principal ? 'Foto principal' : 'Foto da galeria'}</p>
          <button type="button" className="btn-secondary" disabled={ocupado || foto.principal}
            onClick={() => executar(() => api.patch(base + '/' + foto.id + '/principal'), 'Foto principal atualizada.')}>Usar como principal</button>
          <div className="form-group"><label htmlFor={'substituir-' + foto.id}>Substituir foto</label>
            <input id={'substituir-' + foto.id} type="file" accept="image/jpeg,image/png" disabled={ocupado} onChange={e => enviar(e, foto.id)} />
          </div>
          <button type="button" className="btn-danger" disabled={ocupado || fotos.length <= 3}
            onClick={() => executar(() => api.delete(base + '/' + foto.id), 'Foto removida.')}>Remover foto</button>
        </article>)}
      </div>
      {fotos.length === 3 && <p>Para manter o mínimo de 3 fotos, use Substituir ou envie outra antes de remover.</p>}
    </>}
  </section>;
}
export default function FotosSalao() {
  const [params] = useSearchParams();
  const salaoSolicitado = params.get('salaoId');
  const [saloes, setSaloes] = useState([]);
  const [id, setId] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    setCarregando(true); setErro('');
    listarMeusSaloes().then(({ data }) => { if (ativo) {
      setSaloes(data);
      const inicial = salaoSolicitado ? data.find(item => String(item.id) === salaoSolicitado) : data[0];
      setId(String(inicial?.id || ''));
    } })
      .catch(() => { if (ativo) setErro('Não foi possível carregar seus salões.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa, salaoSolicitado]);
  return <div className="admin-page"><Navbar /><div className="admin-container">
    <VoltarPerfilSalao salaoId={id} />
    <div className="admin-header"><h1>Fotos do salão</h1><p>Mostre seu estabelecimento aos clientes.</p></div>
    {carregando && <p role="status">Carregando salões...</p>}
    {erro && <div role="alert" className="msg-erro">{erro}<button onClick={() => setTentativa(v => v + 1)}>Tentar novamente</button></div>}
    {!carregando && !erro && !saloes.length && <p>Cadastre um salão antes de enviar fotos.</p>}
    {saloes.length > 0 && <div className="form-group"><label htmlFor="salao-fotos">Salão</label>
      <select id="salao-fotos" value={id} onChange={e => setId(e.target.value)}>
        <option value="" disabled>Selecione um dos seus salões</option>
        {saloes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
      </select></div>}
    {id && <Galeria key={id} salaoId={id} />}
  </div></div>;
}
