import { useState, type ReactNode } from 'react'

interface Props {
  title: string
  icon: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  index?: number
}

export default function ReportSection({ title, icon, children, defaultOpen = true, index = 0 }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="glass rounded-2xl overflow-hidden mb-4 card-float animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="font-bold text-gray-800 text-sm">{title}</span>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}
