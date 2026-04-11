import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import Payment from './pages/Payment'

function PrivateRoute({ children }) {
  const { loggedIn } = useAuth()
  return loggedIn ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { loggedIn, isAdmin } = useAuth()
  if (!loggedIn) return <Navigate to="/login" replace />
  if (!isAdmin)  return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-ink-950)' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1a1a26', color: '#fff',
          border: '1px solid #35354a',
          fontFamily: '"DM Sans", sans-serif', fontSize: '14px'
        },
        success: { iconTheme: { primary: '#f0c040', secondary: '#0a0a0f' } },
        error:   { iconTheme: { primary: '#ff6b8a', secondary: '#0a0a0f' } },
      }} />

      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/events"   element={<Events />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Logged-in users */}
        <Route path="/profile"            element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bookings"           element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/payment/:bookingId" element={<PrivateRoute><Payment /></PrivateRoute>} />

        {/* ADMIN only */}
        <Route path="/events/new"      element={<AdminRoute><CreateEvent /></AdminRoute>} />
        <Route path="/events/edit/:id" element={<AdminRoute><CreateEvent /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
