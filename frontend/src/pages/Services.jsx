import { Container, Row, Col, Card } from 'react-bootstrap'

const Services = () => {
  const services = [
    { name: 'Corte de Cabelo', description: 'Cortes modernos e clássicos' },
    { name: 'Coloração', description: 'Coloração profissional' },
    { name: 'Tratamentos Capilares', description: 'Hidratação e reconstrução' },
    { name: 'Manicure', description: 'Cuidados com as unhas das mãos' },
    { name: 'Pedicure', description: 'Cuidados com as unhas dos pés' },
    { name: 'Limpeza de Pele', description: 'Tratamentos faciais' }
  ]

  return (
    <Container className="py-5">
      <Row>
        <Col lg={12} className="text-center mb-5">
          <h1>Nossos Serviços</h1>
          <p className="text-muted">Conheça todos os nossos tratamentos de beleza</p>
        </Col>
      </Row>
      
      <Row>
        {services.map((service, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{service.name}</Card.Title>
                <Card.Text>{service.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Services