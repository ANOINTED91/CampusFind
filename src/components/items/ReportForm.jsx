import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image, MapPin, Calendar, Tag, FileText, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createItem, uploadItemImage } from '../../services/api'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../../lib/constants'

/**
 * Shared report form for both Lost and Found items
 * @param {{ type: 'lost'|'found' }} props
 */
export default function ReportForm({ type }) {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const toast       = useToast()
  const fileRef     = useRef(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date_occurred: new Date().toISOString().split('T')[0],
  })
  const [image, setImage]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }))
  }

  function handleImageFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')
    if (file.size > 5 * 1024 * 1024)     return toast.error('Image must be under 5 MB')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleFileInput(e) {
    handleImageFile(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleImageFile(e.dataTransfer.files[0])
  }

  function removeImage() {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function validate() {
    const e = {}
    if (!form.title.trim())       e.title       = 'Item title is required'
    if (!form.category)           e.category    = 'Please select a category'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location)           e.location    = 'Please select a location'
    if (!form.date_occurred)      e.date_occurred = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      let image_url = null
      if (image) {
        image_url = await uploadItemImage(profile.id, image)
      }
      const item = await createItem({
        ...form,
        type,
        user_id: profile.id,
        image_url,
        status: 'active',
      })
      toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`)
      navigate(`/items/${item.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const isLost = type === 'lost'
  const accent  = isLost ? 'indigo' : 'emerald'
  const accentCls = isLost
    ? 'from-rose-500 to-pink-600'
    : 'from-emerald-500 to-teal-600'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r ${accentCls} rounded-3xl p-8 mb-8 text-white shadow-xl`}>
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Report a {isLost ? 'Lost' : 'Found'} Item</h1>
        </div>
        <p className="text-white/80 text-sm">
          {isLost
            ? 'Provide as many details as possible to help others identify your item.'
            : "Describe the item you found. We'll help it get back to its owner."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Title */}
        <Field id="item-title" label="Item Title" required error={errors.title} icon={FileText}>
          <input id="item-title" type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder={`e.g. ${isLost ? 'Lost blue Jansport backpack' : 'Found black iPhone 14'}`}
            className={inputCls(errors.title)} />
        </Field>

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field id="item-category" label="Category" required error={errors.category} icon={Tag}>
            <select id="item-category" value={form.category} onChange={e => set('category', e.target.value)}
              className={inputCls(errors.category)}>
              <option value="">Select category…</option>
              {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field id="item-location" label={isLost ? 'Last Seen Location' : 'Found Location'} required error={errors.location} icon={MapPin}>
            <select id="item-location" value={form.location} onChange={e => set('location', e.target.value)}
              className={inputCls(errors.location)}>
              <option value="">Select location…</option>
              {CAMPUS_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        {/* Date */}
        <Field id="item-date" label={isLost ? 'Date Lost' : 'Date Found'} required error={errors.date_occurred} icon={Calendar}>
          <input id="item-date" type="date" value={form.date_occurred}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => set('date_occurred', e.target.value)}
            className={inputCls(errors.date_occurred)} />
        </Field>

        {/* Description */}
        <Field id="item-description" label="Description" required error={errors.description}>
          <textarea id="item-description" value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} placeholder="Describe the item in detail — colour, brand, size, distinguishing features…"
            className={`${inputCls(errors.description)} resize-none`} />
        </Field>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Item Photo <span className="text-slate-400 font-normal">(optional, max 5 MB)</span>
          </label>
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={removeImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors"
                aria-label="Remove image">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'
              }`}
              role="button"
              aria-label="Upload item image"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Image className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Drag & drop an image here</p>
              <p className="text-xs text-slate-400">or click to browse — PNG, JPG, WEBP</p>
              <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Choose File
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} className="sr-only" aria-label="Image file input" />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" id="submit-report-btn" disabled={loading}
            className={`flex-1 px-6 py-3.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${accentCls} hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 transition-all`}>
            {loading ? 'Submitting…' : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ id, label, required, error, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={Icon ? 'relative' : ''}>
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(error) {
  return `w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white ${
    error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
  }`
}
