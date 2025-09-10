// Componente de rodapé estilizado com links e redes sociais
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Links rápidos */}
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/servicos">Serviços</Link>
          <Link to="/contato">Contato</Link>
        </div>
        
        {/* Ícones sociais */}
        <div className="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            📷
          </a>
          <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
            📱
          </a>
        </div>
        
        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; 2024 TimeRight. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;