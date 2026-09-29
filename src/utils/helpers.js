/**
 * Format a date string to a readable format
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param {string} dateString
 * @returns {string}
 */
export function timeAgo(dateString) {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000 },
    { label: 'week',   seconds: 604800 },
    { label: 'day',    seconds: 86400 },
    { label: 'hour',   seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  return 'Just now'
}

/**
 * Truncate text to a max length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Generate a unique file path for storage
 * @param {string} userId
 * @param {File} file
 * @returns {string}
 */
export function generateStoragePath(userId, file) {
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  return `${userId}/${timestamp}.${ext}`
}

/**
 * Get Tailwind color class for item type badge
 * @param {'lost'|'found'} type
 * @returns {string}
 */
export function getTypeBadgeClass(type) {
  return type === 'lost'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
}

/**
 * Get Tailwind color class for item status badge
 * @param {string} status
 * @returns {string}
 */
export function getStatusBadgeClass(status) {
  const map = {
    active:    'bg-blue-100 text-blue-700 border border-blue-200',
    claimed:   'bg-amber-100 text-amber-700 border border-amber-200',
    recovered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    closed:    'bg-slate-100 text-slate-600 border border-slate-200',
  }
  return map[status] || map.active
}

/**
 * Get Tailwind color class for claim status badge
 * @param {string} status
 * @returns {string}
 */
export function getClaimStatusBadgeClass(status) {
  const map = {
    pending:  'bg-amber-100 text-amber-700 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border border-red-200',
  }
  return map[status] || map.pending
}

/**
 * Capitalise first letter
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
