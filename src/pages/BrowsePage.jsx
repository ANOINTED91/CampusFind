import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getItems } from '../services/api'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../lib/constants'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'

const PAGE_SIZE = 12

const ALL_STATUSES = [
  { value: '',          label: 'All Statuses' },
  { value: 'active',    label: 'Active' },
  { value: 'claimed',   label: 'Claimed' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'closed',    label: 'Closed' },
]

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems]       = useState([])
  const [count, setCount]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage]         = useState(0)

  // Filters from URL
  const search   = searchParams.get('search')   || ''
  const type     = searchParams.get('type')     || ''
  const category = searchParams.get('category') || ''
  const location = searchParams.get('location') || ''
  const status   = searchParams.get('status')   || ''

  // Local filter state (synced from URL)
  const [localSearch, setLocalSearch] = useState(search)

  const fetchItems = useCallback(async (pg = 0) => {
    setLoading(true)
    setError(null)
    try {
      const { data, count: total } = await getItems({
        type: type || undefined,
        category: category || undefined,
        location: location || undefined,
        status: status || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: pg * PAGE_SIZE,
      })
      setItems(data || [])
      setCount(total || 0)
      setPage(pg)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [type, category, location, status, search])

  useEffect(() => {
    fetchItems(0)
  }, [fetchItems])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    updateFilter('search', localSearch)
  }

  function clearFilters() {
    setLocalSearch('')
    setSearchParams({})
  }

  const hasFilters = type || category || location || status || search
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse Items</h1>
        <p className="text-slate-500 mt-1">
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''} found` : 'Search our database of lost & found items'}
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="browse-search"
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by title or description…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors shrink-0 ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />}
          </button>
        </form>

        {/* Filter rows */}
        {showFilters && (
          <div className="border-t border-slate-100 pt-4 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Type */}
              <FilterSelect id="filter-type" label="Type" value={type} onChange={v => updateFilter('type', v)}
                options={[{ value: '', label: 'All Types' }, { value: 'lost', label: 'Lost' }, { value: 'found', label: 'Found' }]} />
              {/* Category */}
              <FilterSelect id="filter-category" label="Category" value={category} onChange={v => updateFilter('category', v)}
                options={[{ value: '', label: 'All Categories' }, ...ITEM_CATEGORIES.map(c => ({ value: c, label: c }))]} />
              {/* Location */}
              <FilterSelect id="filter-location" label="Location" value={location} onChange={v => updateFilter('location', v)}
                options={[{ value: '', label: 'All Locations' }, ...CAMPUS_LOCATIONS.map(l => ({ value: l, label: l }))]} />
              {/* Status */}
              <FilterSelect id="filter-status" label="Status" value={status} onChange={v => updateFilter('status', v)}
                options={ALL_STATUSES} />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search   && <Chip label={`"${search}"`} onRemove={() => { setLocalSearch(''); updateFilter('search', '') }} />}
            {type     && <Chip label={type}     onRemove={() => updateFilter('type', '')}     />}
            {category && <Chip label={category} onRemove={() => updateFilter('category', '')} />}
            {location && <Chip label={location} onRemove={() => updateFilter('location', '')} />}
            {status   && <Chip label={status}   onRemove={() => updateFilter('status', '')}   />}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchItems(page)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          message={hasFilters ? 'Try adjusting your filters or search terms.' : 'No items have been reported yet.'}
          action={hasFilters ? (
            <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Clear Filters
            </button>
          ) : null}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => fetchItems(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => fetchItems(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-indigo-900" aria-label={`Remove ${label} filter`}>
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
