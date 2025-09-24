import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AdminNavbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <BSNavbar expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/admin/dashboard">
          TimeRight Admin
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="admin-navbar-nav" />
        
        <BSNavbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/dashboard">
              <i className="fas fa-tachometer-alt nav-icon"></i>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/categorias">
              <i className="fas fa-tags nav-icon"></i>
              Categorias
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/profissionais">
              <i className="fas fa-users nav-icon"></i>
              Profissionais
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/promocoes">
              <i className="fas fa-percent nav-icon"></i>
              Promoções
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/agendas">
              <i className="fas fa-calendar nav-icon"></i>
              Agendas
            </Nav.Link>
          </Nav>
          
          <Nav className="align-items-center">
            {user && (
              <>
                <span className="text-white me-3">👨‍💼 {user.name}</span>
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

export default AdminNavbar