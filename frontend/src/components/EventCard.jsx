import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Trash2, Edit3, Music } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventService } from '../services/eventService'

function formatEventDate(raw) {
  if (!raw) return '—'
  try {
    if (Array.isArray(raw)) {
      const [y, m, d] = raw
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      })
    }
    return new Date(raw).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    })
  } catch {
    return String(raw)
  }
}

export default function EventCard({ event, onDeleted, index = 0 }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const formattedDate = formatEventDate(event.eventDate)
  const availableSeats = event.availableSeats ?? event.totalSeats
  const seatsPercent = event.totalSeats > 0
    ? Math.round(((event.totalSeats - availableSeats) / event.totalSeats) * 100)
    : 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await eventService.delete(event.id)
      toast.success('Event deleted')
      onDeleted?.(event.id)
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message)
      toast.error('Failed to delete event')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const delayStyle = { animationDelay: `${(index % 6) * 0.1}s`, opacity: 0 }

  return (
    <div
      className="card group animate-fade-up"
      style={{
        ...delayStyle,
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(240,192,64,0.4)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(240,192,64,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Gold top stripe */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #f0c040, #e8b020, #cc9500)'
      }} />

      <div style={{ padding: '1.5rem' }}>
        {/* Title + price */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', flexShrink: 0,
              background: 'rgba(240,192,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Music size={18} style={{ color: '#f0c040' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>
                {event.name}
              </h3>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                #{event.id?.slice(-6)}
              </p>
            </div>
          </div>
          <span style={{
            flexShrink: 0, background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.3)', color: '#f0c040',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.75rem', borderRadius: '9999px'
          }}>
            Rs. {event.price?.toFixed(2)}
          </span>
        </div>

        {/* Info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <InfoRow icon={<Calendar size={13} />} label={formattedDate} />
          <InfoRow icon={<MapPin size={13} />} label={event.location} />
          <InfoRow icon={<Users size={13} />} label={`${availableSeats} / ${event.totalSeats} seats available`} />
        </div>

        {/* Capacity bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.4rem' }}>
            <span>Capacity</span>
            <span style={{ color: seatsPercent >= 90 ? '#f87171' : seatsPercent >= 70 ? '#fbbf24' : '#34d399' }}>
              {seatsPercent}% filled
            </span>
          </div>
          <div style={{ height: '6px', background: 'var(--color-ink-700)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              width: `${seatsPercent}%`,
              background: seatsPercent >= 90 ? '#ef4444' : seatsPercent >= 70 ? '#f59e0b' : '#10b981',
              transition: 'width 0.7s ease'
            }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/events/edit/${event.id}`)}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-danger"
            style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Delete confirm overlay */}
      {showConfirm && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          padding: '1.5rem', borderRadius: '1rem', zIndex: 10
        }} className="animate-fade-in">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem', height: '3rem', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
            }}>
              <Trash2 size={20} style={{ color: '#f87171' }} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
              Delete Event?
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button onClick={() => setShowConfirm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem', padding: '0.6rem' }}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                flex: 1, background: '#ef4444', color: 'white', fontWeight: 600,
                padding: '0.6rem', borderRadius: '0.5rem', fontSize: '0.875rem',
                cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1,
                transition: 'all 0.2s', border: 'none'
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#9ca3af' }}>
      <span style={{ color: 'rgba(240,192,64,0.7)', flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}