import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

function Meta({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === '1')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [bazaars, setBazaars] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const login = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
    } else {
      setPwError(true)
    }
  }

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bazaars')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
    setBazaars(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (authed) fetchPending()
  }, [authed])

  const approve = async (id) => {
    setActionLoading(id + '_approve')
    await supabase.from('bazaars').update({ is_verified: true }).eq('id', id)
    setActionLoading(null)
    fetchPending()
  }

  const reject = async (id) => {
    setActionLoading(id + '_reject')
    await supabase.from('bazaars').update({ is_active: false }).eq('id', id)
    setActionLoading(null)
    fetchPending()
  }

  const remove = async (id) => {
    if (!confirm('Permanently delete this submission?')) return
    setActionLoading(id + '_delete')
    await supabase.from('bazaars').delete().eq('id', id)
    setActionLoading(null)
    fetchPending()
  }

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="font-display text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Enter password to continue</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError(false) }}
              placeholder="Password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              autoFocus
            />
            {pwError && <p className="text-red-500 text-xs">Incorrect password.</p>}
            <button
              type="submit"
              className="w-full bg-forest text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-green-800 transition"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pending bazaar submissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPending}
            className="text-sm text-forest font-medium px-3 py-1.5 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false) }}
            className="text-sm text-gray-500 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : bazaars.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-400 text-sm">No pending submissions. All clear!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{bazaars.length} submission{bazaars.length !== 1 ? 's' : ''} pending review</p>
          {bazaars.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{b.address}</p>
                </div>
                <span className="shrink-0 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5">
                  Pending
                </span>
              </div>

              {/* Details grid */}
              <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <Meta label="Area" value={b.area} />
                <Meta label="State" value={b.state} />
                <Meta label="Coordinates" value={b.lat && b.lng ? `${b.lat}, ${b.lng}` : null} />
                <Meta label="Stalls" value={b.stall_count ? `${b.stall_count} stalls` : null} />
                <Meta label="Organiser" value={b.organiser} />
                <Meta label="Hours" value={b.opening_time ? `${b.opening_time} – ${b.closing_time}` : null} />
                <Meta label="Submitted by" value={b.submitted_by_name} />
                <Meta label="Email" value={b.submitted_by_email} />
                <Meta
                  label="Submitted on"
                  value={new Date(b.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
              </div>

              {/* Map check link */}
              {b.lat && b.lng && (
                <div className="px-5 pb-3">
                  
                    <a href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest hover:underline"
                  >
                    📍 Check location on Google Maps →
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex gap-2">
                <button
                  onClick={() => approve(b.id)}
                  disabled={!!actionLoading}
                  className="flex-1 bg-forest text-white text-sm font-semibold rounded-lg py-2 hover:bg-green-800 transition disabled:opacity-60"
                >
                  {actionLoading === b.id + '_approve' ? '...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => reject(b.id)}
                  disabled={!!actionLoading}
                  className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg py-2 hover:bg-gray-200 transition disabled:opacity-60"
                >
                  {actionLoading === b.id + '_reject' ? '...' : '✕ Reject'}
                </button>
                <button
                  onClick={() => remove(b.id)}
                  disabled={!!actionLoading}
                  className="bg-red-50 text-red-400 text-sm font-semibold rounded-lg px-3 py-2 hover:bg-red-100 transition disabled:opacity-60"
                >
                  🗑
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}