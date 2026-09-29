import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyClaims } from '../services/api'
import { formatDate, getClaimStatusBadgeClass, getTypeBadgeClass, capitalize } from '../utils/helpers'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

export default function MyClaimsPage() {
  const { profile } = useAuth()
  const toast       = useToast()
  const [claims, setClaims]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (!profile) return
    getMyClaims(profile.id)
      .then(setClaims)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [profile])

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter)

  if (loading) return <Spinner fullScreen />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Claims</h1>
        <p className="text-slate-500 mt-1">{claims.length} claim{claims.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {/* Filter */}
      {claims.length > 0 && (
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? `All (${claims.length})` : `${capitalize(f)} (${claims.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No claims yet"
          message="Browse found items and submit a claim when you spot your belonging."
          icon={Bookmark}
          action={
            <Link to="/browse?type=found" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Browse Found Items
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(claim => (
            <div key={claim.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex gap-5 items-start">
              {/* Image */}
              {claim.items?.image_url ? (
                <img src={claim.items.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{claim.items?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getTypeBadgeClass(claim.items?.type)}`}>
                        {claim.items?.type}
                      </span>
                      <span className="text-slate-400 text-xs">{claim.items?.category}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getClaimStatusBadgeClass(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                  <span className="font-medium text-slate-700">Your message:</span> {claim.message}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-slate-400">Submitted {formatDate(claim.created_at)}</p>
                  <Link to={`/items/${claim.item_id}`}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    View Item
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
