import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Music2, Menu, X, Plus, Ticket } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-900/95 backdrop-blur-md border-b border-ink-700 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center
                          group-hover:bg-gold-500 transition-colors duration-200">
            <Music2 size={18} className="text-ink-950" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            TuneTix
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === to
                  ? 'bg-ink-700 text-gold-400'
                  : 'text-gray-400 hover:text-white hover:bg-ink-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/events/new')}
            className="btn-primary flex items-center gap-2 text-sm py-2.5"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-900/98 backdrop-blur-md border-t border-ink-700 px-6 py-4 space-y-2">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-ink-700 text-gold-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => navigate('/events/new')}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-2"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>
      )}
    </header>
  )
}