const About = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>
        Sobre o La Belle Vie
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Nossa História</h2>
          <p style={{ marginBottom: '1rem' }}>
            O La Belle Vie nasceu da paixão por proporcionar momentos únicos de cuidado e beleza. 
            Há mais de 10 anos no mercado, nos especializamos em serviços premium para mãos e pés.
          </p>
          <p>
            Nossa equipe é formada por profissionais altamente qualificados, sempre atualizados 
            com as últimas tendências e técnicas do mercado de beleza.
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '300px', 
            height: '200px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: 'var(--border-radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            Foto do Salão
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', textAlign: 'center' }}>
          Nossos Serviços
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Manicure</h3>
            <p>Cuidados completos para suas unhas das mãos, incluindo corte, lixa, cutícula e esmaltação.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Pedicure</h3>
            <p>Tratamento relaxante para os pés, com hidratação, esfoliação e cuidados especiais.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Alongamento</h3>
            <p>Técnicas modernas de alongamento de unhas para um visual elegante e duradouro.</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Skincare</h3>
            <p>Tratamentos especializados para a pele das mãos e pés, mantendo-as sempre saudáveis.</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
          Missão, Visão e Valores
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Missão</h3>
            <p>Proporcionar experiências únicas de beleza e bem-estar, valorizando a autoestima de cada cliente.</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Visão</h3>
            <p>Ser referência em cuidados estéticos para mãos e pés, reconhecida pela excelência e inovação.</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Valores</h3>
            <p>Qualidade, profissionalismo, higiene, respeito ao cliente e compromisso com a satisfação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;