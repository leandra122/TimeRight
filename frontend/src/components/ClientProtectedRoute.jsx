import { Navigate } from 'react-router-dom'

const ClientProtectedRoute = ({ children }) => {
  const clientToken = localStorage.getItem('clientToken')
  const clientData = localStorage.getItem('clientData')
  
  if (!clientToken || !clientData) {
    return <Navigate to="/cliente/login" replace />
  }
  
  return children
}

export default ClientProtectedRoute