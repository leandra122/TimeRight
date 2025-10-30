import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        })
      })

      if (!response.ok) {
        throw new Error('Email ou senha inválidos')
      }

      const userData = await response.json()
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      navigate('/admin-dashboard')
    } catch (error) {
      setError(error.message || 'Erro no login')
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Login Administrativo</h3>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                {user ? (
                  <div className="text-center">
                    <p className="mb-3">Bem-vindo, {user.nome}!</p>
                    <Button 
                      variant="secondary" 
                      className="w-100"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                )}
              </Form>
              
              {!user && (
                <>
                  <div className="text-center mt-3">
                    <Link to="/forgot-password" className="text-decoration-none">
                      🔐 Esqueceu sua senha?
                    </Link>
                  </div>
                  
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Credenciais: admin@timeright.com / admin123
                    </small>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminLogin