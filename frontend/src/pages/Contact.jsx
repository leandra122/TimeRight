import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'

const Contact = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-5">Entre em Contato</h1>
          
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h5>Informações de Contato</h5>
                  <p><strong>Endereço:</strong><br />
                  Rua das Flores, 123<br />
                  Centro - São Paulo/SP</p>
                  
                  <p><strong>Telefone:</strong><br />
                  (11) 9999-9999</p>
                  
                  <p><strong>Email:</strong><br />
                  contato@labellevie.com.br</p>
                  
                  <p><strong>Horário de Funcionamento:</strong><br />
                  Segunda a Sexta: 9h às 18h<br />
                  Sábado: 9h às 16h</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Envie uma Mensagem</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control type="text" required />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" required />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Telefone</Form.Label>
                      <Form.Control type="tel" />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Mensagem</Form.Label>
                      <Form.Control as="textarea" rows={4} required />
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" className="w-100">
                      Enviar Mensagem
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