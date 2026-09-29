import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Browse Items',   to: '/browse' },
    { label: 'Report Lost',    to: '/report-lost' },
    { label: 'Report Found',   to: '/report-found' },
    { label: 'Dashboard',      to: '/dashboard' },
  ],
  Support: [
    { label: 'How It Works',   to: '/#how-it-works' },
    { label: 'Sign In',        to: '/login' },
    { label: 'Register',       to: '/register' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="CampusFind Logo" className="h-12 w-auto object-contain filter brightness-0 invert opacity-90" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Helping university students and staff reconnect with their lost belongings. Fast, secure, and built for campus life.
            </p>

          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-sm">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm">
            <Mail className="w-3.5 h-3.5" />
            <span>support@campusfind.edu</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialBtn({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
    >
      <Icon className="w-4 h-4" />
    </a>
  )
}
