import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Bookmark, Users, MapPin,
  LogOut, ChevronRight, Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../services/api'
import { useToast } from '../context/ToastContext'

const adminNav = [
  { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/reports',  label: 'Reports',    icon: FileText },
  { to: '/admin/claims',   label: 'Claims',     icon: Bookmark },
  { to: '/admin/users',    label: 'Users',      icon: Users },
]

export default function AdminLayout() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const toast       = useToast()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out')
      navigate('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="flex flex-col gap-2 px-6 py-5 border-b border-slate-800">
          <img src="/logo.png" alt="CampusFind Logo" className="h-10 w-auto object-contain self-start filter brightness-0 invert drop-shadow" />
          <div>
            <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-indigo-400" /> Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
