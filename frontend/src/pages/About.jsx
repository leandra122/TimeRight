import { Container, Row, Col } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="mb-4">Sobre o La Belle Vie</h1>
          <p className="lead">
            O La Belle Vie é um salão de beleza dedicado a realçar a sua beleza natural 
            com os melhores tratamentos e profissionais qualificados.
          </p>
          <p>
            Fundado com o objetivo de proporcionar uma experiência única de bem-estar 
            e beleza, nosso salão oferece um ambiente acolhedor e serviços de alta qualidade.
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default About