import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Calendar, MapPin, Users, CreditCard, XCircle, Loader2, RefreshCw, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingService } from '../services/bookingService'

const STATUS_STYLES = {
  PENDING:   { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24', label: 'Pending Payment' },
  CONFIRMED: { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399', label: 'Confirmed' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171', label: 'Cancelled' },
}

export default function Bookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await bookingService.getMy()
      setBookings(data)
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    setCancelling(id)
    try {
      const updated = await bookingService.cancel(id)
      setBookings(bs => bs.map(b => b.id === id ? updated : b))
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking')
    } finally { setCancelling(null) }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div className="animate-fade-up anim-delay-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>My Tickets</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>My Bookings</h1>
            <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={load} className="btn-secondary" style={{ gap: '0.5rem' }}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className="card animate-fade-up anim-delay-2" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Ticket size={24} style={{ color: 'var(--color-gold-400)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>No bookings yet</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Browse events and book your first ticket.</p>
            <button onClick={() => navigate('/events')} className="btn-primary" style={{ gap: '0.5rem', margin: '0 auto' }}>
              <Music size={15} /> Browse Events
            </button>
          </div>
        )}

        {/* Booking list */}
        {!loading && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b, i) => {
              const st = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING
              const isPending   = b.status === 'PENDING'
              const isCancelled = b.status === 'CANCELLED'
              return (
                <div key={b.id} className="card animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, overflow: 'hidden' }}>
                  {/* Top accent */}
                  <div style={{ height: '3px', background: st.color, opacity: 0.6 }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Left info */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', background: 'rgba(240,192,64,0.1)', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Music size={15} style={{ color: 'var(--color-gold-400)' }} />
                          </div>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>{b.eventName}</h3>
                            <p style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>#{b.id?.slice(-8)}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {b.eventLocation && <InfoRow icon={<MapPin size={12} />} text={b.eventLocation} />}
                          {b.eventDate     && <InfoRow icon={<Calendar size={12} />} text={b.eventDate} />}
                          <InfoRow icon={<Users size={12} />} text={`${b.seats} seat${b.seats !== 1 ? 's' : ''}`} />
                        </div>
                      </div>

                      {/* price, status and actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gold-400)' }}>
                          Rs. {b.totalPrice?.toFixed(2)}
                        </p>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.75rem', borderRadius: '9999px', background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                          {st.label}
                        </span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          {isPending && (
                            <button
                              onClick={() => navigate(`/payment/${b.id}`, { state: { booking: b } })}
                              className="btn-primary"
                              style={{ gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                              <CreditCard size={13} /> Pay Now
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="btn-danger"
                              style={{ gap: '0.5rem', padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
                            >
                              {cancelling === b.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <XCircle size={13} />}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
      <span style={{ color: 'rgba(240,192,64,0.6)', flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}