import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [bazaars, setBazaars] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [activeTab, setActiveTab] = useState('submissions')

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch pending bazaars when session is available
  useEffect(() => {
    if (session) {
      fetchPending()
      fetchFeedback()
    }
  }, [session])

  const login = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError('Incorrect email or password.')
    setLoginLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setBazaars([])
  }

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bazaars')
      .select('*')
      .eq('is_verified', false)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setBazaars(data || [])
    setLoading(false)
  }

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

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, bazaars(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    setFeedback(data || [])
}

  // Login screen
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="font-display text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to continue</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setLoginError('') }}
              placeholder="Email"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLoginError('') }}
              placeholder="Password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
            {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-forest text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-green-800 transition disabled:opacity-60"
            >
              {loginLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 fade-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pending bazaar submissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchPending(); fetchFeedback() }}
            className="text-sm text-forest font-medium px-3 py-1.5 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-500 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'submissions', label: `Submissions ${bazaars.length > 0 ? `(${bazaars.length})` : ''}` },
          { key: 'feedback', label: `Feedback ${feedback.length > 0 ? `(${feedback.length})` : ''}` },          
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Submissions tab */}
      {activeTab === 'submissions' && (
        <>
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

                  <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{b.address}</p>
                    </div>
                    <span className="shrink-0 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5">
                      Pending
                    </span>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
                    <Meta label="Neighbourhood" value={b.area} />
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
        </>
      )}

      {/* Feedback tab */}
      {activeTab === 'feedback' && (
        <>
          {feedback.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">{feedback.length} feedback item{feedback.length !== 1 ? 's' : ''}</p>
              {feedback.map(f => (
                <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.bazaars?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(f.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {f.submitted_by_name && ` · ${f.submitted_by_name}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0.5">
                      {f.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {f.comment && <p className="text-sm text-gray-600">{f.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  )
}