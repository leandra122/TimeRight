import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

const ClientNavbar = () => {
  const navigate = useNavigate()
  const clientData = JSON.parse(localStorage.getItem('clientData') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('clientToken')
    localStorage.removeItem('clientData')
    navigate('/cliente/login')
  }

  return (
    <BSNavbar expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/cliente/dashboard">
          TimeRight Cliente
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="client-navbar-nav" />
        
        <BSNavbar.Collapse id="client-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/cliente/dashboard">
              <i className="fas fa-home nav-icon"></i>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/cliente/agendamentos">
              <i className="fas fa-calendar nav-icon"></i>
              Meus Agendamentos
            </Nav.Link>
            <Nav.Link as={Link} to="/cliente/perfil">
              <i className="fas fa-user nav-icon"></i>
              Meu Perfil
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              <i className="fas fa-arrow-left nav-icon"></i>
              Voltar ao Site
            </Nav.Link>
          </Nav>
          
          <Nav className="align-items-center">
            {clientData.name && (
              <>
                <span className="text-white me-3">👤 {clientData.name}</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Sair
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default ClientNavbar