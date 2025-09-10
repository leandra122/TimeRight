import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap'
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
    <BSNavbar style={{background: 'linear-gradient(90deg, #fef0ef, #bee2ff)'}} expand="lg" className="shadow-sm">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          La Belle Vie
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/sobre">Sobre</Nav.Link>
            <Nav.Link as={Link} to="/servicos">Serviços</Nav.Link>
            <Nav.Link as={Link} to="/profissionais">Profissionais</Nav.Link>
            <Nav.Link as={Link} to="/contato">Contato</Nav.Link>
          </Nav>
          
          <Nav>
            {user ? (
              <NavDropdown title={`Admin: ${user.name}`} id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/admin">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/categorias">Categorias</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/profissionais">Profissionais</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/promocoes">Promoções</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/agendas">Agendas</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Sair</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Admin</Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar