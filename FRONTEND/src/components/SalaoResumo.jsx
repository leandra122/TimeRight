import React, { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { api } from '../service/api';

export const enderecoResumido = salao => [
  [salao.logradouro, salao.numero].filter(Boolean).join(', '),
  salao.bairro,
  [salao.cidade, salao.uf].filter(Boolean).join(' - '),
].filter(Boolean).join(' · ') || salao.endereco || 'Endereço não informado';

export function StatusSalao({ status }) {
  const nomes = { ATIVO: 'Ativo', INATIVO: 'Inativo' };
  return <span className={`saloes-status ${status === 'ATIVO' ? 'saloes-status--ativo' : ''}`}>
    <span aria-hidden="true" />{nomes[status] || status || 'Status não informado'}
  </span>;
}

export function FotoPrincipalSalao({ salao }) {
  const [foto, setFoto] = useState(null);
  const [estado, setEstado] = useState('carregando');
  useEffect(() => {
    let ativo = true;
    setFoto(null);
    setEstado('carregando');
    api.get(`/saloes/${salao.id}/fotos`).then(({ data }) => {
      if (!ativo) return;
      const principal = data.find(item => item.principal);
      const base = new URL(api.defaults.baseURL, window.location.origin);
      setFoto(principal?.url ? new URL(principal.url, base).href : null);
      setEstado(principal?.url ? 'pronto' : 'vazio');
    }).catch(() => { if (ativo) setEstado('erro'); });
    return () => { ativo = false; };
  }, [salao.id]);

  return <div className="saloes-foto">
    {foto && estado === 'pronto'
      ? <img src={foto} alt={`Foto principal de ${salao.nome}`} loading="lazy" onError={() => setEstado('erro')} />
      : <div className="saloes-foto-vazia"><Store size={36} strokeWidth={1.4} aria-hidden="true" />
        <span>{estado === 'carregando' ? 'Carregando foto…' : estado === 'erro' ? 'Foto indisponível' : 'Sem foto principal'}</span>
      </div>}
  </div>;
}
