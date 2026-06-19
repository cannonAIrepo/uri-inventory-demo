import { BRANCHES, type BranchId } from '../data/inventory'

interface Props {
  branchId: BranchId
  onBranchChange: (id: BranchId) => void
}

export default function TopNav({ branchId, onBranchChange }: Props) {
  return (
    <header className="bg-navy text-white shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-uri flex items-center justify-center font-bold text-sm tracking-wide">
              URI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">United Refrigeration Inc.</span>
              <span className="text-xs text-slate-300">Inventory Management</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Azure-hosted · URI Tenant</span>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-300 hidden sm:inline">Branch</span>
            <select
              value={branchId}
              onChange={(e) => onBranchChange(e.target.value as BranchId)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-uri/60"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
          </label>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-uri-light flex items-center justify-center text-xs font-semibold">
              JM
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">J. Martinez</div>
              <div className="text-xs text-slate-400">Branch Manager</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
