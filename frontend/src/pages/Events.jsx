import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, Music2, SlidersHorizontal, X } from 'lucide-react'
import EventCard from '../components/EventCard'
import { eventService } from '../services/eventService'

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventService.getAll()
      setEvents(data)
    } catch (e) {
      setError('Could not connect to the event service. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDeleted = (id) => setEvents(ev => ev.filter(e => e.id !== id))

  /* Filter + sort */
  const filtered = events
    .filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'date')  return new Date(a.eventDate) - new Date(b.eventDate)
      if (sort === 'price') return a.price - b.price
      if (sort === 'name')  return a.name?.localeCompare(b.name)
      return 0
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="animate-fade-up anim-delay-1">
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-2">
              All Events
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
              Music Events
            </h1>
            <p className="text-gray-400 mt-2">
              {loading ? 'Loading…' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="animate-fade-up anim-delay-2 flex gap-3">
            <button
              onClick={load}
              className="btn-secondary p-3"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => navigate('/events/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              New Event
            </button>
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="animate-fade-up anim-delay-3 flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location…"
              className="input-field pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-500 flex-shrink-0" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input-field w-auto cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="date">Sort: Date</option>
              <option value="price">Sort: Price</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* States */}
        {loading && <SkeletonGrid />}

        {!loading && error && (
          <ErrorState msg={error} onRetry={load} />
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            hasSearch={Boolean(search)}
            onClear={() => setSearch('')}
            onCreate={() => navigate('/events/new')}
          />
        )}

        {/* Event grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative">
            {filtered.map((event, i) => (
              <div key={event.id} className="relative">
                <EventCard event={event} onDeleted={handleDeleted} index={i % 6} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-components ───────────────────────────────────────── */

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-6 space-y-4">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-8 rounded-lg mt-4" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ msg, onRetry }) {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full
                      flex items-center justify-center mx-auto mb-4">
        <X size={28} className="text-red-400" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white mb-2">Connection Error</h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">{msg}</p>
      <button onClick={onRetry} className="btn-secondary flex items-center gap-2 mx-auto">
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  )
}

function EmptyState({ hasSearch, onClear, onCreate }) {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 bg-gold-400/10 border border-gold-400/30 rounded-full
                      flex items-center justify-center mx-auto mb-4">
        <Music2 size={28} className="text-gold-400" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white mb-2">
        {hasSearch ? 'No Results' : 'No Events Yet'}
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        {hasSearch
          ? 'Try a different search term.'
          : 'Be the first to create a music event.'}
      </p>
      {hasSearch ? (
        <button onClick={onClear} className="btn-secondary mx-auto flex items-center gap-2">
          <X size={15} />
          Clear Search
        </button>
      ) : (
        <button onClick={onCreate} className="btn-primary mx-auto flex items-center gap-2">
          <Plus size={15} />
          Create Event
        </button>
      )}
    </div>
  )
}