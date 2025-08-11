import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>
        Contato
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Contact Form */}
        <div className="card">
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Entre em Contato
          </h2>
          
          {submitted && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius)',
              marginBottom: '1rem'
            }}>
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mensagem</label>
              <textarea
                className="form-input"
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Enviar Mensagem
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div>
          <div className="card">
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
              Informações de Contato
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary-color)' }}>Endereço</h4>
              <p>Rua das Flores, 123<br />Centro - São Paulo/SP<br />CEP: 01234-567</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary-color)' }}>Telefone</h4>
              <p>(11) 1234-5678</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary-color)' }}>WhatsApp</h4>
              <p>(11) 99999-9999</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary-color)' }}>Email</h4>
              <p>contato@labellevie.com.br</p>
            </div>

            <div>
              <h4 style={{ color: 'var(--primary-color)' }}>Horário de Funcionamento</h4>
              <p>
                Segunda a Sexta: 9h às 19h<br />
                Sábado: 9h às 17h<br />
                Domingo: Fechado
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Contact;