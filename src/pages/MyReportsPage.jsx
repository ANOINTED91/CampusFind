import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyItems, deleteItem } from '../services/api'
import { formatDate, getTypeBadgeClass, getStatusBadgeClass, capitalize } from '../utils/helpers'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function MyReportsPage() {
  const { profile } = useAuth()
  const toast       = useToast()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [filter, setFilter]       = useState('all')

  useEffect(() => {
    if (!profile) return
    getMyItems(profile.id)
      .then(setItems)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [profile])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteItem(deleteTarget)
      setItems(prev => prev.filter(i => i.id !== deleteTarget))
      toast.success('Report deleted successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to delete report')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  if (loading) return <Spinner fullScreen />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Reports</h1>
          <p className="text-slate-500 mt-1">{items.length} report{items.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <div className="flex gap-3">
          <Link to="/report-lost"  id="my-reports-lost-btn"  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors">
            <Plus className="w-4 h-4" /> Lost Item
          </Link>
          <Link to="/report-found" id="my-reports-found-btn" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> Found Item
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-6">
          {['all', 'lost', 'found'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >{f === 'all' ? 'All' : `${f.charAt(0).toUpperCase() + f.slice(1)} (${items.filter(i => i.type === f).length})`}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No reports yet"
          message="You haven't submitted any item reports. Start by reporting a lost or found item."
          icon={FileText}
          action={
            <Link to="/report-lost" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Your First Report
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]" aria-label="My reports">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Item</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Type</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Category</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                        )}
                        <span className="font-medium text-slate-900 line-clamp-1">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.category}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                        {capitalize(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(item.date_occurred)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/items/${item.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label="View item">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete report">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Report"
        message="This will permanently delete this item report and cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
