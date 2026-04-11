import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, Music2, SlidersHorizontal, X, Minus } from 'lucide-react'
import EventCard from '../components/EventCard'
import { eventService } from '../services/eventService'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Events() {
  const navigate = useNavigate()
  const { loggedIn, isAdmin } = useAuth()
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [sort,    setSort]    = useState('date')
  const [booking, setBooking] = useState(null)
  const [seatModal, setSeatModal]   = useState(null)
  const [seatCount, setSeatCount]   = useState(1)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setEvents(await eventService.getAll()) }
    catch { setError('Could not connect to the event service.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDeleted = (id) => setEvents(ev => ev.filter(e => e.id !== id))

  const handleBookClick = (event) => {
    if (!loggedIn) { toast.error('Please sign in to book tickets'); navigate('/login'); return }
    setSeatCount(1)
    setSeatModal(event)
  }

  // Confirms booking with chosen seat count
  const handleConfirmBooking = async () => {
    if (!seatModal) return
    setBooking(seatModal.id)
    setSeatModal(null)
    try {
      const b = await bookingService.create({ eventId: seatModal.id, seats: seatCount })
      toast.success(`${seatCount} seat${seatCount > 1 ? 's' : ''} booked! Proceed to payment.`)
      navigate(`/payment/${b.id}`, { state: { booking: b } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setBooking(null) }
  }

  const filtered = events
    .filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'date')  return new Date(Array.isArray(a.eventDate) ? a.eventDate.join('-') : a.eventDate) - new Date(Array.isArray(b.eventDate) ? b.eventDate.join('-') : b.eventDate)
      if (sort === 'price') return a.price - b.price
      if (sort === 'name')  return a.name?.localeCompare(b.name)
      return 0
    })

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        {/* Header */}
        <div className="animate-fade-up anim-delay-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>All Events</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'white' }}>Music Events</h1>
            <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {loading ? 'Loading…' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={load} className="btn-secondary" style={{ padding: '0.75rem' }} title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/events/new')} className="btn-primary" style={{ gap: '0.5rem' }}>
                <Plus size={16} /> New Event
              </button>
            )}
          </div>
        </div>

        {/* Search and Sort */}
        <div className="animate-fade-up anim-delay-2" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location…" className="input-field"
              style={{ paddingLeft: '2.5rem', paddingRight: search ? '2.5rem' : '1rem' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
                <X size={15} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={14} style={{ color: '#6b7280' }} />
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field"
              style={{ width: 'auto', cursor: 'pointer', colorScheme: 'dark' }}>
              <option value="date">Sort: Date</option>
              <option value="price">Sort: Price</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                {[60, 40, 50, 30].map((w, j) => <div key={j} className="skeleton" style={{ height: j === 0 ? '1rem' : '0.75rem', width: `${w}%`, marginBottom: '0.75rem', borderRadius: '0.25rem' }} />)}
                <div className="skeleton" style={{ height: '2.5rem', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <X size={24} style={{ color: '#f87171' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>Connection Error</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={load} className="btn-secondary" style={{ gap: '0.5rem', margin: '0 auto' }}>
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Music2 size={24} style={{ color: 'var(--color-gold-400)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>
              {search ? 'No Results' : 'No Events Yet'}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {search ? 'Try a different search term.' : 'No music events available yet.'}
            </p>
            {search
              ? <button onClick={() => setSearch('')} className="btn-secondary" style={{ gap: '0.5rem', margin: '0 auto' }}><X size={15} /> Clear</button>
              : isAdmin && <button onClick={() => navigate('/events/new')} className="btn-primary" style={{ gap: '0.5rem', margin: '0 auto' }}><Plus size={15} /> Create Event</button>
            }
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((event, i) => (
              <div key={event.id} style={{ position: 'relative' }}>
                <EventCard
                  event={event}
                  onDeleted={handleDeleted}
                  onBook={handleBookClick}
                  bookingLoading={booking === event.id}
                  index={i % 6}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seat Picker Modal */}
      {seatModal && (
        <div
          onClick={() => setSeatModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-fade-up"
            style={{
              background: 'var(--color-ink-800)', border: '1px solid var(--color-ink-600)',
              borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '420px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Book Tickets
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                {seatModal.name}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Rs.{seatModal.price?.toFixed(0)} per seat · {seatModal.availableSeats ?? seatModal.totalSeats} available
              </p>
            </div>

            {/* Seat counter */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem' }}>
                Number of Seats
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setSeatCount(c => Math.max(1, c - 1))}
                  style={{
                    width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem',
                    background: 'var(--color-ink-700)', border: '1px solid var(--color-ink-600)',
                    color: 'white', fontSize: '1.25rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-ink-600)'}
                >
                  <Minus size={16} />
                </button>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gold-400)' }}>
                    {seatCount}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.1rem' }}>
                    {seatCount === 1 ? 'seat' : 'seats'}
                  </p>
                </div>

                <button
                  onClick={() => setSeatCount(c => Math.min(seatModal.availableSeats ?? seatModal.totalSeats, c + 1))}
                  style={{
                    width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem',
                    background: 'var(--color-ink-700)', border: '1px solid var(--color-ink-600)',
                    color: 'white', fontSize: '1.25rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-ink-600)'}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div style={{ background: 'var(--color-ink-700)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Rs.{seatModal.price?.toFixed(0)} × {seatCount} seat{seatCount > 1 ? 's' : ''}
                </span>
                <span style={{ color: 'white', fontSize: '0.875rem' }}>
                  Rs.{(seatModal.price * seatCount).toFixed(0)}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--color-ink-600)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold-400)' }}>
                  Rs.{(seatModal.price * seatCount).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSeatModal(null)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="btn-primary"
                style={{ flex: 2, justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}