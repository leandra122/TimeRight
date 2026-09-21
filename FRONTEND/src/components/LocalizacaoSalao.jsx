import React, { useState } from 'react';
import { atualizarSalao } from '../service/api';

const fields = { logradouro: 'Rua', numero: 'Número', bairro: 'Bairro', cidade: 'Cidade', uf: 'UF', cep: 'CEP' };

export default function LocalizacaoSalao({ salao, onSalvo }) {
  const [form, setForm] = useState(salao);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = Object.fromEntries(Object.keys(fields).map(key => [key, (form[key] || '').trim()]));
    payload.endereco = Object.values(payload).filter(Boolean).join(', ');
    try {
      const { data } = await atualizarSalao(salao.id, payload);
      onSalvo(data);
      setEditing(false);
    } catch { setError('Não foi possível salvar o endereço.'); }
    finally { setSaving(false); }
  }

  return <section className="card admin-card" style={{ marginBottom: 24 }}>
    <h2>Endereço de {salao.nome}</h2>
    <p>{salao.endereco || 'Endereço não cadastrado'}</p>
    <button className="btn-secondary" onClick={() => { setForm(salao); setEditing(!editing); }}>Editar endereço</button>
    {editing && <form onSubmit={save} className="salao-form">
      <div className="form-row" style={{ flexWrap: 'wrap' }}>{Object.entries(fields).map(([key, label]) => <div className="form-group" key={key}>
        <label htmlFor={`map-${key}`}>{label}</label>
        <input id={`map-${key}`} value={form[key] || ''} disabled={saving} maxLength={key === 'uf' ? 2 : key === 'cep' ? 9 : key === 'numero' ? 20 : 100} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      </div>)}</div>
      {error && <p role="alert">{error}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar endereço'}</button>
    </form>}
  </section>;
}
