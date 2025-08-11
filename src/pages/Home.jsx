// Página inicial premium - hero section elegante
import { Link } from 'react-router-dom';

const Home = () => {

  return (
    <div>
      {/* Hero Section Premium */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Seu tempo, nossa prioridade</h1>
            <p>Agende seu horário com os melhores profissionais e viva uma nova experiência</p>
            <Link to="/agendamento" className="cta-button">
              Agende Agora
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;