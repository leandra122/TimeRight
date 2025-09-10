import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookingsAPI } from '../api/bookings';
import dayjs from 'dayjs';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getUserBookings(user.id);
      setBookings(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await bookingsAPI.cancel(bookingId);
        fetchBookings(); // Refresh the list
        alert('Agendamento cancelado com sucesso!');
      } catch (error) {
        alert('Erro ao cancelar agendamento.');
      }
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>
        Meu Perfil
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* User Info */}
        <div className="card">
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Dados Pessoais
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Nome:</strong> {user?.name}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Email:</strong> {user?.email}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Telefone:</strong> {user?.phone}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Editar Dados
          </button>
        </div>

        {/* Bookings History */}
        <div className="card">
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Histórico de Agendamentos
          </h2>
          
          {bookings.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              Você ainda não possui agendamentos.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                        {booking.service?.title}
                      </h4>
                      <p><strong>Profissional:</strong> {booking.professional?.name}</p>
                      <p><strong>Data:</strong> {dayjs(booking.date).format('DD/MM/YYYY')}</p>
                      <p><strong>Horário:</strong> {booking.timeStart}</p>
                      <p><strong>Status:</strong> 
                        <span style={{
                          color: booking.status === 'confirmed' ? 'green' : 
                                booking.status === 'cancelled' ? 'red' : 'orange',
                          marginLeft: '0.5rem'
                        }}>
                          {booking.status === 'confirmed' ? 'Confirmado' :
                           booking.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </p>
                    </div>
                    
                    {booking.status === 'confirmed' && dayjs(booking.date).isAfter(dayjs()) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 'var(--border-radius)',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;