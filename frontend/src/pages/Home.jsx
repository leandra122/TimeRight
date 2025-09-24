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
      src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
      alt: 'Horta urbana sustentável'
    },
    {
      src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=600&fit=crop',
      alt: 'Cultivo de vegetais frescos'
    },
    {
      src: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=1200&h=600&fit=crop',
      alt: 'Agricultura urbana moderna'
    }
  ]

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="hero-carousel-section position-relative">
        <Carousel 
          activeIndex={index} 
          onSelect={handleSelect} 
          fade 
          controls={false} 
          indicators={false}
          interval={5000}
          className="hero-carousel"
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
                    Seja bem-vindo ao Alimentando o Futuro
                  </h1>
                  <p className="hero-subtitle animated-subtitle">
                    Cultive sua própria alimentação saudável e sustentável
                  </p>
                  <div className="hero-buttons mt-4">
                    <Button 
                      as={Link} 
                      to="/sobre" 
                      variant="success" 
                      size="lg" 
                      className="me-3 mb-2"
                    >
                      Conheça Nossa Missão
                    </Button>
                    <Button 
                      as={Link} 
                      to="/suporte" 
                      variant="outline-light" 
                      size="lg" 
                      className="mb-2"
                    >
                      Precisa de Ajuda?
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2>Por que escolher o Alimentando o Futuro?</h2>
              <p className="lead">Soluções práticas para uma vida mais saudável e sustentável</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="feature-icon mb-3">
                  <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=100&h=100&fit=crop&crop=center" 
                       alt="Educação" className="rounded-circle" width="80" height="80" />
                </div>
                <h4>Educação Prática</h4>
                <p>Aprenda técnicas de cultivo em pequenos espaços com tutoriais detalhados</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="feature-icon mb-3">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center" 
                       alt="Sustentabilidade" className="rounded-circle" width="80" height="80" />
                </div>
                <h4>Sustentabilidade</h4>
                <p>Promovemos práticas ecológicas e reaproveitamento de recursos</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="text-center">
                <div className="feature-icon mb-3">
                  <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop&crop=center" 
                       alt="Saúde" className="rounded-circle" width="80" height="80" />
                </div>
                <h4>Alimentação Saudável</h4>
                <p>Acesso a alimentos frescos e nutritivos cultivados por você mesmo</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  )
}

export default Home