export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>Prototype · Data is illustrative · CannonAI</div>
        <div className="flex items-center gap-3">
          <span>v0.1.0</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Built with React + Azure Static Web Apps</span>
        </div>
      </div>
    </footer>
  )
}
