import { Container, Row, Col, Card } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-5">Sobre o La Belle Vie</h1>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Nossa História</h3>
              <p>O La Belle Vie nasceu do sonho de criar um espaço onde a beleza e o bem-estar se encontram. Há mais de 10 anos, oferecemos serviços de alta qualidade com profissionais especializados e produtos premium.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Nossa Missão</h3>
              <p>Proporcionar uma experiência única de beleza e relaxamento, valorizando a autoestima e o bem-estar de cada cliente através de serviços personalizados e de excelência.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Nossos Valores</h3>
              <ul>
                <li>Excelência no atendimento</li>
                <li>Profissionalismo e qualidade</li>
                <li>Inovação e tendências</li>
                <li>Respeito e cuidado com cada cliente</li>
                <li>Ambiente acolhedor e relaxante</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default About