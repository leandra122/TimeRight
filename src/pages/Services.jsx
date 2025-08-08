import { useState, useEffect } from 'react';
import { servicesAPI } from '../api/services';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Manicure', 'Pedicure', 'Alongamento', 'Skincare', 'Promoções'];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === selectedCategory));
    }
  }, [services, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Nossos Serviços
      </h1>

      {/* Category Filter */}
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

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredServices.map(service => (
          <div key={service.id} className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
              {service.title}
            </h3>
            <p style={{ marginBottom: '1rem' }}>{service.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                R$ {service.price}
              </span>
              <span style={{ color: '#666' }}>
                {service.durationMin} min
              </span>
            </div>
          </div>
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