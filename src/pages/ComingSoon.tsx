interface Props {
  title: string
  description: string
}

export default function ComingSoon({ title, description }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-lg ring-1 ring-slate-200 shadow-sm p-10 max-w-xl text-center">
        <div className="w-14 h-14 rounded-full bg-uri/10 text-uri mx-auto flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
            <path d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{description}</p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Coming Soon
        </div>
      </div>
    </div>
  )
}
