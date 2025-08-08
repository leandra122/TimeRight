// Página inicial - landing page com hero section e cards interativos de serviços
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  // Serviços em destaque para a home
  const featuredServices = [
    {
      id: 1,
      title: 'Manicure Simples',
      price: '35,00',
      description: 'Cuidados completos para suas unhas das mãos com esmaltação tradicional',
      category: 'Manicure',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Pedicure',
      price: '40,00',
      description: 'Relaxamento e beleza para seus pés com tratamento completo',
      category: 'Pedicure',
      image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Alongamento de Unha',
      price: '120,00',
      description: 'Unhas perfeitas e duradouras com técnicas modernas de alongamento',
      category: 'Alongamento',
      image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Promoção: Mão + Pé',
      price: '65,00',
      description: 'Combo especial: manicure + pedicure com desconto exclusivo',
      category: 'Promoções',
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div>
      {/* Seção hero - destaque principal da página */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a3a5c 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          {/* Título principal */}
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
            La Belle Vie
          </h1>
          {/* Subtítulo descritivo */}
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            Seu salão de beleza premium. Cuidados especializados para suas mãos e pés.
          </p>
          {/* Botão CTA principal */}
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

      {/* Seção de cards interativos de serviços */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>
            Nossos Serviços
          </h2>
          {/* Grid de cards de serviços */}
          <div className="services-grid">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção CTA secundária */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Pronta para se cuidar?
          </h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            Agende seu horário com nossos profissionais especializados
          </p>
          {/* Botão CTA secundário */}
          <Link to="/agendamento" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
            Fazer Agendamento
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;