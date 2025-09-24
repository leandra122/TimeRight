import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const adminData = localStorage.getItem('adminData')
    if (token && adminData) {
      setAdmin(JSON.parse(adminData))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials)
    const { token, admin } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('adminData', JSON.stringify(admin))
    setAdmin(admin)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminData')
    setAdmin(null)
  }

  const value = {
    user: admin,
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}