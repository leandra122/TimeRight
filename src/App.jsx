// Componente principal da aplicação - configura roteamento e layout geral
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Importação de todas as páginas
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Professionals from './pages/Professionals';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    // Provider de autenticação envolve toda a aplicação
    <AuthProvider>
      <Router>
        {/* Layout principal com header, main e footer */}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Barra de navegação */}
          <Navbar />
          
          {/* Conteúdo principal */}
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/profissionais" element={<Professionals />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              
              {/* Rotas protegidas - requerem login */}
              <Route path="/agendamento" element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              } />
              
              <Route path="/perfil" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              {/* Rota administrativa - apenas para admins */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </main>
          
          {/* Rodapé */}
          <footer style={{ 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            textAlign: 'center', 
            padding: '2rem 0' 
          }}>
            <div className="container">
              <p>&copy; 2024 La Belle Vie. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;