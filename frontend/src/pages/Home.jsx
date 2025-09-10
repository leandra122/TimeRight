import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Bem-vinda ao La Belle Vie
              </h1>
              <p className="lead mb-4">
                Seu salão de beleza de confiança. Oferecemos os melhores tratamentos 
                de beleza com profissionais qualificados e produtos de alta qualidade.
              </p>
              <Button as={Link} to="/servicos" size="lg" variant="light">
                Conheça Nossos Serviços
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Preview */}
      <Container className="py-5">
        <Row>
          <Col lg={12} className="text-center mb-5">
            <h2>Nossos Serviços</h2>
            <p className="text-muted">Cuidamos da sua beleza com carinho e profissionalismo</p>
          </Col>
        </Row>
        
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h5>Cabelo</h5>
                <p>Cortes, coloração e tratamentos capilares</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h5>Estética</h5>
                <p>Tratamentos faciais e corporais</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h5>Unhas</h5>
                <p>Manicure e pedicure profissional</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home