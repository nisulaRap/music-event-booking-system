import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music2, Edit3 } from 'lucide-react'
import EventForm from '../components/EventForm'

export default function CreateEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm
                     transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* Page Header */}
        <div className="mb-10 animate-fade-up anim-delay-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gold-400/10 border border-gold-400/30 rounded-xl
                            flex items-center justify-center">
              {isEdit ? <Edit3 size={18} className="text-gold-400" /> : <Music2 size={18} className="text-gold-400" />}
            </div>
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
              {isEdit ? 'Edit Event' : 'New Event'}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white">
            {isEdit ? 'Update Your Event' : 'Create an Event'}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {isEdit
              ? 'Make changes and save to update the event details.'
              : 'Fill in the details below to list a new music event.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 animate-fade-up anim-delay-2">
          <EventForm eventId={id} />
        </div>

        {/* Tips */}
        <div className="mt-6 animate-fade-up anim-delay-3 bg-gold-400/5 border border-gold-400/20
                         rounded-xl p-5">
          <h4 className="text-gold-400 text-xs font-semibold tracking-wider uppercase mb-2">
            Tips
          </h4>
          <ul className="space-y-1 text-gray-400 text-xs leading-relaxed">
            <li>• Event date must be in the future</li>
            <li>• Available seats will be set equal to total seats on creation</li>
            <li>• Seat count can be reduced later via the booking service integration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}