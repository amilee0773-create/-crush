import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { analyzeImages } from '../services/ark'

const TIPS = [
  '正在解读 TA 的生活密码...',
  '分析 TA 的兴趣爱好中...',
  '为你制定专属攻略...',
  '解码 TA 的社交风格...',
  '生成破冰话题中...',
  '规划约会方案中...',
  '整理送礼建议中...',
]

function AnalyzingIcon() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Outer rotating ring */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="8 12" className="animate-spin-slow origin-center" />
      {/* Middle pulse ring */}
      <circle cx="60" cy="60" r="42" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.4" className="animate-pulse" />
      {/* Inner filled circle */}
      <circle cx="60" cy="60" r="30" fill="url(#ring-grad)" opacity="0.15" />
      <circle cx="60" cy="60" r="20" fill="url(#ring-grad)" opacity="0.3" />
      {/* Core hexagon */}
      <polygon points="60,42 75.6,51 75.6,69 60,78 44.4,69 44.4,51" fill="none" stroke="url(#ring-grad)" strokeWidth="2" />
      <circle cx="60" cy="60" r="5" fill="url(#ring-grad)" />
    </svg>
  )
}

export default function Analyzing() {
  const navigate = useNavigate()
  const { analysisData, setReport, appendReport } = useApp()
  const [tipIndex, setTipIndex] = useState(0)
  const [error, setError] = useState('')
  const [streamStarted, setStreamStarted] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (streamStarted) return
    const timer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [streamStarted])

  useEffect(() => {
    if (!analysisData || started.current) return
    started.current = true
    setReport('')

    analyzeImages(
      analysisData,
      (chunk) => {
        setStreamStarted(true)
        appendReport(chunk)
      },
      () => {
        navigate('/report', { replace: true })
      },
      (err) => {
        setError(err)
      },
    )
  }, [analysisData, navigate, setReport, appendReport])

  if (!analysisData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 mb-4">还没有上传截图</p>
        <button
          onClick={() => navigate('/upload')}
          className="text-indigo-500 font-semibold"
        >
          去上传截图
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-8 h-8">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-gray-700 font-semibold mb-2">分析出错了</p>
        <p className="text-sm text-gray-400 mb-6 break-all">{error}</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-[0_8px_30px_rgba(99,82,204,0.3)]"
        >
          重新上传
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="relative w-32 h-32 mb-8 animate-float">
        <AnalyzingIcon />
      </div>

      <p className="text-lg font-semibold text-gray-700 mb-3">AI 正在解码中...</p>
      <p className="text-sm text-indigo-400 animate-pulse-slow h-6">{TIPS[tipIndex]}</p>

      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            style={{
              animation: 'pulse-slow 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {streamStarted && (
        <p className="mt-6 text-xs text-gray-400">报告生成中，即将跳转...</p>
      )}
    </div>
  )
}
