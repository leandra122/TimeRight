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
      fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8dGV4dCB4PSI5NjAiIHk9IjU0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VGltZVJpZ2h0IFDDoWdpbmEgMDE8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIwIiB5Mj0iMTA4MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZCNkMxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzhBMkJFMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
      alt: 'Página 01 do TimeRight - Apresentação do sistema'
    },
    {
      fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8dGV4dCB4PSI5NjAiIHk9IjU0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VGltZVJpZ2h0IFDDoWdpbmEgMDI8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIwIiB5Mj0iMTA4MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjOEEyQkUyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0FFQzZDRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
      alt: 'Página 02 do TimeRight - Funcionalidades principais'
    },
    {
      fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8dGV4dCB4PSI5NjAiIHk9IjU0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VGltZVJpZ2h0IFDDoWdpbmEgMDY8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIwIiB5Mj0iMTA4MCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQUVDNkNGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGQjZDMSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
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
                  backgroundImage: `url(${image.fallback})`,
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