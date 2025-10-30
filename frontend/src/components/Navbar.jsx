import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <BSNavbar expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          TimeRight
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <i className="fas fa-home nav-icon"></i>
              Início
            </Nav.Link>
            <Nav.Link as={Link} to="/sobre">
              <i className="fas fa-star nav-icon"></i>
              Benefícios
            </Nav.Link>
            <Nav.Link as={Link} to="/servicos">
              <i className="fas fa-concierge-bell nav-icon"></i>
              Serviços
            </Nav.Link>
            <Nav.Link as={Link} to="/profissionais">
              <i className="fas fa-images nav-icon"></i>
              Galeria
            </Nav.Link>
            <Nav.Link as={Link} to="/contato">
              <i className="fas fa-envelope nav-icon"></i>
              Contato
            </Nav.Link>
          </Nav>
          
          <Nav className="align-items-center">
            {user ? (
              <>
                <span className="text-white me-3">Olá, {user.name}</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/admin-login" variant="outline-light" size="sm" className="me-2">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Entrar
                </Button>
                <Button as={Link} to="/cliente/cadastro" className="btn-cta">
                  Cadastre-se
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar