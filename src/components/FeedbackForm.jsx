import { useState } from 'react'
import { supabase } from '../lib/supabase'

const FEEDBACK_TYPES = [
  { value: 'wrong_location', label: '📍 Pin location is wrong' },
  { value: 'wrong_hours', label: '🕐 Opening hours are incorrect' },
  { value: 'bazaar_closed', label: '🚫 Bazaar no longer exists' },
  { value: 'wrong_info', label: '✏️ Other incorrect information' },
]

export default function FeedbackForm({ bazaarId, onSuccess }) {
  const [type, setType] = useState('')
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!type) {
      setError('Please select a feedback type.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('feedback').insert({
      bazaar_id: bazaarId,
      type,
      comment: comment || null,
      submitted_by_name: name || null,
    })

    setLoading(false)
    if (error) {
      setError('Failed to submit. Please try again.')
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What's wrong?</label>
        <div className="space-y-2">
          {FEEDBACK_TYPES.map(ft => (
            <label key={ft.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="feedback_type"
                value={ft.value}
                checked={type === ft.value}
                onChange={e => setType(e.target.value)}
                className="accent-forest"
              />
              <span className="text-sm text-gray-700">{ft.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell us more..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Anonymous"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-forest text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}