import { useState, useEffect } from 'react';
import { professionalsAPI } from '../api/professionals';

const Professionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Manicure', 'Pedicure', 'Alongamento', 'Skincare'];

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProfessionals(professionals);
    } else {
      setFilteredProfessionals(
        professionals.filter(prof => prof.categories.includes(selectedCategory))
      );
    }
  }, [professionals, selectedCategory]);

  const fetchProfessionals = async () => {
    try {
      const response = await professionalsAPI.getAll();
      setProfessionals(response.data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Nossos Profissionais
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

      {/* Professionals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredProfessionals.map(professional => (
          <div key={professional.id} className="card" style={{ textAlign: 'center' }}>
            <img
              src={professional.photoUrl || '/placeholder-avatar.jpg'}
              alt={professional.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '0 auto 1rem'
              }}
            />
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              {professional.name}
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              {professional.categories.map(category => (
                <span
                  key={category}
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    margin: '2px'
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
            <p style={{ color: '#666', marginBottom: '1rem' }}>{professional.bio}</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: '#ffa500' }}>★★★★★</span>
              <span style={{ marginLeft: '0.5rem', color: '#666' }}>5.0</span>
            </div>
          </div>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Nenhum profissional encontrado nesta categoria.
        </p>
      )}
    </div>
  );
};

export default Professionals;