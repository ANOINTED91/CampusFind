/**
 * @param {{ label: string, value: string|number, icon: React.Component, color: string, sub?: string }} props
 */
export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-600',  text: 'text-indigo-700' },
    violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-600',  text: 'text-violet-700' },
    rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-500',    text: 'text-rose-700'   },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700'},
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-700'  },
    sky:     { bg: 'bg-sky-50',     icon: 'bg-sky-500',     text: 'text-sky-700'    },
    slate:   { bg: 'bg-slate-800',  icon: 'bg-slate-600',   text: 'text-slate-300'  },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-5 hover:shadow-lg transition-shadow`}>
      <div className={`${c.icon} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
