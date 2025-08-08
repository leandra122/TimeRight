// Página inicial premium - hero section elegante e seções de destaque
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  // Serviços em destaque
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
    }
  ];

  // Profissionais em destaque
  const topProfessionals = [
    {
      id: 1,
      name: 'Ana Costa',
      specialty: 'Especialista em manicure artística',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Carla Santos',
      specialty: 'Expert em cuidados para os pés',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Juliana Lima',
      specialty: 'Mestre em alongamento de unhas',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  ];

  // Promoções atuais
  const currentPromotions = [
    {
      id: 6,
      title: 'Combo Mão + Pé',
      price: '65,00',
      originalPrice: '75,00',
      description: 'Manicure + Pedicure com desconto especial',
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div>
      {/* Hero Section Premium */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Sua beleza, nosso compromisso</h1>
            <p>Agende seu horário com os melhores profissionais e viva uma nova experiência</p>
            <Link to="/agendamento" className="cta-button">
              Agende Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Serviços */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)', fontSize: '2.5rem' }}>
            Nossos Serviços
          </h2>
          <div className="services-grid">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Profissionais em Destaque */}
      <section className="highlights-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)', fontSize: '2.5rem' }}>
            Nossos Especialistas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {topProfessionals.map(professional => (
              <div key={professional.id} className="professional-highlight">
                <img src={professional.image} alt={professional.name} />
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {professional.name}
                </h3>
                <div className="stars">
                  {'★'.repeat(professional.rating)}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {professional.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Promoções */}
      <section className="promotions-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Promoções Especiais
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {currentPromotions.map(promo => (
              <div key={promo.id} className="promotion-card">
                <div className="promotion-badge-large">PROMOÇÃO</div>
                <img 
                  src={promo.image} 
                  alt={promo.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  {promo.title}
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                    R$ {promo.price}
                  </span>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '0.5rem' }}>
                    R$ {promo.originalPrice}
                  </span>
                </div>
                <p style={{ marginBottom: '1.5rem' }}>{promo.description}</p>
                <Link to={`/agendamento?service=${promo.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  Aproveitar Oferta
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;