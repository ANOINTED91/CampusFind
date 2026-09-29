import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search, Menu, X, MapPin, Bell, User, LogOut,
  LayoutDashboard, FileText, Bookmark, Shield, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const navLinks = [
  { to: '/browse',   label: 'Browse Items' },
  { to: '/report-lost',  label: 'Lost Item' },
  { to: '/report-found', label: 'Found Item' },
]

export default function Navbar() {
  const { isAuthenticated, isAdmin, profile } = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
    } catch {
      toast.error('Failed to sign out')
    }
    setUserMenuOpen(false)
    setMobileOpen(false)
  }

  const avatarFallback = profile?.full_name?.charAt(0).toUpperCase() || 'U'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="CampusFind home">
            <img src="/logo.png" alt="CampusFind Logo" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {avatarFallback}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-28 truncate">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fade-in"
                    role="menu"
                    aria-labelledby="user-menu-btn"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                    </div>
                    <MenuLink to="/dashboard"  icon={LayoutDashboard} label="Dashboard"   onClick={() => setUserMenuOpen(false)} />
                    <MenuLink to="/my-reports" icon={FileText}        label="My Reports"  onClick={() => setUserMenuOpen(false)} />
                    <MenuLink to="/my-claims"  icon={Bookmark}        label="My Claims"   onClick={() => setUserMenuOpen(false)} />
                    <MenuLink to="/profile"    icon={User}            label="Profile"     onClick={() => setUserMenuOpen(false)} />
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="cta-register-nav"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-1 animate-slide-in shadow-lg">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </NavLink>
          )}
          <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard"  onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">Dashboard</NavLink>
                <NavLink to="/my-reports" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">My Reports</NavLink>
                <NavLink to="/my-claims"  onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">My Claims</NavLink>
                <NavLink to="/profile"    onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">Profile</NavLink>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
      )}
    </header>
  )
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
          isActive ? 'text-indigo-700 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
        }`
      }
      role="menuitem"
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  )
}
