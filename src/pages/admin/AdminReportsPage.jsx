import { useState, useEffect } from 'react'
import { Trash2, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getItems, deleteItem, updateItem } from '../../services/api'
import { formatDate, getTypeBadgeClass, getStatusBadgeClass, capitalize } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const STATUSES = ['active', 'claimed', 'recovered', 'closed']

export default function AdminReportsPage() {
  const toast = useToast()
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [filterType, setFilterType] = useState('')
  const [search, setSearch]         = useState('')

  async function load() {
    setLoading(true)
    try {
      const { data } = await getItems({ type: filterType || undefined, limit: 100 })
      setItems(data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterType])

  async function handleStatusChange(id, status) {
    try {
      const updated = await updateItem(id, { status })
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: updated.status } : i))
      toast.success(`Status updated to "${status}"`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteItem(deleteTarget)
      setItems(prev => prev.filter(i => i.id !== deleteTarget))
      toast.success('Item report deleted')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filtered = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Reports</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} total items</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search reports…"
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-64"
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No reports" message="No item reports found." />
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]" aria-label="Admin reports table">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Item</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Type</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Category</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Location</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-400">Date</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url
                          ? <img src={item.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          : <div className="w-9 h-9 rounded-lg bg-slate-700 shrink-0" />}
                        <span className="font-medium text-slate-200 line-clamp-1 max-w-[180px]">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{item.category}</td>
                    <td className="px-5 py-4 text-slate-400 max-w-[140px] truncate">{item.location}</td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value)}
                          className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          aria-label={`Change status of ${item.title}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(item.date_occurred)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/items/${item.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          aria-label="View item">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Delete item">
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
        title="Delete Item Report"
        message="This will permanently delete this report and any associated claims."
        confirmLabel="Delete Report"
        loading={deleting}
      />
    </div>
  )
}
