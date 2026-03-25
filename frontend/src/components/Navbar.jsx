import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Music2, Menu, X, Plus, User, LogOut, Ticket, ChevronDown, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [userMenu,  setUserMenu]  = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { loggedIn, isAdmin, user, logout } = useAuth()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenu(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (to) => location.pathname === to

  const navLinks = [
    { to: '/',       label: 'Home' },
    { to: '/events', label: 'Events' },
    ...(!isAdmin && loggedIn ? [{ to: '/bookings', label: 'My Bookings' }] : []),
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s',
      background: scrolled ? 'rgba(17,17,24,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--color-ink-700)' : '1px solid transparent',
      padding: scrolled ? '0.75rem 0' : '1.25rem 0',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '2.25rem', height: '2.25rem', background: 'var(--color-gold-400)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={16} style={{ color: 'var(--color-ink-950)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>TuneTix</span>
            {isAdmin && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: '#c084fc', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '9999px', padding: '0.1rem 0.4rem' }}>
                ADMIN
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', background: isActive(to) ? 'var(--color-ink-700)' : 'transparent', color: isActive(to) ? 'var(--color-gold-400)' : '#9ca3af' }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = '#9ca3af' }}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
          {loggedIn ? (
            <>
              {/* ADMIN only: New Event button */}
              {isAdmin && (
                <button onClick={() => navigate('/events/new')} className="btn-primary" style={{ gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Plus size={14} /> New Event
                </button>
              )}

              {/* User dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isAdmin ? 'rgba(168,85,247,0.1)' : 'var(--color-ink-800)', border: `1px solid ${isAdmin ? 'rgba(168,85,247,0.4)' : 'var(--color-ink-600)'}`, borderRadius: '2rem', padding: '0.4rem 0.875rem 0.4rem 0.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ width: '1.75rem', height: '1.75rem', background: isAdmin ? 'rgba(168,85,247,0.2)' : 'rgba(240,192,64,0.15)', border: `1px solid ${isAdmin ? 'rgba(168,85,247,0.4)' : 'rgba(240,192,64,0.3)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isAdmin
                      ? <ShieldAlert size={13} style={{ color: '#c084fc' }} />
                      : <User size={13} style={{ color: 'var(--color-gold-400)' }} />}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'white', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={13} style={{ color: '#6b7280' }} />
                </button>

                {userMenu && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: 'var(--color-ink-800)', border: '1px solid var(--color-ink-600)', borderRadius: '0.75rem', padding: '0.5rem', minWidth: '180px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }} className="animate-fade-in">
                    {/* Role badge */}
                    <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: isAdmin ? 'rgba(168,85,247,0.15)' : 'rgba(240,192,64,0.1)', color: isAdmin ? '#c084fc' : '#f0c040', border: `1px solid ${isAdmin ? 'rgba(168,85,247,0.3)' : 'rgba(240,192,64,0.3)'}` }}>
                        {isAdmin ? '⚡ ADMIN' : '👤 USER'}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--color-ink-600)', marginBottom: '0.25rem' }} />

                    <DropItem to="/profile" icon={<User size={13} />} label="My Profile" />
                    {!isAdmin && <DropItem to="/bookings" icon={<Ticket size={13} />} label="My Bookings" />}

                    <div style={{ height: '1px', background: 'var(--color-ink-600)', margin: '0.25rem 0' }} />
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '0.8rem', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none', borderRadius: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem', textDecoration: 'none' }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem' }} className="show-mobile">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: 'rgba(17,17,24,0.98)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--color-ink-700)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', color: isActive(to) ? 'var(--color-gold-400)' : '#9ca3af', background: isActive(to) ? 'var(--color-ink-700)' : 'transparent' }}>
              {label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link to="/profile" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>My Profile</Link>
              {isAdmin && (
                <button onClick={() => navigate('/events/new')} className="btn-primary" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Plus size={15} /> New Event
                </button>
              )}
              <button onClick={handleLogout} style={{ marginTop: '0.25rem', padding: '0.75rem 1rem', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login"    style={{ flex: 1, textAlign: 'center', padding: '0.75rem', border: '1px solid var(--color-ink-600)', borderRadius: '0.5rem', color: 'white', textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.875rem' }}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function DropItem({ to, icon, label }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '0.8rem', fontFamily: 'var(--font-body)', transition: 'background 0.15s', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-ink-700)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      <span style={{ color: 'rgba(240,192,64,0.7)' }}>{icon}</span> {label}
    </button>
  )
}