import { useNavigate } from 'react-router-dom'

function LogoIcon() {
  return (
    <div className="relative w-20 h-20 animate-float">
      {/* Outer ring */}
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="logo-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle cx="40" cy="40" r="38" fill="url(#logo-grad-light)" />
        {/* Abstract connection lines */}
        <circle cx="40" cy="40" r="28" fill="none" stroke="url(#logo-grad)" strokeWidth="1.5" strokeDasharray="4 6" className="animate-spin-slow origin-center" />
        {/* Core diamond */}
        <path d="M40 18 L56 40 L40 62 L24 40 Z" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round" />
        {/* Inner dot */}
        <circle cx="40" cy="40" r="6" fill="url(#logo-grad)" />
        {/* Connection nodes */}
        <circle cx="40" cy="18" r="3" fill="#6366f1" />
        <circle cx="56" cy="40" r="3" fill="#7c3aed" />
        <circle cx="40" cy="62" r="3" fill="#8b5cf6" />
        <circle cx="24" cy="40" r="3" fill="#6366f1" />
      </svg>
    </div>
  )
}

const STEP_ICONS = [
  // Upload icon
  <svg key="upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>,
  // AI analyze icon
  <svg key="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
  </svg>,
  // Report icon
  <svg key="report" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>,
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <LogoIcon />

        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-1 tracking-tight">
          圈友解码<span className="text-indigo-500 ml-1">crush</span>
        </h1>
        <p className="text-sm text-indigo-400 font-medium mb-6">朋友圈社交分析助手</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-[280px]">
          帮你解读生成 crush 专属攻略
        </p>

        {/* Steps */}
        <div className="w-full max-w-xs space-y-3 mb-10">
          {[
            { title: '上传截图', desc: '上传 TA 的朋友圈截图' },
            { title: 'AI 分析', desc: '智能解读 TA 的性格与喜好' },
            { title: '获取攻略', desc: '收获专属追求行动指南' },
          ].map((step, i) => (
            <div
              key={i}
              className="glass rounded-2xl px-4 py-3 flex items-center gap-4 text-left card-float animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0">
                {STEP_ICONS[i]}
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">{step.title}</p>
                <p className="text-gray-400 text-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="w-full max-w-xs bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold py-4 rounded-2xl text-lg shadow-[0_8px_30px_rgba(99,82,204,0.3)] active:scale-[0.97] transition-all hover:shadow-[0_8px_40px_rgba(99,82,204,0.4)]"
        >
          开始分析
        </button>
      </div>

      <div className="text-center mt-8 text-xs text-gray-400/70 leading-relaxed">
        <p>上传的图片仅用于 AI 分析，不会被存储</p>
        <p className="mt-1">分析结果仅供参考，请理性对待</p>
      </div>
    </div>
  )
}
