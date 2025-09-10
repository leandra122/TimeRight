import { Container, Row, Col, Card } from 'react-bootstrap'

const Professionals = () => {
  const professionals = [
    { name: 'Maria Silva', specialty: 'Cabeleireira e Colorista' },
    { name: 'Ana Costa', specialty: 'Esteticista Facial' },
    { name: 'João Santos', specialty: 'Barbeiro' }
  ]

  return (
    <Container className="py-5">
      <Row>
        <Col lg={12} className="text-center mb-5">
          <h1>Nossos Profissionais</h1>
          <p className="text-muted">Conheça nossa equipe especializada</p>
        </Col>
      </Row>
      
      <Row>
        {professionals.map((professional, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <Card.Title>{professional.name}</Card.Title>
                <Card.Text>{professional.specialty}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Professionals