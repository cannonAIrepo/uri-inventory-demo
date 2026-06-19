import type { StockStatus } from '../data/inventory'

interface Props {
  status: StockStatus
  size?: 'sm' | 'md'
}

const labels: Record<StockStatus, string> = {
  critical: 'Critical',
  low: 'Low Stock',
  'in-stock': 'In Stock',
}

const classes: Record<StockStatus, string> = {
  critical: 'bg-red-100 text-red-700 ring-red-200',
  low: 'bg-amber-100 text-amber-800 ring-amber-200',
  'in-stock': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full ring-1 font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        classes[status],
      ].join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          status === 'critical' && 'bg-red-500',
          status === 'low' && 'bg-amber-500',
          status === 'in-stock' && 'bg-emerald-500',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {labels[status]}
    </span>
  )
}
