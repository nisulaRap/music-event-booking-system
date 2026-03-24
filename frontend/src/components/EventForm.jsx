import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2, MapPin, Calendar, Users, DollarSign, Save, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventService } from '../services/eventService'

const EMPTY = {
  name: '',
  location: '',
  eventDate: '',
  totalSeats: '',
  price: '',
}

export default function EventForm({ eventId }) {
  const navigate = useNavigate()
  const isEdit = Boolean(eventId)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const event = await eventService.getById(eventId)
        setForm({
          name: event.name || '',
          location: event.location || '',
          eventDate: normaliseDate(event.eventDate),
          totalSeats: event.totalSeats?.toString() || '',
          price: event.price?.toString() || '',
        })
      } catch {
        toast.error('Could not load event data')
        navigate('/events')
      } finally {
        setFetching(false)
      }
    })()
  }, [eventId, isEdit, navigate])

  const normaliseDate = (raw) => {
    if (!raw) return ''
    if (Array.isArray(raw)) {
      const [y, m, d] = raw
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    }
    return raw
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.eventDate) e.eventDate = 'Event date is required'
    else if (new Date(form.eventDate) <= new Date()) e.eventDate = 'Date must be in the future'
    if (!form.totalSeats || Number(form.totalSeats) < 1) e.totalSeats = 'Must be at least 1'
    if (form.price === '' || Number(form.price) < 0) e.price = 'Must be 0 or more'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      eventDate: form.eventDate,
      totalSeats: Number(form.totalSeats),
      price: Number(form.price),
    }

    try {
      if (isEdit) {
        await eventService.update(eventId, payload)
        toast.success('Event updated successfully!')
      } else {
        await eventService.create(payload)
        toast.success('Event created successfully!')
      }
      navigate('/events')
    } catch (err) {
      console.error('API error:', err.response?.data || err.message)
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Something went wrong — check the browser console'
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-gold-400" />
      </div>
    )
  }

  const today = new Date()
  today.setDate(today.getDate() + 1)
  const minDate = today.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto" noValidate>
      <Field label="Event Name" icon={<Music2 size={15} />} error={errors.name}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Midnight Symphony Vol. III"
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
        />
      </Field>

      <Field label="Location / Venue" icon={<MapPin size={15} />} error={errors.location}>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Colombo City Hall, Sri Lanka"
          className={`input-field ${errors.location ? 'border-red-500' : ''}`}
        />
      </Field>

      <Field label="Event Date" icon={<Calendar size={15} />} error={errors.eventDate}>
        <input
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          min={minDate}
          className={`input-field ${errors.eventDate ? 'border-red-500' : ''}`}
          style={{ colorScheme: 'dark' }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Total Seats" icon={<Users size={15} />} error={errors.totalSeats}>
          <input
            type="number"
            name="totalSeats"
            value={form.totalSeats}
            onChange={handleChange}
            placeholder="e.g. 500"
            min="1"
            className={`input-field ${errors.totalSeats ? 'border-red-500' : ''}`}
          />
        </Field>

        <Field label="Ticket Price (LKR)" icon={<DollarSign size={15} />} error={errors.price}>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 49.99"
            min="0"
            step="0.01"
            className={`input-field ${errors.price ? 'border-red-500' : ''}`}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="btn-secondary flex items-center gap-2 px-5"
        >
          <ArrowLeft size={15} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> {isEdit ? 'Saving…' : 'Creating…'}</>
          ) : (
            <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Event'}</>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({ label, icon, error, children }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <span style={{ color: 'var(--color-gold-400)', opacity: 0.7 }}>{icon}</span>
        {label}
      </label>
      {children}
      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.375rem', paddingLeft: '0.25rem' }}>{error}</p>}
    </div>
  )
}