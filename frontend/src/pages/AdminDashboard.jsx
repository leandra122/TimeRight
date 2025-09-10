import { Container, Row, Col, Card } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'

const AdminDashboard = () => {
  const { user } = useAuth()

  return (
    <Container className="py-4">
      <Row>
        <Col lg={12}>
          <h1 className="mb-4">Dashboard Administrativo</h1>
          <p className="text-muted">Bem-vindo, {user?.name}!</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">15</h3>
              <p>Categorias</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">8</h3>
              <p>Profissionais</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">5</h3>
              <p>Promoções Ativas</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">42</h3>
              <p>Agendamentos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminDashboard