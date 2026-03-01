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

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"

function EditForm({ bazaar, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: bazaar.name || '',
    address: bazaar.address || '',
    area: bazaar.area || '',
    parliament: bazaar.parliament || '',
    state: bazaar.state || '',
    lat: bazaar.lat || '',
    lng: bazaar.lng || '',
    opening_time: bazaar.opening_time || '',
    closing_time: bazaar.closing_time || '',
    stall_count: bazaar.stall_count || '',
    organiser: bazaar.organiser || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('bazaars')
      .update({
        name: form.name,
        address: form.address,
        area: form.area,
        parliament: form.parliament || null,
        state: form.state,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        opening_time: form.opening_time || null,
        closing_time: form.closing_time || null,
        stall_count: form.stall_count ? parseInt(form.stall_count) : null,
        organiser: form.organiser || null,
      })
      .eq('id', bazaar.id)
    setSaving(false)
    if (error) {
      setError('Failed to save. Please try again.')
    } else {
      onSave()
    }
  }

  return (
    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Edit Details</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Name</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Address</label>
          <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Neighbourhood</label>
          <input type="text" value={form.area} onChange={e => set('area', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Area (Parliament)</label>
          <input type="text" value={form.parliament} onChange={e => set('parliament', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">State</label>
          <select value={form.state} onChange={e => set('state', e.target.value)} className={inputClass}>
            <option>Kuala Lumpur</option>
            <option>Selangor</option>
            <option>Putrajaya</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Organiser</label>
          <input type="text" value={form.organiser} onChange={e => set('organiser', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Latitude</label>
          <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Longitude</label>
          <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Opening Time</label>
          <input type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Closing Time</label>
          <input type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Stall Count</label>
          <input type="number" value={form.stall_count} onChange={e => set('stall_count', e.target.value)} className={inputClass} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-forest text-white text-sm font-semibold rounded-lg py-2 hover:bg-green-800 transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg py-2 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
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
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

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

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, bazaars(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    setFeedback(data || [])
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
          <p className="text-sm text-gray-400 mt-0.5">BazaarMana</p>
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

                  {/* Inline edit form */}
                  {editingId === b.id && (
                    <EditForm
                      bazaar={b}
                      onSave={() => { setEditingId(null); fetchPending() }}
                      onCancel={() => setEditingId(null)}
                    />
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
                      onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                      className="bg-blue-50 text-blue-500 text-sm font-semibold rounded-lg px-3 py-2 hover:bg-blue-100 transition"
                    >
                      ✏️
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