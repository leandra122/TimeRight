import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a3a5c 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
            La Belle Vie
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            Seu salão de beleza premium. Cuidados especializados para suas mãos e pés.
          </p>
          <Link to="/agendamento" className="btn btn-primary" style={{ 
            fontSize: '1.1rem', 
            padding: '16px 32px',
            backgroundColor: 'white',
            color: 'var(--primary-color)'
          }}>
            Agende Agora
          </Link>
        </div>
      </section>

      {/* Services Preview */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>
            Nossos Serviços
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Manicure', desc: 'Cuidados completos para suas unhas' },
              { title: 'Pedicure', desc: 'Relaxamento e beleza para seus pés' },
              { title: 'Alongamento', desc: 'Unhas perfeitas e duradouras' },
              { title: 'Skincare', desc: 'Tratamentos para mãos e pés' }
            ].map((service, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Pronta para se cuidar?
          </h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            Agende seu horário com nossos profissionais especializados
          </p>
          <Link to="/agendamento" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
            Fazer Agendamento
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;