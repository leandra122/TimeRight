import { useState, useEffect } from 'react';
import { servicesAPI } from '../api/services';
import { professionalsAPI } from '../api/professionals';
import { bookingsAPI } from '../api/bookings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    title: '', category: '', durationMin: '', price: '', description: ''
  });

  // Professional form state
  const [professionalForm, setProfessionalForm] = useState({
    name: '', categories: [], bio: '', photoUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes, professionalsRes] = await Promise.all([
        bookingsAPI.getAllBookings(),
        servicesAPI.getAll(),
        professionalsAPI.getAll()
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setProfessionals(professionalsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await servicesAPI.create(serviceForm);
      setServiceForm({ title: '', category: '', durationMin: '', price: '', description: '' });
      fetchData();
      alert('Serviço criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar serviço.');
    }
  };

  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();
    try {
      await professionalsAPI.create(professionalForm);
      setProfessionalForm({ name: '', categories: [], bio: '', photoUrl: '' });
      fetchData();
      alert('Profissional criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar profissional.');
    }
  };

  const exportBookings = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Horário,Cliente,Serviço,Profissional,Status\n"
      + bookings.map(b => 
          `${b.date},${b.timeStart},${b.user?.name},${b.service?.title},${b.professional?.name},${b.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agendamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Dashboard Administrativo
      </h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
        {[
          { key: 'bookings', label: 'Agendamentos' },
          { key: 'services', label: 'Serviços' },
          { key: 'professionals', label: 'Profissionais' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              backgroundColor: activeTab === tab.key ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--primary-color)',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Agendamentos</h2>
            <button onClick={exportBookings} className="btn btn-primary">
              Exportar CSV
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Data</th>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Horário</th>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Serviço</th>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Profissional</th>
                  <th style={{ padding: '1rem', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.date}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.timeStart}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.user?.name}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.service?.title}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.professional?.name}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Criar Novo Serviço</h2>
            <form onSubmit={handleServiceSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-input"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Manicure">Manicure</option>
                    <option value="Pedicure">Pedicure</option>
                    <option value="Alongamento">Alongamento</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Promoções">Promoções</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duração (min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={serviceForm.durationMin}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMin: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Criar Serviço</button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Serviços Existentes</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {services.map(service => (
                <div key={service.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                  <p><strong>R$ {service.price} - {service.durationMin} min</strong></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professionals Tab */}
      {activeTab === 'professionals' && (
        <div>
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Criar Novo Profissional</h2>
            <form onSubmit={handleProfessionalSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-input"
                    value={professionalForm.name}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL da Foto</label>
                  <input
                    type="url"
                    className="form-input"
                    value={professionalForm.photoUrl}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, photoUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Especialidades</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['Manicure', 'Pedicure', 'Alongamento', 'Skincare'].map(category => (
                    <label key={category} style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={professionalForm.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfessionalForm({
                              ...professionalForm,
                              categories: [...professionalForm.categories, category]
                            });
                          } else {
                            setProfessionalForm({
                              ...professionalForm,
                              categories: professionalForm.categories.filter(c => c !== category)
                            });
                          }
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={professionalForm.bio}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Criar Profissional</button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Profissionais Existentes</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {professionals.map(professional => (
                <div key={professional.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center' }}>
                  <img
                    src={professional.photoUrl || '/placeholder-avatar.jpg'}
                    alt={professional.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '1rem' }}
                  />
                  <div>
                    <h4>{professional.name}</h4>
                    <p>{professional.bio}</p>
                    <p><strong>Especialidades:</strong> {professional.categories.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;