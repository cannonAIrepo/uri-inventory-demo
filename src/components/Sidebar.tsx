export type PageKey = 'dashboard' | 'inventory' | 'transfers' | 'orders'

interface NavItem {
  key: PageKey
  label: string
  icon: JSX.Element
}

const items: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM3 21h8v-6H3v6zM13 3v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M21 8L12 3 3 8m18 0v8l-9 5-9-5V8m18 0l-9 5m0 0L3 8m9 5v8" />
      </svg>
    ),
  },
  {
    key: 'transfers',
    label: 'Transfers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M7 16l-4-4 4-4m10-4l4 4-4 4M3 12h14M21 12H7" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

interface Props {
  active: PageKey
  onSelect: (key: PageKey) => void
}

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 py-4">
      <nav className="flex flex-col gap-1 px-3">
        {items.map((it) => {
          const isActive = active === it.key
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left',
                isActive
                  ? 'bg-uri text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500'}>{it.icon}</span>
              <span className="font-medium">{it.label}</span>
              {(it.key === 'transfers' || it.key === 'orders') && (
                <span
                  className={[
                    'ml-auto text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  Soon
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mx-3 mt-6 pt-4 border-t border-slate-200">
        <div className="px-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
          Support
        </div>
        <div className="px-3 text-xs text-slate-500 leading-relaxed">
          Demo build for prospect review.<br />Contact CannonAI for full deployment.
        </div>
      </div>
    </aside>
  )
}
