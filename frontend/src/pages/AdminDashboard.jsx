import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'
import { dashboardAPI } from '../api/client'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProfessionals: 0,
    activeCategories: 0,
    activeProfessionals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

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
              <h3 className="text-primary">{stats.totalCategories}</h3>
              <p className="text-muted">Categorias</p>
              <small className="text-success">{stats.activeCategories} ativas</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.totalProfessionals}</h3>
              <p className="text-muted">Profissionais</p>
              <small className="text-success">{stats.activeProfessionals} ativos</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">8</h3>
              <p className="text-muted">Promoções</p>
              <small className="text-success">6 ativas</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">45</h3>
              <p className="text-muted">Agendamentos</p>
              <small className="text-success">12 hoje</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminDashboard