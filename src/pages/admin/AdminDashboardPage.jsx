import { useState, useEffect } from 'react'
import { Users, FileText, Bookmark, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '../../services/api'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" className="border-indigo-400 border-t-indigo-200" /></div>

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform-wide statistics and overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <AdminStat label="Total Users"    value={stats?.totalUsers}    icon={Users}       color="indigo" />
        <AdminStat label="Total Reports"  value={stats?.totalItems}    icon={FileText}    color="violet" />
        <AdminStat label="Lost Items"     value={stats?.lostItems}     icon={AlertCircle} color="rose"   />
        <AdminStat label="Found Items"    value={stats?.foundItems}    icon={CheckCircle} color="emerald"/>
        <AdminStat label="Pending Claims" value={stats?.pendingClaims} icon={Bookmark}    color="amber"  />
        <AdminStat label="Recovered"      value={stats?.recoveredItems}icon={TrendingUp}  color="sky"    />
      </div>

      {/* Recovery rate */}
      {stats && stats.totalItems > 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Platform Health</h2>
          <div className="space-y-4">
            <ProgressBar
              label="Recovery Rate"
              value={Math.round((stats.recoveredItems / stats.totalItems) * 100)}
              color="bg-emerald-500"
            />
            <ProgressBar
              label="Found vs Lost Ratio"
              value={stats.totalItems > 0 ? Math.round((stats.foundItems / stats.totalItems) * 100) : 0}
              color="bg-indigo-500"
            />
            <ProgressBar
              label="Claims Pending"
              value={stats.totalClaims > 0 ? Math.round((stats.pendingClaims / stats.totalClaims) * 100) : 0}
              color="bg-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function AdminStat({ label, value, icon, color }) {
  const colors = {
    indigo:  'bg-indigo-500/20 border-indigo-500/30',
    violet:  'bg-violet-500/20 border-violet-500/30',
    rose:    'bg-rose-500/20 border-rose-500/30',
    emerald: 'bg-emerald-500/20 border-emerald-500/30',
    amber:   'bg-amber-500/20 border-amber-500/30',
    sky:     'bg-sky-500/20 border-sky-500/30',
  }
  const iconColors = {
    indigo: 'text-indigo-400', violet: 'text-violet-400', rose: 'text-rose-400',
    emerald: 'text-emerald-400', amber: 'text-amber-400', sky: 'text-sky-400',
  }
  const Icon = icon
  return (
    <div className={`rounded-2xl border ${colors[color]} p-6 flex items-center gap-5`}>
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center`}>
        <Icon className={`w-7 h-7 ${iconColors[color]}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function ProgressBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-slate-300 mb-1.5">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
