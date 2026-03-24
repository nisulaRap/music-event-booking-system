import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music2, Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password)     e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const data = await authService.login(form)
      if (data.error) { toast.error(data.error); return }
      login(data)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors(er => ({ ...er, [k]: '' })) }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="animate-fade-up anim-delay-1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3rem', height: '3rem', background: 'var(--color-gold-400)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Music2 size={22} style={{ color: 'var(--color-ink-950)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Welcome back</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '0.9rem' }}>Sign in to your Encore account</p>
        </div>

        {/* Card */}
        <div className="card animate-fade-up anim-delay-2" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>
            <Field label="Email" icon={<Mail size={14} />} error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
            </Field>
            <Field label="Password" icon={<Lock size={14} />} error={errors.password}>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className={`input-field ${errors.password ? 'border-red-500' : ''}`} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-gold-400)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon, error, children }) {
  return (
    <div>
      <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{ color: 'rgba(240,192,64,0.7)' }}>{icon}</span>{label}
      </label>
      {children}
      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.375rem' }}>{error}</p>}
    </div>
  )
}