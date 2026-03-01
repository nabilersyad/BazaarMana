import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FeedbackForm from '../components/FeedbackForm'
import TransitInfo from '../components/TransitInfo'


function formatTime(timeStr) {
  if (!timeStr) return '–'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? 'text-gold' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-base shrink-0 w-5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function ReviewForm({ bazaarId, onSuccess }) {
  const [form, setForm] = useState({ reviewer_name: '', rating: 5, comment: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('reviews').insert({
      bazaar_id: bazaarId,
      reviewer_name: form.reviewer_name || 'Anonymous',
      rating: form.rating,
      comment: form.comment || null,
    })

    setLoading(false)
    if (error) {
      setError('Failed to submit. Please try again.')
    } else {
      setForm({ reviewer_name: '', rating: 5, comment: '' })
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
        <input
          type="text"
          value={form.reviewer_name}
          onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
          placeholder="Anonymous"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setForm(f => ({ ...f, rating: star }))}
              className={`text-2xl transition-transform hover:scale-110 ${
                star <= form.rating ? 'text-gold' : 'text-gray-200'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
        <textarea
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          placeholder="Share your experience..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-forest text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export default function BazaarDetail() {
  const { id } = useParams()
  const [bazaar, setBazaar] = useState(null)
  const [reviews, setReviews] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const fetchData = async () => {
    const [{ data: b }, { data: r }, { data: v }] = await Promise.all([
      supabase.from('bazaars').select('*').eq('id', id).single(),
      supabase.from('reviews').select('*').eq('bazaar_id', id).order('created_at', { ascending: false }),
      supabase.from('vendors').select('*').eq('bazaar_id', id),
    ])
    setBazaar(b)
    setReviews(r || [])
    setVendors(v || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <img src="/BazaarManaLogo.svg" alt="BazaarMana" className="h-12 w-12 mx-auto mb-3 animate-pulse" />
          {/*<div className="text-3xl mb-3 animate-pulse">☽</div>*/}
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!bazaar) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Bazaar not found.</p>
        <Link to="/" className="text-forest text-sm mt-2 inline-block hover:underline">← Back to map</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 fade-up">

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-forest hover:text-green-900 font-medium mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to map
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="bg-forest px-5 py-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-xl font-bold text-white leading-snug">{bazaar.name}</h1>
            {bazaar.is_verified && (
              <span className="shrink-0 text-xs bg-green-700 text-green-100 border border-green-600 rounded-full px-2 py-0.5">
                ✓ Verified
              </span>
            )}
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <span className="text-green-200 text-sm">{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-3">
          <InfoRow icon="📍" label="Address" value={bazaar.address} />
          {bazaar.area && <InfoRow icon="🏘" label="Area" value={bazaar.area} />}
          {bazaar.parliament && <InfoRow icon="🏛" label="Constituency" value={bazaar.parliament} />}
          {bazaar.state && <InfoRow icon="🗺" label="State" value={bazaar.state} />}
          {bazaar.opening_time && (
            <InfoRow icon="🕐" label="Hours" value={`${formatTime(bazaar.opening_time)} – ${formatTime(bazaar.closing_time)}`} />
          )}
          {bazaar.stall_count && <InfoRow icon="🛒" label="Stalls" value={`${bazaar.stall_count} stalls`} />}
          {bazaar.organiser && <InfoRow icon="👥" label="Organiser" value={bazaar.organiser} />}
        </div>

        <div className="px-5 pb-5 flex gap-2 flex-wrap">
          
          <a href={`https://www.google.com/maps?q=${bazaar.lat},${bazaar.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Google Maps
          </a>
          
          <a href={`https://maps.apple.com/?q=${bazaar.lat},${bazaar.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-800 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple Maps
          </a>
          
         <a href={`https://www.openstreetmap.org/?mlat=${bazaar.lat}&mlon=${bazaar.lng}&zoom=17`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-green-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            OpenStreetMap
          </a>
        </div>
      </div>

      {/* Vendors */}
      {vendors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="font-display font-bold text-lg mb-3">Vendors ({vendors.length})</h2>
          <div className="space-y-2">
            {vendors.map(v => (
              <div key={v.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-800">{v.name}</span>
                {v.category && (
                  <span className="text-xs bg-green-50 text-forest border border-green-100 rounded-full px-2 py-0.5">
                    {v.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transit */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-display font-bold text-lg mb-4">Nearby Train Stations</h2>
        <TransitInfo lat={bazaar.lat} lng={bazaar.lng} />
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="text-sm font-medium text-forest hover:text-green-900 transition-colors"
          >
            {showReviewForm ? 'Cancel' : '+ Write a review'}
          </button>
        </div>

        {showReviewForm && (
          <div className="mb-5 p-4 bg-green-50 rounded-xl border border-green-100">
            <ReviewForm
              bazaarId={id}
              onSuccess={() => {
                setShowReviewForm(false)
                fetchData()
              }}
            />
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{r.reviewer_name}</span>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
        {/* Feedback */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Report an Issue</h2>
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showFeedbackForm ? 'Cancel' : '⚑ Report'}
          </button>
        </div>

        {showFeedbackForm && (
          <FeedbackForm
            bazaarId={id}
            onSuccess={() => {
              setShowFeedbackForm(false)
            }}
          />
        )}

        {!showFeedbackForm && (
          <p className="text-xs text-gray-400">
            Something wrong with this listing? Let us know and we'll fix it.
          </p>
        )}
      </div>
    </div>
  )
}