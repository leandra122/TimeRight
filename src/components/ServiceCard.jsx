// Componente de card de serviço - exibe informações e botão de agendamento
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  return (
    <div className="service-card">
      {/* Badge de promoção */}
      {service.category === 'Promoções' && (
        <div className="promotion-badge">Promoção</div>
      )}
      
      {/* Imagem do serviço */}
      <div className="service-image">
        <img 
          src={service.image || '/placeholder-service.jpg'} 
          alt={service.title}
        />
      </div>
      
      {/* Conteúdo do card */}
      <div className="service-content">
        <h3>{service.title}</h3>
        <p className="service-price">R$ {service.price}</p>
        <p className="service-description">
          {service.description.length > 100 
            ? service.description.substring(0, 100) + '...' 
            : service.description}
        </p>
        <Link 
          to={`/agendamento?service=${service.id}`} 
          className="btn btn-primary service-btn"
        >
          Agendar
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;