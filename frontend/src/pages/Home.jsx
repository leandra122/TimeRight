import { Container, Row, Col, Button, Carousel } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Home.css'

const Home = () => {
  const [index, setIndex] = useState(0)

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  const carouselImages = [
    {
      src: '/images/1.png',
      alt: 'Página 01 do TimeRight - Apresentação do sistema'
    },
    {
      src: '/images/2-1.png',
      alt: 'Página 02 do TimeRight - Funcionalidades principais'
    },
    {
      src: '/images/3-1.png',
      alt: 'Página 06 do TimeRight - Interface do usuário'
    }
  ]

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="hero-carousel-section position-relative">
        <Carousel 
          activeIndex={index} 
          onSelect={handleSelect} 
          controls={false} 
          indicators={true}
          interval={5000}
          className="hero-carousel"
          slide={true}
        >
          {carouselImages.map((image, idx) => (
            <Carousel.Item key={idx}>
              <div 
                className="carousel-image"
                style={{
                  backgroundImage: `url(${image.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '100vh',
                  width: '100%',
                  position: 'relative'
                }}
              >
                <div className="carousel-overlay"></div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        
        <div className="hero-content-overlay">
          <Container>
            <Row className="align-items-center justify-content-center text-center">
              <Col lg={10}>
                <div className="welcome-animation">
                  <h1 className="hero-title animated-title">
                    Sua beleza, nosso compromisso
                  </h1>
                  <p className="hero-subtitle animated-subtitle">
                    Agende seu horário com os melhores profissionais e viva uma nova experiência
                  </p>
                  <div className="hero-buttons mt-4">
                    <Button 
                      as={Link} 
                      to="/sobre" 
                      variant="primary" 
                      size="lg" 
                      className="me-3 mb-2"
                    >
                      Conheça Nossa Missão
                    </Button>
                    <Button 
                      as={Link} 
                      to="/servicos" 
                      variant="outline-light" 
                      size="lg" 
                      className="mb-2"
                    >
                      Nossos Serviços
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="feature-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="mb-3" style={{fontWeight: 600, color: 'var(--text-dark)'}}>Por que escolher o Time Right?</h2>
              <p className="lead" style={{color: 'var(--dark-gray)', fontSize: '1.1rem'}}>Praticidade, eficiência e agendamento inteligente para seu tempo</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop&crop=center" 
                       alt="Profissionais Qualificados" />
                </div>
                <h4>Profissionais Qualificados</h4>
                <p>Rede de profissionais especializados em diversas áreas</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&crop=center" 
                       alt="Ambiente Moderno" />
                </div>
                <h4>Plataforma Moderna</h4>
                <p>Interface intuitiva e tecnologia avançada para sua comodidade</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=100&h=100&fit=crop&crop=center" 
                       alt="Agendamento Fácil" />
                </div>
                <h4>Agendamento Inteligente</h4>
                <p>Sistema online prático para agendar seus horários quando quiser</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  )
}

export default Home