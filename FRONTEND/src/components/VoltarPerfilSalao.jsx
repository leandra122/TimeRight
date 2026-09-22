import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function VoltarPerfilSalao({ salaoId }) {
  return <Link className="btn-secondary" style={{ marginBottom: 24 }} to={salaoId ? `/manager/saloes/${salaoId}` : '/manager/saloes'}>
    <ArrowLeft size={16} />{salaoId ? 'Voltar ao perfil do salão' : 'Meus salões'}
  </Link>;
}
