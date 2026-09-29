import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Bookmark, Package, AlertCircle, CheckCircle, ArrowRight, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyItems, getMyClaims, getDashboardStats } from '../services/api'
import StatCard from '../components/ui/StatCard'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [myItems, setMyItems]     = useState([])
  const [myClaims, setMyClaims]   = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      getMyItems(profile.id),
      getMyClaims(profile.id),
      getDashboardStats(),
    ]).then(([items, claims, s]) => {
      setMyItems(items)
      setMyClaims(claims)
      setStats(s)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [profile])

  const myLost      = myItems.filter(i => i.type === 'lost')
  const myFound     = myItems.filter(i => i.type === 'found')
  const myRecovered = myItems.filter(i => i.status === 'recovered')

  if (loading) return <Spinner fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your campus activity.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/report-lost"
            id="dash-report-lost"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
          >
            <AlertCircle className="w-4 h-4" />
            Report Lost
          </Link>
          <Link
            to="/report-found"
            id="dash-report-found"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Personal stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        <StatCard label="My Reports"   value={myItems.length}    icon={FileText}    color="indigo" />
        <StatCard label="Lost Items"   value={myLost.length}     icon={AlertCircle} color="rose"   />
        <StatCard label="Found Items"  value={myFound.length}    icon={CheckCircle} color="emerald"/>
        <StatCard label="My Claims"    value={myClaims.length}   icon={Bookmark}    color="violet" />
      </div>

      {/* Global stats */}
      {stats && (
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 mb-12 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-1">Campus Overview</h2>
          <p className="text-indigo-200 text-sm mb-6">Live statistics from CampusFind</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Items',    value: stats.totalItems },
              { label: 'Lost',           value: stats.lostItems },
              { label: 'Found',          value: stats.foundItems },
              { label: 'Recovered',      value: stats.recoveredItems },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-indigo-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My recent reports */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">My Recent Reports</h2>
          <Link to="/my-reports" className="group flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:text-indigo-700">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {myItems.length === 0 ? (
          <EmptyState
            title="No reports yet"
            message="Start by reporting a lost or found item on campus."
            icon={Package}
            action={
              <Link to="/report-lost" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" /> Report Your First Item
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {myItems.slice(0, 4).map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* My claims */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">My Claims</h2>
          <Link to="/my-claims" className="group flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:text-indigo-700">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {myClaims.length === 0 ? (
          <EmptyState
            title="No claims submitted"
            message="Browse found items and submit a claim when you find yours."
            icon={Bookmark}
            action={
              <Link to="/browse?type=found" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Browse Found Items
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm" aria-label="My claims table">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Item</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Type</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myClaims.slice(0, 5).map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">{claim.items?.title}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        claim.items?.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{claim.items?.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        claim.status === 'pending'  ? 'bg-amber-100 text-amber-700'   :
                        claim.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>{claim.status}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
