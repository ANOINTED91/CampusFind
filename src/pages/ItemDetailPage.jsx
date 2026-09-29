import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Calendar, Tag, User, ArrowLeft, Flag, CheckCircle, Share2, Phone as PhoneIcon, MessageSquare } from 'lucide-react'
import { getItemById, createClaim } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate, getTypeBadgeClass, getStatusBadgeClass, capitalize } from '../utils/helpers'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'

const PLACEHOLDER = 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'

export default function ItemDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { isAuthenticated, profile } = useAuth()
  const toast     = useToast()

  const [item, setItem]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [claimMsg, setClaimMsg]   = useState('')
  const [claimInfo, setClaimInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [claimed, setClaimed]     = useState(false)

  useEffect(() => {
    getItemById(id)
      .then(setItem)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleClaim(e) {
    e.preventDefault()
    if (!claimMsg.trim()) return toast.error('Please enter a claim message')
    setSubmitting(true)
    try {
      await createClaim({
        item_id: id,
        user_id: profile.id,
        message: claimMsg + (claimInfo ? '\n\nAdditional info: ' + claimInfo : ''),
      })
      toast.success('Claim submitted! Awaiting admin review.', 'Claim Sent')
      setClaimed(true)
      setClaimOpen(false)
    } catch (err) {
      if (err.code === '23505') toast.error('You have already submitted a claim for this item.')
      else toast.error(err.message || 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: item.title, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) return <Spinner fullScreen />
  if (error)   return <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); getItemById(id).then(setItem).catch(e => setError(e.message)).finally(() => setLoading(false)) }} />
  if (!item)   return null

  const isOwner    = profile?.id === item.user_id
  const isFound    = item.type === 'found'
  const canClaim   = isAuthenticated && isFound && !isOwner && item.status === 'active' && !claimed
  const imgSrc     = item.image_url || PLACEHOLDER

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-8 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-slate-100 aspect-[4/3] shadow-lg">
          <img src={imgSrc} alt={item.title} className="w-full h-full object-cover"
            onError={e => { e.target.src = PLACEHOLDER }} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getTypeBadgeClass(item.type)}`}>
              {item.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(item.status)}`}>
              {capitalize(item.status)}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{item.title}</h1>

          <p className="text-slate-600 leading-relaxed">{item.description}</p>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <MetaItem icon={Tag}      label="Category" value={item.category}                    />
            <MetaItem icon={MapPin}   label="Location" value={item.location}                    />
            <MetaItem icon={Calendar} label="Date"     value={formatDate(item.date_occurred)}   />
            <MetaItem icon={User}     label="Reported by" value={item.profiles?.full_name || 'Anonymous'} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {item.profiles?.phone && (
              <div className="flex gap-3 mb-2">
                <a
                  href={`tel:${item.profiles.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-bold bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Call
                </a>
                <a
                  href={`https://wa.me/${item.profiles.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-bold bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            )}
            {canClaim && (
              <button
                id="claim-item-btn"
                onClick={() => setClaimOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Claim This Item
              </button>
            )}

            {claimed && (
              <div className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                <CheckCircle className="w-5 h-5" />
                Claim Submitted – Awaiting Review
              </div>
            )}

            {!isAuthenticated && isFound && item.status === 'active' && (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base hover:shadow-lg transition-all"
              >
                Sign In to Claim
              </Link>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              {isOwner && (
                <Link
                  to={`/report-${item.type}?edit=${id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors"
                >
                  Edit Report
                </Link>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Posted {formatDate(item.created_at)}
          </p>
        </div>
      </div>

      {/* Claim modal */}
      <Modal isOpen={claimOpen} onClose={() => setClaimOpen(false)} title="Submit a Claim" size="md">
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label htmlFor="claim-message" className="block text-sm font-medium text-slate-700 mb-1.5">
              Claim Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="claim-message"
              value={claimMsg}
              onChange={e => setClaimMsg(e.target.value)}
              rows={4}
              placeholder="Describe why you believe this is your item… Include details that prove ownership."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>
          <div>
            <label htmlFor="claim-info" className="block text-sm font-medium text-slate-700 mb-1.5">
              Additional Identifying Information <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="claim-info"
              value={claimInfo}
              onChange={e => setClaimInfo(e.target.value)}
              rows={3}
              placeholder="e.g. Serial number, colour inside, unique markings…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setClaimOpen(false)}
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              id="submit-claim-btn"
              className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {submitting ? 'Submitting…' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-semibold">{value || 'N/A'}</p>
      </div>
    </div>
  )
}
