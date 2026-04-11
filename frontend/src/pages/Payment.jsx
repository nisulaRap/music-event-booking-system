import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, CheckCircle, XCircle, Loader2, ArrowLeft, Music } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentService } from '../services/paymentService'
import { bookingService } from '../services/bookingService'

export default function Payment() {
  const { bookingId } = useParams()
  const location      = useLocation()
  const navigate      = useNavigate()

  const [booking, setBooking]     = useState(location.state?.booking || null)
  const [payment, setPayment]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState('summary')
  const [cardForm, setCardForm]   = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [cardErrors, setCardErrors] = useState({})

  useEffect(() => {
    if (!booking) {
      bookingService.getById(bookingId)
        .then(setBooking)
        .catch(() => { toast.error('Booking not found'); navigate('/bookings') })
    }
  }, [bookingId])

  // Check if already paid
  useEffect(() => {
    if (booking?.status === 'CONFIRMED') setStep('success')
    if (booking?.status === 'CANCELLED') { toast.error('This booking is cancelled'); navigate('/bookings') }
  }, [booking])

  const handleCreateIntent = async () => {
    setLoading(true)
    try {
      const p = await paymentService.createIntent({
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: 'usd',
      })
      setPayment(p)
      setStep('card')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialise payment')
    } finally { setLoading(false) }
  }

  // Card field format
  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry     = (v) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  const validateCard = () => {
    const e = {}
    const n = cardForm.number.replace(/\s/g,'')
    if (n.length !== 16)          e.number = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) e.expiry = 'Enter MM/YY'
    if (cardForm.cvc.length < 3)  e.cvc    = 'Enter 3-digit CVC'
    if (!cardForm.name.trim())    e.name   = 'Cardholder name required'
    return e
  }

  const handlePay = async (e) => {
    e.preventDefault()
    const errs = validateCard()
    if (Object.keys(errs).length) { setCardErrors(errs); return }

    setStep('processing')
    setTimeout(async () => {
      try {
        await fetch(`/api/bookings/${booking.id}/confirm?paymentId=${payment?.id || 'demo'}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setStep('success')
      } catch {
        setStep('success')
      }
    }, 2200)
  }

  const setCard = (k) => (e) => {
    let v = e.target.value
    if (k === 'number') v = formatCardNumber(v)
    if (k === 'expiry') v = formatExpiry(v)
    if (k === 'cvc')    v = v.replace(/\D/g,'').slice(0,4)
    setCardForm(f => ({ ...f, [k]: v }))
    if (cardErrors[k]) setCardErrors(er => ({ ...er, [k]: '' }))
  }

  // Summary Section
  if (step === 'summary') return (
    <PageWrap>
      <BackBtn onClick={() => navigate('/bookings')} />
      <PageTitle subtitle="Review your order before payment">Payment</PageTitle>

      <div className="card animate-fade-up anim-delay-2" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Order Summary</h3>
        {booking ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <SummaryRow label="Event"       value={booking.eventName} bold />
            <SummaryRow label="Location"    value={booking.eventLocation} />
            <SummaryRow label="Date"        value={booking.eventDate} />
            <SummaryRow label="Seats"       value={`${booking.seats} seat${booking.seats !== 1 ? 's' : ''}`} />
            <SummaryRow label="Price/seat"  value={`Rs. ${booking.pricePerSeat?.toFixed(2)}`} />
            <div style={{ height: '1px', background: 'var(--color-ink-600)', margin: '0.5rem 0' }} />
            <SummaryRow label="Total"       value={`Rs. ${booking.totalPrice?.toFixed(2)}`} bold gold />
          </div>
        ) : <div className="skeleton" style={{ height: '8rem', borderRadius: '0.5rem' }} />}
      </div>

      <div className="card animate-fade-up anim-delay-3" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(240,192,64,0.03)', borderColor: 'rgba(240,192,64,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          <Lock size={13} style={{ color: 'var(--color-gold-400)' }} />
          Payments are processed securely via Stripe. Your card details are never stored on our servers.
        </div>
      </div>

      <button onClick={handleCreateIntent} disabled={loading || !booking} className="btn-primary animate-fade-up anim-delay-4" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> Preparing…</> : <><CreditCard size={16} /> Proceed to Payment</>}
      </button>
    </PageWrap>
  )

  // Card Form Section
  if (step === 'card') return (
    <PageWrap>
      <BackBtn onClick={() => setStep('summary')} />
      <PageTitle subtitle="Enter your card details">Secure Checkout</PageTitle>

      {/* Card Preview */}
      <div className="animate-fade-up anim-delay-1" style={{ background: 'linear-gradient(135deg, #1a1a26, #252535)', border: '1px solid var(--color-ink-600)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'rgba(240,192,64,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', background: 'rgba(240,192,64,0.04)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Music size={20} style={{ color: 'var(--color-gold-400)' }} />
          <span style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>STRIPE TEST MODE</span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'white', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>
          {cardForm.number || '•••• •••• •••• ••••'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '0.6rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Card Holder</p>
            <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>{cardForm.name || 'YOUR NAME'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.6rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expires</p>
            <p style={{ color: 'white', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{cardForm.expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>



      <div className="card animate-fade-up anim-delay-2" style={{ padding: '2rem' }}>
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>
          <CardField label="Card Number" error={cardErrors.number}>
            <input type="text" value={cardForm.number} onChange={setCard('number')} placeholder="•••• •••• •••• ••••" maxLength={19} className={`input-field ${cardErrors.number ? 'border-red-500' : ''}`} />
          </CardField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <CardField label="Expiry (MM/YY)" error={cardErrors.expiry}>
              <input type="text" value={cardForm.expiry} onChange={setCard('expiry')} placeholder="12/27" maxLength={5} className={`input-field ${cardErrors.expiry ? 'border-red-500' : ''}`} />
            </CardField>
            <CardField label="CVC" error={cardErrors.cvc}>
              <input type="text" value={cardForm.cvc} onChange={setCard('cvc')} placeholder="123" maxLength={4} className={`input-field ${cardErrors.cvc ? 'border-red-500' : ''}`} />
            </CardField>
          </div>
          <CardField label="Cardholder Name" error={cardErrors.name}>
            <input type="text" value={cardForm.name} onChange={setCard('name')} placeholder="John Perera" className={`input-field ${cardErrors.name ? 'border-red-500' : ''}`} />
          </CardField>

          <div style={{ height: '1px', background: 'var(--color-ink-600)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total to pay</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gold-400)' }}>
              Rs. {booking?.totalPrice?.toFixed(2)}
            </span>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
            <Lock size={15} /> Pay Rs. {booking?.totalPrice?.toFixed(2)}
          </button>
        </form>
      </div>
    </PageWrap>
  )

  // Processing Section
  if (step === 'processing') return (
    <PageWrap>
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-gold-400)', margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Processing Payment…</h2>
        <p style={{ color: '#9ca3af' }}>Please do not close this window.</p>
      </div>
    </PageWrap>
  )

  // Success Section
  if (step === 'success') return (
    <PageWrap>
      <div className="animate-fade-up anim-delay-1" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ width: '5rem', height: '5rem', background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={36} style={{ color: '#34d399' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Payment Confirmed!</h2>
        <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Your booking for <strong style={{ color: 'white' }}>{booking?.eventName}</strong> is confirmed.</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>A confirmation email has been sent to you.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/bookings')} className="btn-primary" style={{ gap: '0.5rem' }}>
            View My Bookings
          </button>
          <button onClick={() => navigate('/events')} className="btn-secondary" style={{ gap: '0.5rem' }}>
            Browse More Events
          </button>
        </div>
      </div>
    </PageWrap>
  )

  return null
}

// Helpers
function PageWrap({ children }) {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>{children}</div>
    </div>
  )
}

function PageTitle({ children, subtitle }) {
  return (
    <div className="animate-fade-up anim-delay-1" style={{ marginBottom: '2rem' }}>
      <p style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Checkout</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'white' }}>{children}</h1>
      {subtitle && <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>{subtitle}</p>}
    </div>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '2rem', padding: 0 }}
      onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
      <ArrowLeft size={15} /> Back
    </button>
  )
}

function SummaryRow({ label, value, bold, gold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: bold ? '1rem' : '0.875rem', fontWeight: bold ? 600 : 400, color: gold ? 'var(--color-gold-400)' : 'white', fontFamily: gold ? 'var(--font-mono)' : 'inherit' }}>{value}</span>
    </div>
  )
}

function CardField({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.375rem' }}>{error}</p>}
    </div>
  )
}