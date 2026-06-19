import { useMemo } from 'react'
import {
  getStockStatus,
  type ActivityEntry,
  type Branch,
  type InventoryItem,
} from '../data/inventory'

interface Props {
  branch: Branch
  items: InventoryItem[]
  activity: ActivityEntry[]
}

interface SummaryCardProps {
  label: string
  value: number | string
  tone: 'neutral' | 'green' | 'amber' | 'red'
  hint?: string
  icon: JSX.Element
}

const toneStyles: Record<SummaryCardProps['tone'], { ring: string; text: string; bg: string }> = {
  neutral: {
    ring: 'ring-slate-200',
    text: 'text-slate-900',
    bg: 'bg-slate-100 text-slate-600',
  },
  green: {
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
    bg: 'bg-emerald-100 text-emerald-600',
  },
  amber: {
    ring: 'ring-amber-200',
    text: 'text-amber-700',
    bg: 'bg-amber-100 text-amber-600',
  },
  red: {
    ring: 'ring-red-200',
    text: 'text-red-700',
    bg: 'bg-red-100 text-red-600',
  },
}

function SummaryCard({ label, value, tone, hint, icon }: SummaryCardProps) {
  const s = toneStyles[tone]
  return (
    <div className={`bg-white rounded-lg p-4 ring-1 ${s.ring} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {label}
          </div>
          <div className={`mt-1 text-3xl font-bold ${s.text}`}>{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${s.bg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function activityIcon(type: ActivityEntry['type']) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center'
  switch (type) {
    case 'transfer':
      return (
        <div className={`${base} bg-uri/10 text-uri`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M7 16l-4-4 4-4m10-4l4 4-4 4M3 12h14M21 12H7" />
          </svg>
        </div>
      )
    case 'order':
      return (
        <div className={`${base} bg-emerald-100 text-emerald-700`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 12l2 2 4-4M5 7h14M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M5 7L7 3h10l2 4" />
          </svg>
        </div>
      )
    case 'alert':
      return (
        <div className={`${base} bg-red-100 text-red-700`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
      )
    case 'adjustment':
    default:
      return (
        <div className={`${base} bg-amber-100 text-amber-700`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
          </svg>
        </div>
      )
  }
}

export default function Dashboard({ branch, items, activity }: Props) {
  const stats = useMemo(() => {
    let inStock = 0
    let low = 0
    let critical = 0
    for (const it of items) {
      const s = getStockStatus(it)
      if (s === 'in-stock') inStock++
      else if (s === 'low') low++
      else critical++
    }
    return { total: items.length, inStock, low, critical }
  }, [items])

  const topLowStock = useMemo(() => {
    return [...items]
      .filter((it) => getStockStatus(it) !== 'in-stock')
      .map((it) => ({
        ...it,
        pct: Math.round((it.qty / Math.max(1, it.reorderPt)) * 100),
      }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 5)
  }, [items])

  const maxPct = Math.max(100, ...topLowStock.map((i) => i.pct))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {branch.name} · {branch.city}, {branch.state} · {branch.role}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Synced 2 minutes ago
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total SKUs"
          value={stats.total}
          tone="neutral"
          hint="Active part numbers"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        />
        <SummaryCard
          label="In Stock"
          value={stats.inStock}
          tone="green"
          hint="Above reorder point"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <SummaryCard
          label="Low Stock"
          value={stats.low}
          tone="amber"
          hint="At or below reorder point"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Critical"
          value={stats.critical}
          tone="red"
          hint="≤25% of reorder pt"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 shadow-sm p-5">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-semibold text-slate-900">Top 5 Low-Stock Items</h2>
            <span className="text-xs text-slate-500">% of reorder point</span>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Items most at risk relative to their reorder threshold.
          </p>

          {topLowStock.length === 0 ? (
            <div className="text-sm text-slate-500 py-10 text-center">
              All items above reorder point — nothing to flag.
            </div>
          ) : (
            <div className="space-y-3">
              {topLowStock.map((it) => {
                const widthPct = Math.min(100, (it.pct / maxPct) * 100)
                const barColor =
                  it.pct === 0
                    ? 'bg-red-500'
                    : it.pct <= 25
                      ? 'bg-red-400'
                      : it.pct <= 100
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                return (
                  <div key={it.partNumber}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-slate-500 shrink-0">{it.partNumber}</span>
                        <span className="text-slate-700 truncate">{it.description}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 shrink-0 ml-3">
                        <span className="tabular-nums">
                          {it.qty} / {it.reorderPt}
                        </span>
                        <span className="font-semibold text-slate-900 tabular-nums w-12 text-right">
                          {it.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg ring-1 ring-slate-200 shadow-sm p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-xs text-uri hover:underline">View all</button>
          </div>
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                {activityIcon(a.type)}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-800 leading-snug">
                    {a.message}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{a.timestamp}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
