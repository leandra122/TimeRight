import { useState, useEffect } from 'react';
import { servicesAPI } from '../api/services';
import ServiceCard from '../components/ServiceCard';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Manicure', 'Pedicure', 'Alongamento', 'Skincare', 'Promoções'];

  // Serviços mockados com dados completos
  const mockServices = [
    {
      id: 1,
      title: 'Manicure Simples',
      price: '35,00',
      description: 'Cuidados completos para suas unhas das mãos com esmaltação tradicional',
      category: 'Manicure',
      durationMin: 60,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Pedicure',
      price: '40,00',
      description: 'Relaxamento e beleza para seus pés com tratamento completo e hidratação',
      category: 'Pedicure',
      durationMin: 90,
      image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Alongamento de Unha',
      price: '120,00',
      description: 'Unhas perfeitas e duradouras com técnicas modernas de alongamento em gel',
      category: 'Alongamento',
      durationMin: 120,
      image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Skincare para Pés',
      price: '60,00',
      description: 'Tratamento especializado para hidratação e rejuvenescimento da pele dos pés',
      category: 'Skincare',
      durationMin: 45,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Skincare para Mãos',
      price: '60,00',
      description: 'Tratamento hidratante e rejuvenescedor para as mãos com produtos premium',
      category: 'Skincare',
      durationMin: 45,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Promoção: Mão + Pé',
      price: '65,00',
      description: 'Combo especial: manicure completa + pedicure com desconto exclusivo',
      category: 'Promoções',
      durationMin: 150,
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'
    }
  ];

  useEffect(() => {
    // Simula carregamento da API
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === selectedCategory));
    }
  }, [services, selectedCategory]);

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Nossos Serviços
      </h1>

      {/* Filtros de categoria */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              margin: '0 0.5rem',
              padding: '8px 16px',
              border: '1px solid var(--primary-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: selectedCategory === category ? 'var(--primary-color)' : 'white',
              color: selectedCategory === category ? 'white' : 'var(--primary-color)',
              cursor: 'pointer'
            }}
          >
            {category === 'all' ? 'Todos' : category}
          </button>
        ))}
      </div>

      {/* Grid de cards de serviços */}
      <div className="services-grid">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Nenhum serviço encontrado nesta categoria.
        </p>
      )}
    </div>
  );
};

export default Services;