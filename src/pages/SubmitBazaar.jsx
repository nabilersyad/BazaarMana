import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"

export default function SubmitBazaar() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    area: '',
    state: 'Kuala Lumpur',
    lat: '',
    lng: '',
    opening_time: '15:00',
    closing_time: '22:00',
    stall_count: '',
    organiser: '',
    submitted_by_name: '',
    submitted_by_email: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.name || !form.address || !form.lat || !form.lng) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('bazaars').insert({
      name: form.name,
      address: form.address,
      area: form.area || null,
      state: form.state,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      opening_time: form.opening_time || null,
      closing_time: form.closing_time || null,
      stall_count: form.stall_count ? parseInt(form.stall_count) : null,
      organiser: form.organiser || null,
      submitted_by_name: form.submitted_by_name || null,
      submitted_by_email: form.submitted_by_email || null,
      is_verified: false,
      is_active: true,
    })

    setLoading(false)
    if (error) {
      setError('Submission failed. Please try again.')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center fade-up">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your submission has been received and will be reviewed before it goes live.
        </p>
        <Link
          to="/"
          className="inline-block bg-forest text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-green-800 transition-colors"
        >
          ← Back to map
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-up">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-forest hover:text-green-900 font-medium mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-forest px-5 py-5">
          <h1 className="font-display text-xl font-bold text-white">Submit a Bazaar</h1>
          <p className="text-green-200 text-xs mt-1">Your submission will be reviewed before going live</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">

          <Section title="Basic Info">
            <Field label="Bazaar Name" required>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Bazar Ramadan TTDI"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Full Address" required>
              <textarea
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="e.g. Jalan Wan Kadir 3, TTDI, 60000 Kuala Lumpur"
                rows={2}
                className={`${inputClass} resize-none`}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Area">
                <input
                  type="text"
                  value={form.area}
                  onChange={e => set('area', e.target.value)}
                  placeholder="e.g. TTDI"
                  className={inputClass}
                />
              </Field>
              <Field label="State">
                <select
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  className={inputClass}
                >
                  <option>Kuala Lumpur</option>
                  <option>Selangor</option>
                  <option>Putrajaya</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="GPS Coordinates">
            <p className="text-xs text-gray-400 -mt-2">
              Open{' '}
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-forest underline">
                Google Maps
              </a>
              , find the bazaar location, right-click and copy the coordinates.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" required>
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={e => set('lat', e.target.value)}
                  placeholder="3.1478"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Longitude" required>
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={e => set('lng', e.target.value)}
                  placeholder="101.6953"
                  className={inputClass}
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Time">
                <input
                  type="time"
                  value={form.opening_time}
                  onChange={e => set('opening_time', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Closing Time">
                <input
                  type="time"
                  value={form.closing_time}
                  onChange={e => set('closing_time', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Number of Stalls">
                <input
                  type="number"
                  value={form.stall_count}
                  onChange={e => set('stall_count', e.target.value)}
                  placeholder="e.g. 50"
                  className={inputClass}
                  min="1"
                />
              </Field>
              <Field label="Organiser">
                <input
                  type="text"
                  value={form.organiser}
                  onChange={e => set('organiser', e.target.value)}
                  placeholder="e.g. DBKL"
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section title="Your Details (Optional)">
            <Field label="Your Name">
              <input
                type="text"
                value={form.submitted_by_name}
                onChange={e => set('submitted_by_name', e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </Field>
            <Field label="Email (for follow-up)">
              <input
                type="email"
                value={form.submitted_by_email}
                onChange={e => set('submitted_by_email', e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>
          </Section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Bazaar'}
          </button>

        </form>
      </div>
    </div>
  )
}