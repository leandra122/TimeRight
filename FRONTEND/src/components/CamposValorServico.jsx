import React from 'react';

export default function CamposValorServico({ form, onChange, disabled = false }) {
  return <>
    <div className="form-group">
      <label htmlFor="servico-preco">Preço (R$)</label>
      <input id="servico-preco" name="preco" type="text" inputMode="decimal" placeholder="35,00" value={form.preco} onChange={onChange} required disabled={disabled} />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="servico-horas">Duração — Horas</label>
        <input id="servico-horas" name="horas" type="number" min="0" step="1" value={form.horas} onChange={onChange} required disabled={disabled} />
      </div>
      <div className="form-group">
        <label htmlFor="servico-minutos">Minutos (0 a 59)</label>
        <input id="servico-minutos" name="minutos" type="number" min="0" max="59" step="1" value={form.minutos} onChange={onChange} required disabled={disabled} />
      </div>
    </div>
  </>;
}
