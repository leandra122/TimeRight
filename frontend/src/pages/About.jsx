import { Container, Row, Col, Card } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-5">Sobre o Time Right</h1>
          
          <Card className="mb-4" style={{padding: '32px'}}>
            <Card.Body>
              <h3 className="mb-3" style={{fontWeight: 600, color: 'var(--primary-color)'}}>Quem Somos</h3>
              <p>O <strong>Time Right</strong> nasceu com o propósito de otimizar seu tempo e conectar você aos melhores profissionais. Sabemos que, na correria do dia a dia, encontrar horários disponíveis pode ser desafiador, e é por isso que desenvolvemos uma plataforma digital que simplifica o agendamento e maximiza sua produtividade.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4" style={{padding: '32px'}}>
            <Card.Body>
              <h3 className="mb-3" style={{fontWeight: 600, color: 'var(--primary-color)'}}>Nossa Missão</h3>
              <p>Nossa missão é transformar o agendamento em algo prático, acessível e inovador. Conectamos profissionais qualificados com clientes que valorizam seu tempo, oferecendo uma experiência personalizada e eficiente.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4" style={{padding: '32px'}}>
            <Card.Body>
              <h3 className="mb-3" style={{fontWeight: 600, color: 'var(--primary-color)'}}>Nossa Diferença</h3>
              <p>Combinamos tecnologia, praticidade e eficiência para que cada agendamento seja perfeito. O Time Right é mais do que uma plataforma: é seu parceiro para otimizar tempo e conectar com os melhores profissionais.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4" style={{padding: '32px'}}>
            <Card.Body>
              <h3 className="mb-3" style={{fontWeight: 600, color: 'var(--primary-color)'}}>Nossos Valores</h3>
              <ul className="list-unstyled">
                <li className="mb-2"><i className="fas fa-clock text-primary me-2"></i>Otimização do seu tempo</li>
                <li className="mb-2"><i className="fas fa-star text-primary me-2"></i>Excelência em conectividade</li>
                <li className="mb-2"><i className="fas fa-mobile-alt text-primary me-2"></i>Tecnologia intuitiva</li>
                <li className="mb-2"><i className="fas fa-users text-primary me-2"></i>Rede de profissionais qualificados</li>
                <li className="mb-2"><i className="fas fa-calendar text-primary me-2"></i>Agendamento inteligente</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default About