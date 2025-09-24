import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const LoginChoice = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-5">
            <h1 className="mb-3">🔐 Área de Login</h1>
            <p className="lead">Escolha como deseja acessar o TimeRight</p>
          </div>
          
          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-lg border-0 text-center login-choice-card">
                <Card.Body className="d-flex flex-column justify-content-center" style={{padding: '40px'}}>
                  <div className="mb-4">
                    <i className="fas fa-user fa-4x" style={{color: '#FFB6C1'}}></i>
                  </div>
                  <h4 className="mb-3">Cliente</h4>
                  <p className="text-muted mb-4">
                    Acesse sua conta para agendar serviços, ver histórico e gerenciar seu perfil
                  </p>
                  <div className="mt-auto">
                    <Button 
                      as={Link} 
                      to="/cliente/login" 
                      variant="primary" 
                      size="lg" 
                      className="w-100 mb-2"
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Login Cliente
                    </Button>
                    <small className="text-muted">
                      Não tem conta? <Link to="/cliente/cadastro">Cadastre-se</Link>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-lg border-0 text-center login-choice-card">
                <Card.Body className="d-flex flex-column justify-content-center" style={{padding: '40px'}}>
                  <div className="mb-4">
                    <i className="fas fa-user-shield fa-4x" style={{color: '#8A2BE2'}}></i>
                  </div>
                  <h4 className="mb-3">Administrador</h4>
                  <p className="text-muted mb-4">
                    Acesse o painel administrativo para gerenciar serviços, profissionais e agendamentos
                  </p>
                  <div className="mt-auto">
                    <Button 
                      as={Link} 
                      to="/admin/login" 
                      variant="secondary" 
                      size="lg" 
                      className="w-100 mb-2"
                      style={{background: 'linear-gradient(135deg, #8A2BE2, #AEC6CF)', border: 'none', color: 'white'}}
                    >
                      <i className="fas fa-shield-alt me-2"></i>
                      Login Admin
                    </Button>
                    <small className="text-muted">
                      Acesso restrito
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="text-center mt-4">
            <Link to="/" className="text-decoration-none">
              <i className="fas fa-arrow-left me-2"></i>
              Voltar ao Site
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginChoice