import { useRef, type ChangeEvent } from 'react'
import Compressor from 'compressorjs'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
  min?: number
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 1920,
      maxHeight: 1920,
      success(result) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(result)
      },
      error: reject,
    })
  })
}

export default function ImageUploader({ images, onChange, max = 20, min = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = max - images.length
    const toProcess = files.slice(0, remaining)

    const results: string[] = []
    for (const file of toProcess) {
      if (!ACCEPTED.includes(file.type)) {
        alert(`不支持的格式: ${file.name}，请上传 JPG/PNG/WEBP`)
        continue
      }
      if (file.size > MAX_SIZE) {
        alert(`文件过大: ${file.name}，单张不超过 5MB`)
        continue
      }
      try {
        const base64 = await compressImage(file)
        results.push(base64)
      } catch {
        alert(`处理失败: ${file.name}`)
      }
    }

    onChange([...images, ...results])
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          已选 <span className="font-bold text-indigo-500">{images.length}</span> / {max} 张
          {images.length < min && (
            <span className="text-amber-500 ml-2">(至少 {min} 张)</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50/50 transition-colors"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs mt-1">添加</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <p className="text-xs text-gray-400 text-center">
        建议上传包含文字+配图的朋友圈截图，截图越丰富分析越准确
      </p>
    </div>
  )
}
