import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../api/services';
import { professionalsAPI } from '../api/professionals';
import { bookingsAPI } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchProfessionals();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      fetchAvailability();
    }
  }, [selectedProfessional, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const response = await professionalsAPI.getAll(selectedService.category);
      setProfessionals(response.data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await professionalsAPI.getAvailability(selectedProfessional.id, selectedDate);
      setAvailability(response.data);
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await bookingsAPI.create({
        userId: user.id,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        date: selectedDate,
        time: selectedTime
      });
      alert('Agendamento realizado com sucesso!');
      navigate('/perfil');
    } catch (error) {
      alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
        Agendamento
      </h1>

      {/* Progress Bar */}
      <div style={{ display: 'flex', marginBottom: '3rem', justifyContent: 'center' }}>
        {[1, 2, 3, 4].map(num => (
          <div
            key={num}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: step >= num ? 'var(--primary-color)' : '#ddd',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 10px'
            }}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Escolha o Serviço</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {services.map(service => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                style={{
                  padding: '1rem',
                  border: selectedService?.id === service.id ? '2px solid var(--primary-color)' : '1px solid #ddd',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer'
                }}
              >
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <p><strong>R$ {service.price} - {service.durationMin} min</strong></p>
              </div>
            ))}
          </div>
          {selectedService && (
            <button onClick={nextStep} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Próximo
            </button>
          )}
        </div>
      )}

      {/* Step 2: Select Professional */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Escolha o Profissional</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {professionals.map(professional => (
              <div
                key={professional.id}
                onClick={() => setSelectedProfessional(professional)}
                style={{
                  padding: '1rem',
                  border: selectedProfessional?.id === professional.id ? '2px solid var(--primary-color)' : '1px solid #ddd',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <img
                  src={professional.photoUrl || '/placeholder-avatar.jpg'}
                  alt={professional.name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '1rem' }}
                />
                <div>
                  <h4>{professional.name}</h4>
                  <p>{professional.bio}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={prevStep} className="btn" style={{ flex: 1, backgroundColor: '#ddd' }}>
              Voltar
            </button>
            {selectedProfessional && (
              <button onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>
                Próximo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select Date and Time */}
      {step === 3 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Escolha Data e Horário</h3>
          
          <div className="form-group">
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={dayjs().format('YYYY-MM-DD')}
            />
          </div>

          {selectedDate && availability.length > 0 && (
            <div>
              <label className="form-label">Horário Disponível</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {availability.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '8px',
                      border: selectedTime === time ? '2px solid var(--primary-color)' : '1px solid #ddd',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: selectedTime === time ? 'var(--primary-color)' : 'white',
                      color: selectedTime === time ? 'white' : 'black',
                      cursor: 'pointer'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={prevStep} className="btn" style={{ flex: 1, backgroundColor: '#ddd' }}>
              Voltar
            </button>
            {selectedDate && selectedTime && (
              <button onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>
                Próximo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Confirmação</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Serviço:</strong> {selectedService?.title}</p>
            <p><strong>Profissional:</strong> {selectedProfessional?.name}</p>
            <p><strong>Data:</strong> {dayjs(selectedDate).format('DD/MM/YYYY')}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Valor:</strong> R$ {selectedService?.price}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={prevStep} className="btn" style={{ flex: 1, backgroundColor: '#ddd' }}>
              Voltar
            </button>
            <button 
              onClick={handleBooking} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;