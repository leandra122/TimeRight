import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular envio
    setTimeout(() => {
      setShowSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setLoading(false)
      
      setTimeout(() => setShowSuccess(false), 5000)
    }, 1000)
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-5">Entre em Contato</h1>
          
          {showSuccess && (
            <Alert variant="success">
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </Alert>
          )}
          
          <Row>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow h-100">
                <Card.Body className="p-4">
                  <h4 className="mb-3">Informações de Contato</h4>
                  
                  <div className="mb-3">
                    <h6>📍 Endereço</h6>
                    <p className="text-muted">Rua das Flores, 123<br/>Centro - São Paulo/SP</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>📞 Telefone</h6>
                    <p className="text-muted">(11) 99999-9999</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>📧 Email</h6>
                    <p className="text-muted">contato@timeright.com</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>🕒 Horário de Funcionamento</h6>
                    <p className="text-muted">
                      Segunda a Sexta: 9h às 19h<br/>
                      Sábado: 9h às 17h<br/>
                      Domingo: Fechado
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <h4 className="mb-3">Envie uma Mensagem</h4>
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
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
                      <Form.Label>Telefone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Mensagem</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default Contact