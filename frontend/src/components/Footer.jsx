import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer style={{background: 'linear-gradient(135deg, #a4d7bd, #bee2ff)'}} className="text-dark py-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="mb-3">La Belle Vie</h5>
            <p className="text-secondary">
              Seu salão de beleza de confiança, oferecendo os melhores 
              tratamentos com profissionais qualificados.
            </p>
          </Col>
          
          <Col md={4} className="mb-4">
            <h6 className="mb-3">Links Rápidos</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li><Link to="/servicos" className="text-secondary text-decoration-none">Serviços</Link></li>
              <li><Link to="/profissionais" className="text-secondary text-decoration-none">Profissionais</Link></li>
              <li><Link to="/contato" className="text-secondary text-decoration-none">Contato</Link></li>
            </ul>
          </Col>
          
          <Col md={4} className="mb-4">
            <h6 className="mb-3">Redes Sociais</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-4">📱</a>
              <a href="#" className="text-secondary fs-4">📞</a>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0 text-secondary">
              © 2024 La Belle Vie. Todos os direitos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer