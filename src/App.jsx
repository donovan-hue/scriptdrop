import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Analytics } from '@vercel/analytics/react'
import Landing       from './pages/Landing'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import NotFound      from './pages/NotFound'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ color: '#00FFB2', textAlign: 'center', marginTop: '40vh', fontFamily: 'monospace', fontSize: '14px' }}>
      Cargando...
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                element={<Landing />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/app"             element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  )
}
