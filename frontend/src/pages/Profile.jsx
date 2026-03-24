import { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Save, Trash2, Loader2, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    userService.getMe()
      .then(u => { setProfile(u); setForm({ name: u.name || '', phone: u.phone || '' }) })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userService.updateMe(form)
      setProfile(updated)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await userService.deleteMe()
      logout()
      toast.success('Account deleted')
      navigate('/')
    } catch { toast.error('Delete failed') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-gold-400)' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div className="animate-fade-up anim-delay-1" style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="card animate-fade-up anim-delay-2" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Avatar Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-ink-600)' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '2px solid rgba(240,192,64,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={24} style={{ color: 'var(--color-gold-400)' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>{profile?.name}</p>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: profile?.role === 'ADMIN' ? 'rgba(168,85,247,0.15)' : 'rgba(240,192,64,0.1)', color: profile?.role === 'ADMIN' ? '#c084fc' : 'var(--color-gold-400)', border: `1px solid ${profile?.role === 'ADMIN' ? 'rgba(168,85,247,0.3)' : 'rgba(240,192,64,0.3)'}` }}>
                <Shield size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />{profile?.role}
              </span>
            </div>
          </div>

          {/* Read-only email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={13} style={{ color: 'rgba(240,192,64,0.7)' }} />Email
            </label>
            <p style={{ padding: '0.75rem 1rem', background: 'var(--color-ink-950)', border: '1px solid var(--color-ink-600)', borderRadius: '0.75rem', color: '#9ca3af', fontSize: '0.875rem' }}>{profile?.email}</p>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={13} style={{ color: 'rgba(240,192,64,0.7)' }} />Full Name
              </label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Phone size={13} style={{ color: 'rgba(240,192,64,0.7)' }} />Phone
              </label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+94 77 123 4567" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '0.5rem' }}>
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
              </button>
              <button type="button" onClick={() => { logout(); navigate('/') }} className="btn-secondary" style={{ gap: '0.5rem' }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="animate-fade-up anim-delay-3" style={{ border: '1px solid rgba(239,68,68,0.3)', borderRadius: '1rem', padding: '1.5rem', background: 'rgba(239,68,68,0.05)' }}>
          <h3 style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Danger Zone</h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1rem' }}>Permanently delete your account and all data.</p>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="btn-danger" style={{ gap: '0.5rem' }}>
              <Trash2 size={14} /> Delete Account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowDelete(false)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={handleDelete} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Confirm Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}