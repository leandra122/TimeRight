import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { professionalsAPI } from '../api/client'

const Professionals = () => {
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const response = await professionalsAPI.getAll()
      setProfessionals(response.data.professionals || [])
    } catch (error) {
      setError('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={12} className="text-center mb-5">
          <h1>Nossa Equipe</h1>
          <p className="lead">Profissionais qualificados e experientes</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {professionals.map(professional => (
          <Col md={6} lg={4} key={professional.id} className="mb-4">
            <Card className="h-100 border-0 shadow">
              <Card.Body className="text-center p-4">
                <div className="professional-avatar mb-3" style={{fontSize: '4rem'}}>👩‍💼</div>
                <h5>{professional.name}</h5>
                <p className="text-muted">{professional.specialty}</p>
                <div className="rating mb-2" style={{color: '#ffc107'}}>
                  ⭐⭐⭐⭐⭐
                </div>
                {professional.phone && (
                  <p><small>📞 {professional.phone}</small></p>
                )}
                {professional.email && (
                  <p><small>📧 {professional.email}</small></p>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {professionals.length === 0 && !loading && (
        <Row>
          <Col className="text-center">
            <p className="text-muted">Nenhum profissional cadastrado ainda.</p>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Professionals