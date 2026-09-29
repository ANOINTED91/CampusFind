import { useState } from 'react'
import { User, Mail, Phone, Camera, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateProfile } from '../services/api'
import { USER_ROLES } from '../lib/constants'
import { capitalize } from '../utils/helpers'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const toast = useToast()

  const [form, setForm]         = useState({
    full_name: profile?.full_name || '',
    phone:     profile?.phone     || '',
  })
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validate() {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await updateProfile(profile.id, form)
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const roleColor = {
    admin:   'bg-violet-100 text-violet-700 border border-violet-200',
    staff:   'bg-blue-100 text-blue-700 border border-blue-200',
    student: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar / identity card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 mb-8 text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold shadow-lg">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
            <p className="text-indigo-200 mt-0.5">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-medium">
              {capitalize(profile?.role || 'student')}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Information</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input id="profile-name" type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  errors.full_name ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`} />
            </div>
            {errors.full_name && <p className="mt-1.5 text-xs text-red-600">{errors.full_name}</p>}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={profile?.email || ''} disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed" />
            </div>
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input id="profile-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${roleColor[profile?.role] || roleColor.student}`}>
              {capitalize(profile?.role || 'student')}
            </span>
            <p className="mt-1 text-xs text-slate-400">Contact an administrator to change your role.</p>
          </div>

          <button id="save-profile-btn" type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all">
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mt-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Account Information</h3>
        <div className="space-y-2 text-sm text-slate-500">
          <p>Member since: <span className="font-medium text-slate-700">{new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          <p>Account ID: <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{profile?.id?.slice(0, 8)}…</code></p>
        </div>
      </div>
    </div>
  )
}
