import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllClaims, updateClaimStatus } from '../../services/api'
import { formatDate, getClaimStatusBadgeClass, getTypeBadgeClass, capitalize } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminClaimsPage() {
  const toast = useToast()
  const [claims, setClaims]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [processing, setProcessing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getAllClaims()
      setClaims(data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id, status) {
    setProcessing(id)
    try {
      const updated = await updateClaimStatus(id, status)
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c))
      toast.success(`Claim ${status}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessing(null)
    }
  }

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Claims</h1>
          <p className="text-slate-400 text-sm mt-1">{claims.length} total claims</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${claims.length})` : `${capitalize(f)} (${claims.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No claims" message={`No ${filter === 'all' ? '' : filter + ' '}claims found.`} />
      ) : (
        <div className="space-y-4">
          {filtered.map(claim => (
            <div key={claim.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                {/* Item info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getClaimStatusBadgeClass(claim.status)}`}>
                      {capitalize(claim.status)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadgeClass(claim.items?.type)}`}>
                      {claim.items?.type}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {claim.items?.title || 'Unknown Item'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Claimed by: <span className="text-slate-200 font-medium">{claim.profiles?.full_name}</span>
                    {' '}(<span className="text-slate-400">{claim.profiles?.email}</span>)
                  </p>
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm font-medium mb-1">Claim Message:</p>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{claim.message}</p>
                  </div>
                  <p className="text-slate-500 text-xs mt-3">{formatDate(claim.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 shrink-0">
                  <Link to={`/items/${claim.item_id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Item
                  </Link>

                  {claim.status === 'pending' && (
                    <>
                      <button
                        id={`approve-claim-${claim.id}`}
                        onClick={() => handleStatus(claim.id, 'approved')}
                        disabled={processing === claim.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing === claim.id ? 'Processing…' : 'Approve'}
                      </button>
                      <button
                        id={`reject-claim-${claim.id}`}
                        onClick={() => handleStatus(claim.id, 'rejected')}
                        disabled={processing === claim.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/80 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {claim.status !== 'pending' && (
                    <button
                      onClick={() => handleStatus(claim.id, 'pending')}
                      disabled={processing === claim.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
