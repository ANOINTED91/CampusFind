import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, AlertCircle, CheckCircle, ArrowRight,
  Shield, Clock, Bell, Users, Package,
} from 'lucide-react'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'
import { getRecentItems } from '../services/api'

const steps = [
  {
    icon: AlertCircle,
    color: 'from-rose-500 to-pink-600',
    title: 'Report an Item',
    desc: 'Lost or found something? Report it in under 2 minutes with photos and details.',
  },
  {
    icon: Search,
    color: 'from-indigo-500 to-violet-600',
    title: 'Search & Browse',
    desc: 'Search our database with smart filters to find matching item descriptions.',
  },
  {
    icon: Bell,
    color: 'from-emerald-500 to-teal-600',
    title: 'Submit a Claim',
    desc: 'Found your item? Submit a claim with proof and await admin approval.',
  },
  {
    icon: CheckCircle,
    color: 'from-amber-500 to-orange-500',
    title: 'Get Reunited',
    desc: 'Once verified, collect your belongings from the campus lost & found office.',
  },
]

const stats = [
  { value: '500+', label: 'Items Reported', icon: Package },
  { value: '350+', label: 'Items Recovered', icon: CheckCircle },
  { value: '2K+',  label: 'Active Users',   icon: Users },
  { value: '98%',  label: 'Satisfaction',   icon: Shield },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [recentItems, setRecentItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    getRecentItems(8)
      .then(setRecentItems)
      .catch(console.error)
      .finally(() => setLoadingItems(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/browse?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
            <MapPin className="w-4 h-4" />
            Your Campus Lost & Found Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Lost Something on{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Campus?
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            CampusFind connects students and staff with their lost belongings. Report, search, and reclaim items — all in one secure platform.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 bg-white rounded-2xl p-2 shadow-2xl">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                id="hero-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a lost item… (e.g. blue backpack)"
                className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none py-2"
                aria-label="Search items"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/report-lost"
              id="hero-report-lost"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base shadow-lg hover:shadow-rose-500/30 hover:-translate-y-1 transition-all"
            >
              <AlertCircle className="w-5 h-5" />
              Report Lost Item
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/report-found"
              id="hero-report-found"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Report Found Item
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 0 720 60 0 20L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                <stat.icon className="w-7 h-7 text-indigo-500 mx-auto mb-3" />
                <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Items ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Recently Reported</h2>
              <p className="text-slate-500 mt-1">Latest lost and found items on campus</p>
            </div>
            <Link
              to="/browse"
              id="view-all-items"
              className="group flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingItems ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No items reported yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-4">How It Works</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Fast & Secure</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Four easy steps to reunite with your lost belongings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Item?</h2>
          <p className="text-indigo-200 text-lg mb-10">Join thousands of students and staff using CampusFind every day.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="cta-register-banner"
              className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/browse"
              className="px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
