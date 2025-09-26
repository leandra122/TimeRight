import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import AdminNavbar from './components/AdminNavbar'
import ClientNavbar from './components/ClientNavbar'
import Footer from './components/Footer'
import { useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Professionals from './pages/Professionals'
import Contact from './pages/Contact'
import Support from './pages/Support'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ClientRegister from './pages/ClientRegister'
import ClientLogin from './pages/ClientLogin'
import ClientDashboard from './pages/ClientDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminCategories from './pages/AdminCategories'
import AdminProfessionals from './pages/AdminProfessionals'
import AdminPromotions from './pages/AdminPromotions'
import AdminSchedules from './pages/AdminSchedules'
import AdminReports from './pages/AdminReports'
import LoginChoice from './pages/LoginChoice'
import ProtectedRoute from './components/ProtectedRoute'
import ClientProtectedRoute from './components/ClientProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  const location = useLocation()
  
  const getNavbar = () => {
    if (location.pathname.startsWith('/admin')) {
      return <AdminNavbar />
    }
    if (location.pathname.startsWith('/cliente')) {
      return <ClientNavbar />
    }
    return <Navbar />
  }
  
  return (
    <div className="App">
      {getNavbar()}
          <Routes>
            {/* Páginas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/profissionais" element={<Professionals />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/login" element={<LoginChoice />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Área do Cliente */}
            <Route path="/cliente/cadastro" element={<ClientRegister />} />
            <Route path="/cliente/login" element={<ClientLogin />} />
            <Route path="/cliente/dashboard" element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            } />
            <Route path="/cliente/perfil" element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            } />
            
            {/* Área Administrativa */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/categorias" element={
              <ProtectedRoute>
                <AdminCategories />
              </ProtectedRoute>
            } />
            <Route path="/admin/profissionais" element={
              <ProtectedRoute>
                <AdminProfessionals />
              </ProtectedRoute>
            } />
            <Route path="/admin/promocoes" element={
              <ProtectedRoute>
                <AdminPromotions />
              </ProtectedRoute>
            } />
            <Route path="/admin/agendas" element={
              <ProtectedRoute>
                <AdminSchedules />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios" element={
              <ProtectedRoute>
                <AdminReports />
              </ProtectedRoute>
            } />
            
            {/* Redirecionamentos para compatibilidade */}
            <Route path="/client-register" element={<ClientRegister />} />
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/client-dashboard" element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </div>
  )
}

export default App