import { Link } from 'react-router-dom'
import { MapPin, Calendar, Tag, ArrowRight } from 'lucide-react'
import { formatDate, getTypeBadgeClass, getStatusBadgeClass, capitalize, truncate } from '../../utils/helpers'

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x260/e2e8f0/94a3b8?text=No+Image'

/**
 * @param {{ item: object, className?: string }} props
 */
export default function ItemCard({ item, className = '' }) {
  return (
    <article
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${className}`}
      aria-label={`${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
        <img
          src={item.image_url || PLACEHOLDER_IMAGE}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { e.target.src = PLACEHOLDER_IMAGE }}
        />
        {/* Type badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getTypeBadgeClass(item.type)} backdrop-blur-sm`}>
            {item.type}
          </span>
        </div>
        {/* Status badge */}
        {item.status !== 'active' && (
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)} backdrop-blur-sm`}>
              {capitalize(item.status)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {item.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-400" />
            {item.category}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            {truncate(item.location, 25)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            {formatDate(item.date_occurred)}
          </span>
        </div>

        {item.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <Link
            to={`/items/${item.id}`}
            id={`view-item-${item.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-600 hover:text-white transition-all group/btn"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
