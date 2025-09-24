import { Container, Row, Col, Card } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-5">Sobre o Alimentando o Futuro</h1>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Quem Somos</h3>
              <p>O <strong>Alimentando o Futuro</strong> é uma plataforma inovadora que revoluciona o acesso a alimentos saudáveis e conhecimento sobre cultivo sustentável. Criamos um ambiente digital educativo que capacita pessoas a desenvolverem autonomia alimentar através de práticas acessíveis e sustentáveis.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">O Problema que Resolvemos</h3>
              <p>Milhões de pessoas enfrentam barreiras no acesso a alimentos frescos e nutritivos devido a limitações financeiras e falta de conhecimento sobre cultivo. O consumo excessivo de produtos industrializados impacta diretamente a saúde, contribuindo para o aumento de doenças crônicas como obesidade e diabetes. Dados do IBGE (2020) e estudos do Ministério da Saúde (2021) confirmam que essa realidade afeta diretamente a qualidade de vida da população.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Nossa Missão e Impacto</h3>
              <p>Oferecemos ferramentas educativas, tutoriais de nutrição, técnicas de reaproveitamento de alimentos e métodos de cultivo doméstico. Nosso objetivo é tornar as pessoas mais autossuficientes, saudáveis e conscientes, promovendo sustentabilidade e segurança alimentar em pequenos espaços urbanos.</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="mb-3">Por que Somos Essenciais</h3>
              <p>Em um cenário onde bilhões enfrentam insegurança alimentar globalmente, nossa plataforma oferece soluções práticas e acessíveis. Combinamos tecnologia, educação e sustentabilidade para criar um futuro onde cada pessoa pode cultivar sua própria alimentação saudável, independentemente do espaço disponível. Somos a ponte entre o conhecimento tradicional e a inovação digital para alimentar o futuro de forma sustentável.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default About