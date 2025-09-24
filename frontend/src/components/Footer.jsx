import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer style={{background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'}} className="text-white py-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Time Right</h5>
            <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              Sua plataforma de agendamento de confiança, 
              conectando você aos melhores profissionais.
            </p>
          </Col>
          
          <Col md={4} className="mb-4">
            <h6 className="mb-3">Links Rápidos</h6>
            <ul className="list-unstyled">
              <li><Link to="/" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="text-decoration-none">Home</Link></li>
              <li><Link to="/servicos" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="text-decoration-none">Serviços</Link></li>
              <li><Link to="/profissionais" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="text-decoration-none">Profissionais</Link></li>
              <li><Link to="/contato" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="text-decoration-none">Contato</Link></li>
            </ul>
          </Col>
          
          <Col md={4} className="mb-4">
            <h6 className="mb-3">Redes Sociais</h6>
            <div className="d-flex gap-3">
              <a href="#" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="fs-4"><i className="fab fa-instagram"></i></a>
              <a href="#" style={{color: 'rgba(255, 255, 255, 0.8)'}} className="fs-4"><i className="fab fa-whatsapp"></i></a>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              © 2025 Time Right. Todos os direitos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer