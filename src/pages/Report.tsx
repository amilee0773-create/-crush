import { useNavigate } from 'react-router-dom'
import { useState, type ReactElement, type ReactNode } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useApp } from '../context/AppContext'
import ReportSection from '../components/ReportSection'

// SVG icons for each section
const SECTION_ICONS: Record<string, ReactNode> = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  date: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  roadmap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
}

const SECTION_CONFIG = [
  { pattern: /##\s*一[、.]\s*TA\s*的?人物画像/i, title: 'TA 的人物画像', iconKey: 'profile' },
  { pattern: /##\s*二[、.]\s*破冰聊天攻略/i, title: '破冰聊天攻略', iconKey: 'chat' },
  { pattern: /##\s*三[、.]\s*送礼攻略/i, title: '送礼攻略', iconKey: 'gift' },
  { pattern: /##\s*四[、.]\s*约会方案/i, title: '约会方案', iconKey: 'date' },
  { pattern: /##\s*五[、.]\s*关系推进路线图/i, title: '关系推进路线图', iconKey: 'roadmap' },
  { pattern: /##\s*六[、.]\s*特别提醒/i, title: '特别提醒', iconKey: 'alert' },
]

function parseSections(markdown: string) {
  const sections: { title: string; iconKey: string; content: string }[] = []

  const headingRegex = /^##\s+.+$/gm
  const matches: { index: number; text: string }[] = []
  let match
  while ((match = headingRegex.exec(markdown)) !== null) {
    matches.push({ index: match.index, text: match[0] })
  }

  if (matches.length === 0) {
    return [{ title: '分析报告', iconKey: 'default', content: markdown }]
  }

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i].text
    const start = matches[i].index + heading.length
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length
    const content = markdown.slice(start, end).trim()

    const config = SECTION_CONFIG.find((c) => c.pattern.test(heading))
    sections.push({
      title: config?.title || heading.replace(/^##\s*/, ''),
      iconKey: config?.iconKey || 'default',
      content,
    })
  }

  return sections
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: ReactElement[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />)
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-semibold text-gray-700 mt-3 mb-1.5 text-sm flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full" />
          {line.slice(4)}
        </h3>,
      )
      continue
    }

    const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-800">$1</strong>')

    if (line.match(/^\s*[-*]\s/)) {
      const content = formatted.replace(/^\s*[-*]\s/, '')
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1.5">
          <span className="text-indigo-400 shrink-0 mt-0.5">
            <svg viewBox="0 0 8 8" className="w-2 h-2" fill="currentColor">
              <circle cx="4" cy="4" r="3" />
            </svg>
          </span>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </div>,
      )
      continue
    }

    if (line.match(/^\s*\d+[.)]\s/)) {
      const content = formatted.replace(/^\s*\d+[.)]\s/, '')
      const num = line.match(/^\s*(\d+)/)?.[1]
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1.5">
          <span className="text-violet-500 shrink-0 font-medium text-xs w-4 h-4 rounded bg-violet-100 flex items-center justify-center">{num}</span>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </div>,
      )
      continue
    }

    elements.push(
      <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />,
    )
  }

  return elements
}

// Convert markdown to simple HTML for PDF
function markdownToHTML(text: string): string {
  const lines = text.split('\n')
  let html = ''

  for (const line of lines) {
    if (!line.trim()) {
      html += '<div style="height: 8px;"></div>'
      continue
    }

    if (line.startsWith('### ')) {
      html += `<div style="font-weight: 600; color: #374151; margin-top: 12px; margin-bottom: 6px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="width: 4px; height: 16px; background: linear-gradient(to bottom, #818cf8, #a78bfa); border-radius: 9999px;"></span>
        ${line.slice(4)}
      </div>`
      continue
    }

    const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #1f2937;">$1</strong>')

    if (line.match(/^\s*[-*]\s/)) {
      const content = formatted.replace(/^\s*[-*]\s/, '')
      html += `<div style="display: flex; gap: 8px; margin-left: 4px; margin-bottom: 6px;">
        <span style="color: #818cf8; flex-shrink: 0; margin-top: 6px; width: 6px; height: 6px; background: #818cf8; border-radius: 50%;"></span>
        <span>${content}</span>
      </div>`
      continue
    }

    if (line.match(/^\s*\d+[.)]\s/)) {
      const content = formatted.replace(/^\s*\d+[.)]\s/, '')
      const num = line.match(/^\s*(\d+)/)?.[1]
      html += `<div style="display: flex; gap: 8px; margin-left: 4px; margin-bottom: 6px;">
        <span style="color: #8b5cf6; flex-shrink: 0; font-weight: 500; font-size: 12px; width: 16px; height: 16px; background: #ede9fe; border-radius: 4px; display: flex; align-items: center; justify-content: center;">${num}</span>
        <span>${content}</span>
      </div>`
      continue
    }

    html += `<p style="margin-bottom: 4px;">${formatted}</p>`
  }

  return html
}

// Generate PDF HTML content
function generatePDFHTML(sections: { title: string; iconKey: string; content: string }[]): string {
  const date = new Date().toLocaleDateString('zh-CN')

  const sectionIconsSVG: Record<string, string> = {
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line></svg>',
    date: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    roadmap: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
  }

  let sectionsHTML = ''
  for (const section of sections) {
    const icon = sectionIconsSVG[section.iconKey] || sectionIconsSVG.default
    sectionsHTML += `
      <div style="background: white; border-radius: 16px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f3f4f6;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f9fafb;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center;">
            ${icon}
          </div>
          <span style="font-weight: 700; color: #1f2937; font-size: 14px;">${section.title}</span>
        </div>
        <div style="padding: 16px; font-size: 14px; color: #4b5563; line-height: 1.6;">
          ${markdownToHTML(section.content)}
        </div>
      </div>
    `
  }

  return `
    <div style="width: 375px; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(160deg, #f0f0ff 0%, #e8e6f8 20%, #f4f2ff 40%, #eae8fa 60%, #f0eeff 80%, #e8e5f5 100%);">
      <div style="text-align: center; margin-bottom: 24px; padding-top: 16px;">
        <div style="width: 56px; height: 56px; margin: 0 auto 12px; border-radius: 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <h1 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0;">Crush 分析报告</h1>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">圈友解码 · ${date}</p>
      </div>
      ${sectionsHTML}
      <p style="text-align: center; font-size: 12px; color: #9ca3af; padding: 16px 0;">
        分析结果仅供参考，请理性对待感情
      </p>
    </div>
  `
}

export default function Report() {
  const navigate = useNavigate()
  const { report, setReport, setAnalysisData } = useApp()
  const [downloading, setDownloading] = useState(false)

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 mb-4">还没有分析报告</p>
        <button
          onClick={() => navigate('/upload')}
          className="text-indigo-500 font-semibold"
        >
          去上传截图
        </button>
      </div>
    )
  }

  const sections = parseSections(report)

  const handleReAnalyze = () => {
    setReport('')
    setAnalysisData(null)
    navigate('/upload')
  }

  const handleDownloadPDF = async () => {
    if (downloading) return
    setDownloading(true)

    try {
      // Create temporary container
      const container = document.createElement('div')
      container.innerHTML = generatePDFHTML(sections)
      container.style.position = 'absolute'
      container.style.left = '0'
      container.style.top = '0'
      container.style.zIndex = '-1'
      document.body.appendChild(container)

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100))

      const element = container.firstElementChild as HTMLElement
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })

      // Remove temporary container
      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/png')

      // Create single-page PDF with custom size matching the content
      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = (imgHeightPx * pdfWidth) / imgWidthPx // Scale height proportionally

      // Create PDF with custom height (single long page)
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'p' : 'l',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`crush分析报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF 生成失败，请重试')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_8px_30px_rgba(99,82,204,0.25)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">分析报告</h1>
        <p className="text-xs text-gray-400 mt-1">基于 TA 的朋友圈为你专属定制</p>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <ReportSection
          key={i}
          title={section.title}
          icon={SECTION_ICONS[section.iconKey] || SECTION_ICONS.default}
          defaultOpen={i === 0}
          index={i}
        >
          {renderMarkdown(section.content)}
        </ReportSection>
      ))}

      {/* Actions */}
      <div className="mt-4 mb-8 space-y-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-[0_8px_30px_rgba(99,82,204,0.3)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {downloading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              生成 PDF 中...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              下载详细报告
            </>
          )}
        </button>
        <button
          onClick={handleReAnalyze}
          className="w-full py-3.5 rounded-2xl glass text-gray-600 font-medium flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          重新分析
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 rounded-2xl glass text-gray-500 font-medium"
        >
          返回首页
        </button>
      </div>

      <p className="text-center text-xs text-gray-400/70 pb-4">
        分析结果仅供参考，请理性对待感情
      </p>
    </div>
  )
}
