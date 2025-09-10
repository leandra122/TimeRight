import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="hero-content">
          <Row className="align-items-center min-vh-100">
            <Col lg={8} className="text-center text-lg-start">
              <h1 className="hero-title">
                Sua beleza, nosso compromisso
              </h1>
              <p className="hero-subtitle">
                Agende seu horário com os melhores profissionais e viva uma nova experiência
              </p>
              <Button className="cta-button" size="lg">
                Agende Agora
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  )
}

export default Home