import { useState, useEffect } from 'react'
import { RefreshCw, Shield, User, Mail } from 'lucide-react'
import { getAllProfiles, updateProfile } from '../../services/api'
import { formatDate, capitalize } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ROLES = ['student', 'staff', 'admin']

export default function AdminUsersPage() {
  const toast    = useToast()
  const { profile: me } = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [updating, setUpdating] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getAllProfiles()
      setUsers(data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleRoleChange(userId, role) {
    if (userId === me?.id) return toast.warning('You cannot change your own role.')
    setUpdating(userId)
    try {
      await updateProfile(userId, { role })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      toast.success(`Role updated to "${role}"`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor = {
    admin:   'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    staff:   'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    student: 'bg-slate-700 text-slate-300 border border-slate-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} registered users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 mb-6"
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" icon={User} />
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]" aria-label="Users management table">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">User</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Phone</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Role</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-400">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-800/50 transition-colors ${user.id === me?.id ? 'bg-indigo-500/5' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{user.full_name}</p>
                          {user.id === me?.id && <p className="text-xs text-indigo-400">(You)</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-600" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor[user.role] || roleColor.student}`}>
                        {capitalize(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          disabled={updating === user.id || user.id === me?.id}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 text-xs focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Change role for ${user.full_name}`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{capitalize(r)}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
