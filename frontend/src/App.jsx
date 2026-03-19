import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a26',
            color: '#fff',
            border: '1px solid #35354a',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#f0c040', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: '#ff6b8a', secondary: '#0a0a0f' },
          },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/new" element={<CreateEvent />} />
        <Route path="/events/edit/:id" element={<CreateEvent />} />
      </Routes>
    </div>
  )
}