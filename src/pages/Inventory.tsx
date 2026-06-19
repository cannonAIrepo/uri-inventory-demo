import { useMemo, useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import {
  CATEGORIES,
  getStockStatus,
  type Branch,
  type Category,
  type InventoryItem,
} from '../data/inventory'

interface Props {
  branch: Branch
  items: InventoryItem[]
}

type CategoryFilter = 'All' | Category

export default function Inventory({ branch, items }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (category !== 'All' && it.category !== category) return false
      if (!q) return true
      return (
        it.partNumber.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.supplier.toLowerCase().includes(q)
      )
    })
  }, [items, query, category])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {branch.name} · {branch.city}, {branch.state} ·{' '}
            <span className="tabular-nums">{filtered.length}</span> of{' '}
            <span className="tabular-nums">{items.length}</span> parts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
            Export CSV
          </button>
          <button className="text-sm px-3 py-1.5 rounded-md bg-uri text-white hover:bg-uri-dark shadow-sm">
            + New Part
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg ring-1 ring-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by part #, description, or supplier..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uri/40 focus:border-uri/60"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-uri/40"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 w-8"></th>
                <th className="px-4 py-2.5 font-semibold">Part #</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 font-semibold text-right">Branch Qty</th>
                <th className="px-4 py-2.5 font-semibold text-right">Reorder Pt</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Last Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    No parts match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((it) => {
                const status = getStockStatus(it)
                const isOpen = expanded === it.partNumber
                return (
                  <FragmentRow
                    key={it.partNumber}
                    item={it}
                    status={status}
                    isOpen={isOpen}
                    onToggle={() =>
                      setExpanded(isOpen ? null : it.partNumber)
                    }
                  />
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700 tabular-nums">
              {filtered.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700 tabular-nums">
              {items.length}
            </span>{' '}
            parts
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed"
              disabled
            >
              ‹ Prev
            </button>
            <span className="px-2 py-1 text-slate-700">Page 1 of 1</span>
            <button
              className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed"
              disabled
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FragmentRowProps {
  item: InventoryItem
  status: ReturnType<typeof getStockStatus>
  isOpen: boolean
  onToggle: () => void
}

function FragmentRow({ item, status, isOpen, onToggle }: FragmentRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={[
          'border-b border-slate-100 cursor-pointer transition-colors',
          isOpen ? 'bg-uri/5' : 'hover:bg-slate-50',
        ].join(' ')}
      >
        <td className="px-4 py-3 text-slate-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </td>
        <td className="px-4 py-3 font-mono text-slate-700">{item.partNumber}</td>
        <td className="px-4 py-3 text-slate-900">{item.description}</td>
        <td className="px-4 py-3 text-slate-600">{item.category}</td>
        <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">
          {item.qty}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
          {item.reorderPt}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={status} />
        </td>
        <td className="px-4 py-3 text-slate-600 tabular-nums">{item.lastReceived}</td>
      </tr>
      {isOpen && (
        <tr className="bg-slate-50/70 border-b border-slate-200">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <DetailCell label="Supplier" value={item.supplier} />
              <DetailCell label="Lead Time" value={item.leadTime} />
              <DetailCell label="Last PO #" value={item.lastPo} />
              <DetailCell
                label="Stock vs Reorder"
                value={`${item.qty} / ${item.reorderPt} (${Math.round(
                  (item.qty / Math.max(1, item.reorderPt)) * 100,
                )}%)`}
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                Request Transfer
              </button>
              <button className="text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                Create PO
              </button>
              <button className="text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                View History
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </div>
      <div className="text-slate-900 mt-0.5">{value}</div>
    </div>
  )
}
