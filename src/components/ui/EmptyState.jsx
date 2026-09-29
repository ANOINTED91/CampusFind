import { Package } from 'lucide-react'

/**
 * @param {{ title?: string, message?: string, action?: React.ReactNode, icon?: React.Component }} props
 */
export default function EmptyState({ title = 'Nothing here yet', message, action, icon: Icon = Package }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
      {message && <p className="text-slate-500 text-sm max-w-sm leading-relaxed">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
