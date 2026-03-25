import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Trash2, Edit3, Music, Ticket, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventService } from '../services/eventService'
import { useAuth } from '../context/AuthContext'

function formatEventDate(raw) {
  if (!raw) return '—'
  try {
    const d = Array.isArray(raw) ? new Date(raw[0], raw[1]-1, raw[2]) : new Date(raw)
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return String(raw) }
}

export default function EventCard({ event, onDeleted, onBook, bookingLoading = false, index = 0 }) {
  const navigate = useNavigate()
  const { isAdmin, loggedIn } = useAuth()
  const [deleting,    setDeleting]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const availableSeats = event.availableSeats ?? event.totalSeats
  const seatsPercent   = event.totalSeats > 0
    ? Math.round(((event.totalSeats - availableSeats) / event.totalSeats) * 100) : 0
  const isSoldOut = availableSeats === 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await eventService.delete(event.id)
      toast.success('Event deleted')
      onDeleted?.(event.id)
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Admin access required' : 'Failed to delete event')
    } finally { setDeleting(false); setShowConfirm(false) }
  }

  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${(index % 6) * 0.08}s`,
        opacity: 0,
        background: 'var(--color-ink-800)',
        border: '1px solid var(--color-ink-600)',
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(240,192,64,0.35)'
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-ink-600)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gold top bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #f0c040, #cc9500)' }} />

      <div style={{ padding: '1.25rem' }}>

        {/* Name and Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {/* Icon */}
          <div style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', flexShrink: 0,
            background: 'rgba(240,192,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Music size={15} style={{ color: '#f0c040' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '0.95rem',
              fontWeight: 600, color: 'white', lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {event.name}
            </h3>
            <p style={{ fontSize: '0.65rem', color: '#4b5563', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
              #{event.id?.slice(-6)}
            </p>
          </div>

          <span style={{
            flexShrink: 0,
            background: 'rgba(240,192,64,0.08)',
            border: '1px solid rgba(240,192,64,0.25)',
            color: '#f0c040',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.5rem',
            borderRadius: '0.375rem',
            whiteSpace: 'nowrap',
          }}>
            Rs.{event.price?.toFixed(0)}
          </span>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <InfoRow icon={<Calendar size={12} />} label={formatEventDate(event.eventDate)} />
          <InfoRow icon={<MapPin size={12} />}   label={event.location} />
          <InfoRow icon={<Users size={12} />}    label={`${availableSeats} / ${event.totalSeats} seats`} />
        </div>

        {/* Capacity bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.3rem' }}>
            <span>Capacity</span>
            <span style={{ color: seatsPercent >= 90 ? '#f87171' : seatsPercent >= 60 ? '#fbbf24' : '#34d399' }}>
              {seatsPercent}% filled
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--color-ink-700)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              width: `${seatsPercent}%`,
              background: seatsPercent >= 90 ? '#ef4444' : seatsPercent >= 60 ? '#f59e0b' : '#10b981',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Actions */}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/events/edit/${event.id}`)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.375rem', padding: '0.55rem', borderRadius: '0.5rem',
                fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--color-ink-600)',
                color: '#d1d5db', transition: 'all 0.15s', fontFamily: 'var(--font-body)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0c040'; e.currentTarget.style.color = '#f0c040' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-ink-600)'; e.currentTarget.style.color = '#d1d5db' }}
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.375rem', padding: '0.55rem', borderRadius: '0.5rem',
                fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', transition: 'all 0.15s', fontFamily: 'var(--font-body)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        ) : (
          /* Book Now */
          <button
            onClick={() => !isSoldOut && onBook?.(event)}
            disabled={isSoldOut || bookingLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '0.6rem', borderRadius: '0.5rem',
              fontSize: '0.85rem', fontWeight: 600, border: 'none',
              cursor: isSoldOut || bookingLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              background: isSoldOut ? 'rgba(107,114,128,0.1)' : 'rgba(240,192,64,0.1)',
              color: isSoldOut ? '#6b7280' : '#f0c040',
              opacity: bookingLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!isSoldOut && !bookingLoading) e.currentTarget.style.background = 'rgba(240,192,64,0.18)' }}
            onMouseLeave={e => { if (!isSoldOut && !bookingLoading) e.currentTarget.style.background = 'rgba(240,192,64,0.1)' }}
          >
            {bookingLoading
              ? <><Loader2 size={14} className="animate-spin" /> Booking…</>
              : isSoldOut
              ? 'Sold Out'
              : <><Ticket size={14} /> Book Now — Rs.{event.price?.toFixed(0)}</>}
          </button>
        )}
      </div>

      {/* Delete confirm */}
      {showConfirm && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(6px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1rem', padding: '1.5rem', borderRadius: '1rem', zIndex: 10
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '2.75rem', height: '2.75rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 0.75rem'
            }}>
              <Trash2 size={18} style={{ color: '#f87171' }} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
              Delete Event?
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>This cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', width: '100%' }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--color-ink-600)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: '#ef4444', border: 'none', color: 'white', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: deleting ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
            >
              {deleting ? 'Deleting…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#9ca3af' }}>
      <span style={{ color: 'rgba(240,192,64,0.6)', flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}