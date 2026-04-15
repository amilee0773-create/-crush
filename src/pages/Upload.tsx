import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import { useApp } from '../context/AppContext'
import type { UserInfo } from '../types'

const MIN_IMAGES = 5

export default function Upload() {
  const navigate = useNavigate()
  const { setAnalysisData } = useApp()
  const [images, setImages] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo>({
    myGender: '',
    targetGender: '',
    relationship: '',
    goal: '',
  })

  const canSubmit = images.length >= MIN_IMAGES

  const handleSubmit = () => {
    if (!canSubmit) return
    setAnalysisData({ images, userInfo })
    navigate('/analyzing')
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 text-sm flex items-center gap-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          返回
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 pr-8">上传截图</h1>
      </div>

      {/* Upload area */}
      <div className="glass rounded-2xl p-4 mb-5 card-float">
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Supplementary info */}
      <div className="glass rounded-2xl p-4 mb-6 card-float">
        <h2 className="text-sm font-bold text-gray-700 mb-4">补充信息 (可选)</h2>

        <div className="space-y-4">
          <OptionRow
            label="你的性别"
            options={[
              { value: 'male', label: '男生' },
              { value: 'female', label: '女生' },
            ]}
            selected={userInfo.myGender}
            onChange={(v) => setUserInfo({ ...userInfo, myGender: v as UserInfo['myGender'] })}
          />

          <OptionRow
            label="对方性别"
            options={[
              { value: 'male', label: '男生' },
              { value: 'female', label: '女生' },
            ]}
            selected={userInfo.targetGender}
            onChange={(v) => setUserInfo({ ...userInfo, targetGender: v as UserInfo['targetGender'] })}
          />

          <OptionRow
            label="你们的关系"
            options={[
              { value: 'stranger', label: '陌生人' },
              { value: 'acquaintance', label: '不太熟' },
              { value: 'friend', label: '朋友' },
              { value: 'flirting', label: '暧昧中' },
            ]}
            selected={userInfo.relationship}
            onChange={(v) => setUserInfo({ ...userInfo, relationship: v as UserInfo['relationship'] })}
          />

          <OptionRow
            label="你的目标"
            options={[
              { value: 'friendship', label: '交朋友' },
              { value: 'romance', label: '谈恋爱' },
            ]}
            selected={userInfo.goal}
            onChange={(v) => setUserInfo({ ...userInfo, goal: v as UserInfo['goal'] })}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-auto pb-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_8px_30px_rgba(99,82,204,0.3)] active:scale-[0.97]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canSubmit ? '开始解码' : `还需上传 ${MIN_IMAGES - images.length} 张截图`}
        </button>
      </div>
    </div>
  )
}

function OptionRow({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(selected === opt.value ? '' : opt.value)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selected === opt.value
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                : 'bg-white/80 text-gray-600 border border-gray-200/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
