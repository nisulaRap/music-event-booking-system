import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2, ArrowRight, Zap, Globe2, Star, ChevronDown } from 'lucide-react'
import { eventService } from '../services/eventService'

export default function Home() {
  const navigate = useNavigate()
  const [count, setCount] = useState(null)

  useEffect(() => {
    eventService.getAll()
      .then(ev => setCount(ev.length))
      .catch(() => setCount(0))
  }, [])

  return (
    <div className="noise-bg">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center
                           px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[700px] h-[700px] bg-gold-400/5 rounded-full blur-[120px]" />
          <div className="absolute top-3/4 left-1/4 w-[400px] h-[400px]
                          bg-purple-600/5 rounded-full blur-[100px]" />
          <svg className="absolute inset-0 w-full h-full opacity-5" aria-hidden="true">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f0c040" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Badge */}
        <div className="relative animate-fade-up anim-delay-1 mb-6">
          <span className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30
                           text-gold-400 text-xs font-semibold tracking-widest uppercase
                           px-4 py-2 rounded-full">
            <Zap size={12} />
            Live Music Event Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="relative animate-fade-up anim-delay-2 font-display text-5xl md:text-7xl lg:text-8xl
                        font-bold text-white leading-tight max-w-5xl mb-6">
          Where Music
          <span className="block text-transparent bg-clip-text
                           bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500">
            Comes Alive
          </span>
        </h1>

        {/* Sub */}
        <p className="relative animate-fade-up anim-delay-3 text-gray-400 text-lg md:text-xl max-w-xl
                       leading-relaxed mb-10">
          Discover, create, and manage extraordinary live music events. 
          Your stage. Your audience. Your encore.
        </p>

        {/* CTAs */}
        <div className="relative animate-fade-up anim-delay-4 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/events')}
            className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-base"
          >
            Explore Events
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/events/new')}
            className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-base"
          >
            <Music2 size={18} />
            Create an Event
          </button>
        </div>

        {/* Stats */}
        <div className="relative animate-fade-up anim-delay-5 mt-16 flex gap-12 text-center">
          <Stat value={count !== null ? count : '—'} label="Live Events" />
          <div className="w-px bg-ink-700" />
          <Stat value="100%" label="Satisfaction" />
          <div className="w-px bg-ink-700" />
          <Stat value="24/7" label="Support" />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronDown size={24} className="text-gray-500" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            A complete toolkit for music event professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i + 1} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="card border-gold-400/30 p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 to-transparent pointer-events-none" />
          <Globe2 size={36} className="text-gold-400 mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Put on a Show?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start creating your event in minutes. Manage seats, prices, and dates — all in one place.
          </p>
          <button
            onClick={() => navigate('/events/new')}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base"
          >
            Create Your First Event
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold text-gold-400">{value}</p>
      <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className={`card p-6 hover:border-gold-400/30 transition-all duration-300
                     animate-fade-up anim-delay-${delay}`}>
      <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center mb-4">
        <span className="text-gold-400">{icon}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

const features = [
  {
    icon: <Music2 size={22} />,
    title: 'Event Management',
    desc: 'Create, edit, and manage music events with rich details including venue, date, and capacity.',
  },
  {
    icon: <Star size={22} />,
    title: 'Seat Tracking',
    desc: 'Real-time seat availability with visual capacity indicators for every event.',
  },
  {
    icon: <Globe2 size={22} />,
    title: 'Service Integration',
    desc: 'Built on a microservices architecture that connects booking, payment, and notification services.',
  },
]