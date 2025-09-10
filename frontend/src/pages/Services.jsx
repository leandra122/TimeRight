import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { categoriesAPI } from '../api/client'

const Services = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data.categories || [])
    } catch (error) {
      setError('Erro ao carregar serviços')
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
          <h1>Nossos Serviços</h1>
          <p className="lead">Oferecemos uma ampla gama de serviços de beleza</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {categories.map(category => (
          <Col md={6} lg={4} key={category.id} className="mb-4">
            <Card className="h-100 border-0 shadow">
              <Card.Body className="text-center p-4">
                <div className="service-icon mb-3" style={{fontSize: '3rem'}}>💄</div>
                <h5>{category.name}</h5>
                <p className="text-muted">{category.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {categories.length === 0 && !loading && (
        <Row>
          <Col className="text-center">
            <p className="text-muted">Nenhum serviço cadastrado ainda.</p>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Services