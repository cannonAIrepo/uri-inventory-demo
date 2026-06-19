import { useMemo, useState } from 'react'
import { BRANCHES, INVENTORY_BY_BRANCH, ACTIVITY_BY_BRANCH, type BranchId } from './data/inventory'
import TopNav from './components/TopNav'
import Sidebar, { type PageKey } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import ComingSoon from './pages/ComingSoon'
import Footer from './components/Footer'

export default function App() {
  const [branchId, setBranchId] = useState<BranchId>('001')
  const [page, setPage] = useState<PageKey>('dashboard')

  const branch = useMemo(
    () => BRANCHES.find((b) => b.id === branchId)!,
    [branchId],
  )
  const items = INVENTORY_BY_BRANCH[branchId]
  const activity = ACTIVITY_BY_BRANCH[branchId]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav branchId={branchId} onBranchChange={setBranchId} />
      <div className="flex flex-1 min-h-0">
        <Sidebar active={page} onSelect={setPage} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {page === 'dashboard' && (
              <Dashboard branch={branch} items={items} activity={activity} />
            )}
            {page === 'inventory' && (
              <Inventory branch={branch} items={items} />
            )}
            {page === 'transfers' && (
              <ComingSoon
                title="Branch Transfer Requests"
                description="Request inventory transfers between branches, track status, and get automated reorder suggestions."
              />
            )}
            {page === 'orders' && (
              <ComingSoon
                title="Purchase Orders"
                description="Create and track POs to suppliers, monitor receiving, and reconcile invoices."
              />
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
