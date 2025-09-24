import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Professionals from './pages/Professionals'
import Contact from './pages/Contact'
import Support from './pages/Support'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminCategories from './pages/AdminCategories'
import AdminProfessionals from './pages/AdminProfessionals'
import AdminPromotions from './pages/AdminPromotions'
import AdminSchedules from './pages/AdminSchedules'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/profissionais" element={<Professionals />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
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
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App